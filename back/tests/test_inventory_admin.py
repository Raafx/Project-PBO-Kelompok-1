from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.indonesia_catalog import INDONESIAN_PRODUCTS
from app.models import AccessRole, Cashier, FinanceEntry, Product, Sale


def test_admin_dashboard_uses_seeded_inventory(client: TestClient) -> None:
    response = client.get("/api/v1/admin/dashboard")
    assert response.status_code == 200
    dashboard = response.json()
    assert dashboard["product_count"] == 48
    assert dashboard["active_supplier_count"] == 3
    assert dashboard["stock_units"] == 6_981
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
    assert len(template_products) == 48
    assert {product["image_url"] for product in template_products} == {
        product.image_url for product in INDONESIAN_PRODUCTS
    }

    created_response = client.post(
        "/api/v1/admin/products",
        json={
            "barcode": "8997000001999",
            "sku": "TEST-PRODUCT",
            "name": "Produk Test",
            "category": "Testing",
            "location": "Rak T-01",
            "image_url": "/products/indonesia/0089686010947.jpg",
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
    initial_product = client.get("/api/v1/products/barcode/8888900415009").json()
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
    product = client.get("/api/v1/products/barcode/8996001600269").json()
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
            "items": [{"barcode": "0089686010947", "quantity": 2}],
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
    assert sales.json()[0]["items"][0]["product_name"] == "Indomie Mi Goreng Original 85g"
    assert sales.json()[0]["items"][0]["gross_profit"] == 1_600
    assert sales.json()[0]["gross_profit"] == 1_600

    sale_row = session.get(Sale, checkout.json()["id"])
    assert sale_row is not None
    sale_day = sale_row.created_at.date().isoformat()
    filtered = client.get(
        "/api/v1/admin/sales",
        params={
            "date_from": sale_day,
            "date_to": sale_day,
            "status": "completed",
            "payment_method": "qris",
        },
    )
    assert [row["id"] for row in filtered.json()] == [sale_row.id]
    by_product = client.get(
        "/api/v1/admin/sales",
        params={"product_id": checkout.json()["items"][0]["product_id"]},
    )
    assert [row["id"] for row in by_product.json()] == [sale_row.id]
    assert client.get(
        "/api/v1/admin/sales", params={"payment_method": "cash"}
    ).json() == []
    assert client.get(
        "/api/v1/admin/sales", params={"offset": 1, "limit": 1}
    ).json() == []

    searched = client.get("/api/v1/admin/sales", params={"search": "Indomie"})
    assert searched.status_code == 200
    assert [sale["id"] for sale in searched.json()] == [checkout.json()["id"]]

    report = client.get("/api/v1/admin/reports/sales")
    assert report.status_code == 200
    payload = report.json()
    assert payload["total_sales"] == 7_000
    assert payload["transaction_count"] == 1
    assert payload["item_count"] == 2
    assert payload["average_transaction"] == 7_000
    assert payload["estimated_gross_profit"] == 1_600
    assert payload["payment_methods"] == [{"label": "qris", "amount": 7_000, "count": 1}]
    assert payload["top_products"][0]["quantity"] == 2
    assert payload["top_products"][0]["gross_profit"] == 1_600
    assert payload["product_performance"][0]["net_revenue"] == 7_000
    assert payload["product_performance"][0]["cost_of_goods"] == 5_400
    assert payload["product_performance"][0]["gross_profit"] == 1_600
    assert payload["daily_sales"][-1]["gross_profit"] == 1_600
    assert payload["monthly_sales"][-1]["gross_profit"] == 1_600
    assert payload["transactions"][0]["items"][0]["quantity"] == 2

    product_id = checkout.json()["items"][0]["product_id"]
    options = client.get("/api/v1/admin/reports/product-options")
    assert options.status_code == 200
    assert any(option["id"] == product_id for option in options.json())
    product_analysis = client.get(
        f"/api/v1/admin/reports/products/{product_id}",
        params={"date_from": sale_day, "date_to": sale_day},
    )
    assert product_analysis.status_code == 200
    assert product_analysis.json()["product"]["quantity"] == 2
    assert product_analysis.json()["product"]["cost_of_goods"] == 5_400
    assert product_analysis.json()["daily_sales"] == [
        {
            "date": sale_day,
            "transaction_count": 1,
            "quantity": 2,
            "net_revenue": 7_000,
            "cost_of_goods": 5_400,
            "gross_profit": 1_600,
        }
    ]
    assert product_analysis.json()["monthly_comparison"] == [
        {
            "month": sale_row.created_at.date().replace(day=1).isoformat(),
            "transaction_count": 1,
            "quantity": 2,
            "gross_revenue": 7_000,
            "discount": 0,
            "net_revenue": 7_000,
            "cost_of_goods": 5_400,
            "gross_profit": 1_600,
            "margin_percentage": 22.86,
            "average_unit_price": 3_500,
        }
    ]
    unsold_id = next(option["id"] for option in options.json() if option["id"] != product_id)
    unsold = client.get(
        f"/api/v1/admin/reports/products/{unsold_id}",
        params={"date_from": sale_day, "date_to": sale_day},
    ).json()
    assert unsold["product"]["quantity"] == 0
    assert unsold["daily_sales"][0]["gross_profit"] == 0

    product = session.get(Product, checkout.json()["items"][0]["product_id"])
    assert product is not None
    product.cost_price = 1
    session.commit()
    unchanged = client.get("/api/v1/admin/reports/sales").json()
    assert unchanged["estimated_gross_profit"] == 1_600
    assert unchanged["product_performance"][0]["gross_profit"] == 1_600
    assert client.get(
        f"/api/v1/admin/reports/products/{product_id}",
        params={"date_from": sale_day, "date_to": sale_day},
    ).json()["product"]["gross_profit"] == 1_600

    session.add(
        FinanceEntry(
            entry_type="expense",
            reference_no="EXP-REPORT-001",
            amount=2_000,
            status="paid",
            created_by_id=sale_row.cashier_id,
            created_at=sale_row.created_at,
        )
    )
    session.add(
        FinanceEntry(
            entry_type="expense",
            reference_no="EXP-REPORT-CANCELLED",
            amount=10_000,
            status="cancelled",
            created_by_id=sale_row.cashier_id,
            created_at=sale_row.created_at,
        )
    )
    session.commit()
    with_expense = client.get(
        "/api/v1/admin/reports/sales",
        params={"date_from": sale_day, "date_to": sale_day},
    ).json()
    assert with_expense["cost_of_goods"] == 5_400
    assert with_expense["expenses"] == 2_000
    assert with_expense["net_profit"] == -400
    assert with_expense["daily_sales"][0]["expenses"] == 2_000
    assert with_expense["daily_sales"][0]["net_profit"] == -400
    assert with_expense["monthly_sales"][0]["net_profit"] == -400
    operations = client.get("/api/v1/admin/reports/operations").json()
    assert operations["gross_profit"] == 1_600
    assert operations["expenses"] == 2_000
    assert operations["net_profit"] == -400


def test_product_analysis_compares_several_months(
    client: TestClient, session: Session
) -> None:
    sale_ids: list[str] = []
    for number in (1, 2):
        response = client.post(
            "/api/v1/sales/checkout",
            json={
                "store_code": "MY-001",
                "cashier_code": "KASIR03",
                "items": [{"barcode": "0089686010947", "quantity": 1}],
                "payment": {
                    "method": "qris",
                    "confirmed": True,
                    "approval_code": f"QRIS-COMPARE-{number}",
                },
            },
        )
        assert response.status_code == 201
        sale_ids.append(response.json()["id"])

    august_sale = session.get(Sale, sale_ids[0])
    september_sale = session.get(Sale, sale_ids[1])
    assert august_sale is not None and september_sale is not None
    august_sale.created_at = datetime(2026, 8, 15, 10, 0)
    september_sale.created_at = datetime(2026, 9, 15, 10, 0)
    session.commit()

    product_id = august_sale.items[0].product_id
    response = client.get(
        f"/api/v1/admin/reports/products/{product_id}",
        params={"date_from": "2026-08-01", "date_to": "2026-10-31"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["product"]["quantity"] == 2
    assert payload["product"]["net_revenue"] == 7_000
    assert [row["month"] for row in payload["monthly_comparison"]] == [
        "2026-08-01",
        "2026-09-01",
        "2026-10-01",
    ]
    assert [row["quantity"] for row in payload["monthly_comparison"]] == [1, 1, 0]
    assert [row["gross_profit"] for row in payload["monthly_comparison"]] == [
        800,
        800,
        0,
    ]


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
