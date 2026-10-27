from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AccessRole, Cashier, Product


def test_admin_dashboard_uses_seeded_inventory(client: TestClient) -> None:
    response = client.get("/api/v1/admin/dashboard")
    assert response.status_code == 200
    dashboard = response.json()
    assert dashboard["product_count"] == 28
    assert dashboard["active_supplier_count"] == 3
    assert dashboard["stock_units"] == 1504
    assert dashboard["low_stock_count"] == 4
    assert {product["stock_status"] for product in dashboard["low_stock_products"]} == {
        "low",
        "out",
    }


def test_product_master_crud_and_template_images(client: TestClient) -> None:
    master_response = client.get("/api/v1/admin/products")
    assert master_response.status_code == 200
    master_products = master_response.json()
    template_products = [product for product in master_products if product["image_url"]]
    assert len(template_products) == 28
    assert {product["image_url"] for product in template_products} == {
        f"/ekomart/products/{index:02d}.jpg" for index in range(1, 29)
    }

    created_response = client.post(
        "/api/v1/admin/products",
        json={
            "barcode": "8997000001999",
            "sku": "TEST-PRODUCT",
            "name": "Produk Test",
            "category": "Testing",
            "location": "Rak T-01",
            "image_url": "/ekomart/products/01.jpg",
            "price": 25_000,
            "cost_price": 18_000,
            "reorder_level": 3,
            "is_active": True,
        },
    )
    assert created_response.status_code == 201
    created = created_response.json()
    assert created["stock"] == 0
    assert created["warehouse_stock"] == 0

    updated_response = client.put(
        f"/api/v1/admin/products/{created['id']}",
        json={"name": "Produk Test Update", "price": 27_000},
    )
    assert updated_response.status_code == 200
    assert updated_response.json()["name"] == "Produk Test Update"
    assert updated_response.json()["price"] == 27_000

    archived_response = client.delete(f"/api/v1/admin/products/{created['id']}")
    assert archived_response.status_code == 200
    assert archived_response.json()["is_active"] is False
    assert client.get(f"/api/v1/products/barcode/{created['barcode']}").status_code == 404


def test_direct_purchase_enters_warehouse_then_transfers_to_sales(client: TestClient) -> None:
    supplier = client.get("/api/v1/admin/suppliers").json()[0]
    initial_product = client.get("/api/v1/products/barcode/8997000400010").json()
    initial_stock_item = next(
        item
        for item in client.get("/api/v1/admin/stock").json()
        if item["id"] == initial_product["id"]
    )

    created = client.post(
        "/api/v1/admin/purchases",
        headers={"X-Idempotency-Key": "test-purchase-beras-001"},
        json={
            "supplier_id": supplier["id"],
            "store_code": "MY-001",
            "notes": "Pembelian beras untuk stok gudang",
            "items": [
                {
                    "barcode": initial_product["barcode"],
                    "quantity": 5,
                    "unit_cost": 68_000,
                }
            ],
        },
    )
    assert created.status_code == 201
    purchase = created.json()
    assert purchase["status"] == "received"
    assert purchase["created_by_id"]
    assert purchase["subtotal"] == 340_000
    assert purchase["items"][0]["quantity_received"] == 5

    pos_product = client.get(f"/api/v1/products/barcode/{initial_product['barcode']}").json()
    assert pos_product["stock"] == initial_product["stock"]
    stock_item = next(
        item
        for item in client.get("/api/v1/admin/stock").json()
        if item["id"] == initial_product["id"]
    )
    assert stock_item["warehouse_stock"] == initial_stock_item["warehouse_stock"] + 5

    duplicate = client.post(
        "/api/v1/admin/purchases",
        headers={"X-Idempotency-Key": "test-purchase-beras-001"},
        json={
            "supplier_id": supplier["id"],
            "store_code": "MY-001",
            "items": [
                {
                    "barcode": initial_product["barcode"],
                    "quantity": 5,
                    "unit_cost": 68_000,
                }
            ],
        },
    )
    assert duplicate.status_code == 201
    assert duplicate.json()["id"] == purchase["id"]
    stock_after_retry = next(
        item
        for item in client.get("/api/v1/admin/stock").json()
        if item["id"] == initial_product["id"]
    )
    assert stock_after_retry["warehouse_stock"] == initial_stock_item["warehouse_stock"] + 5

    transfer = client.post(
        "/api/v1/admin/stock/transfers",
        json={
            "product_id": initial_product["id"],
            "quantity": 2,
            "from_area": "warehouse",
            "to_area": "sales",
            "note": "Isi rak kasir",
        },
    )
    assert transfer.status_code == 201
    assert transfer.json()["quantity"] == 2

    updated_product = client.get(f"/api/v1/products/barcode/{initial_product['barcode']}").json()
    assert updated_product["stock"] == initial_product["stock"] + 2
    updated_stock_item = next(
        item
        for item in client.get("/api/v1/admin/stock").json()
        if item["id"] == initial_product["id"]
    )
    assert updated_stock_item["warehouse_stock"] == initial_stock_item["warehouse_stock"] + 3


def test_manual_adjustment_cannot_make_stock_negative(client: TestClient) -> None:
    product = client.get("/api/v1/products/barcode/8997000400009").json()
    rejected = client.post(
        "/api/v1/admin/stock/adjustments",
        json={
            "product_id": product["id"],
            "quantity_change": -(product["stock"] + 1),
            "note": "Koreksi stok opname",
        },
    )
    assert rejected.status_code == 422

    accepted = client.post(
        "/api/v1/admin/stock/adjustments",
        json={
            "product_id": product["id"],
            "quantity_change": -2,
            "note": "Barang rusak saat stok opname",
        },
    )
    assert accepted.status_code == 201
    assert accepted.json()["balance_after"] == product["stock"] - 2


def test_admin_sales_and_report_use_completed_pos_transactions(
    client: TestClient, session: Session
) -> None:
    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": "8997000400001", "quantity": 2}],
            "payment": {
                "method": "qris",
                "confirmed": True,
                "approval_code": "QRIS-REPORT-01",
            },
        },
    )
    assert checkout.status_code == 201

    sales = client.get("/api/v1/admin/sales")
    assert sales.status_code == 200
    assert sales.json()[0]["transaction_no"] == checkout.json()["transaction_no"]
    assert sales.json()[0]["payment_method"] == "qris"
    assert sales.json()[0]["cashier_name"] == "Athasyahri"
    assert sales.json()[0]["items"][0]["product_name"] == "Nestle Cerelac Mixed Fruits & Wheat 400g"
    assert sales.json()[0]["items"][0]["gross_profit"] == 35_800
    assert sales.json()[0]["gross_profit"] == 35_800

    searched = client.get("/api/v1/admin/sales", params={"search": "Cerelac"})
    assert searched.status_code == 200
    assert [sale["id"] for sale in searched.json()] == [checkout.json()["id"]]

    report = client.get("/api/v1/admin/reports/sales")
    assert report.status_code == 200
    payload = report.json()
    assert payload["total_sales"] == 145_800
    assert payload["transaction_count"] == 1
    assert payload["item_count"] == 2
    assert payload["average_transaction"] == 145_800
    assert payload["estimated_gross_profit"] == 35_800
    assert payload["payment_methods"] == [{"label": "qris", "amount": 145_800, "count": 1}]
    assert payload["top_products"][0]["quantity"] == 2
    assert payload["top_products"][0]["gross_profit"] == 35_800
    assert payload["product_performance"][0]["net_revenue"] == 145_800
    assert payload["product_performance"][0]["cost_of_goods"] == 110_000
    assert payload["product_performance"][0]["gross_profit"] == 35_800
    assert payload["daily_sales"][-1]["gross_profit"] == 35_800
    assert payload["monthly_sales"][-1]["gross_profit"] == 35_800
    assert payload["transactions"][0]["items"][0]["quantity"] == 2

    product = session.get(Product, checkout.json()["items"][0]["product_id"])
    assert product is not None
    product.cost_price = 1
    session.commit()
    unchanged = client.get("/api/v1/admin/reports/sales").json()
    assert unchanged["estimated_gross_profit"] == 35_800
    assert unchanged["product_performance"][0]["gross_profit"] == 35_800


def test_role_permissions_limit_admin_pages(client: TestClient, session: Session) -> None:
    cashier_role = session.scalar(select(AccessRole).where(AccessRole.code == "CASHIER"))
    assert cashier_role is not None
    session.add(
        Cashier(
            employee_code="KASIR99",
            full_name="Kasir Terbatas",
            role="cashier",
            role_id=cashier_role.id,
        )
    )
    session.commit()

    cashier_headers = {"X-Actor-Code": "KASIR99"}
    assert client.get("/api/v1/admin/sales", headers=cashier_headers).status_code == 200
    denied = client.get("/api/v1/admin/dashboard", headers=cashier_headers)
    assert denied.status_code == 403
    assert "tidak memiliki akses" in denied.json()["detail"]

    roles = client.get("/api/v1/admin/roles")
    assert roles.status_code == 200
    assert {role["code"] for role in roles.json()} == {
        "OWNER",
        "MANAGER",
        "WAREHOUSE",
        "CASHIER",
    }


def test_purchasing_role_can_read_dependencies_without_stock_write_access(
    client: TestClient, session: Session
) -> None:
    warehouse_role = session.scalar(select(AccessRole).where(AccessRole.code == "WAREHOUSE"))
    assert warehouse_role is not None
    updated = client.put(
        f"/api/v1/admin/roles/{warehouse_role.id}",
        json={"permissions": ["admin.purchasing"]},
    )
    assert updated.status_code == 200

    session.add(
        Cashier(
            employee_code="GUDANG99",
            full_name="Petugas Pembelian",
            role="warehouse",
            role_id=warehouse_role.id,
        )
    )
    session.commit()
    headers = {"X-Actor-Code": "GUDANG99"}

    assert client.get("/api/v1/admin/purchases", headers=headers).status_code == 200
    assert client.get("/api/v1/admin/stock", headers=headers).status_code == 200
    assert client.get("/api/v1/admin/suppliers", headers=headers).status_code == 200
    assert client.get("/api/v1/admin/dashboard", headers=headers).status_code == 403
    assert (
        client.post(
            "/api/v1/admin/stock/adjustments",
            headers=headers,
            json={
                "product_id": client.get("/api/v1/admin/stock", headers=headers).json()[0]["id"],
                "quantity_change": 1,
                "area": "warehouse",
                "note": "Tidak boleh tanpa akses persediaan",
            },
        ).status_code
        == 403
    )
