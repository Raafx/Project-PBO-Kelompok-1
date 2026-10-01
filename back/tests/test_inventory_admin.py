from fastapi.testclient import TestClient


def test_admin_dashboard_uses_seeded_inventory(client: TestClient) -> None:
    response = client.get("/api/v1/admin/dashboard")
    assert response.status_code == 200
    dashboard = response.json()
    assert dashboard["product_count"] == 9
    assert dashboard["active_supplier_count"] == 3
    assert dashboard["stock_units"] == 199
    assert dashboard["low_stock_count"] == 3
    assert {product["stock_status"] for product in dashboard["low_stock_products"]} == {"low"}


def test_purchase_order_receipt_increases_stock_once(client: TestClient) -> None:
    supplier = client.get("/api/v1/admin/suppliers").json()[0]
    initial_product = client.get("/api/v1/products/barcode/8993175112034").json()

    created = client.post(
        "/api/v1/admin/purchase-orders",
        json={
            "supplier_id": supplier["id"],
            "store_code": "MY-001",
            "notes": "Restock beras untuk akhir pekan",
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
    purchase_order = created.json()
    assert purchase_order["status"] == "draft"
    assert purchase_order["subtotal"] == 340_000

    submitted = client.post(f"/api/v1/admin/purchase-orders/{purchase_order['id']}/submit")
    assert submitted.status_code == 200
    assert submitted.json()["status"] == "ordered"

    received = client.post(
        f"/api/v1/admin/purchase-orders/{purchase_order['id']}/receive",
        json={"items": [{"item_id": purchase_order["items"][0]["id"], "quantity": 2}]},
    )
    assert received.status_code == 200
    assert received.json()["status"] == "partially_received"
    assert received.json()["items"][0]["quantity_received"] == 2

    partially_updated_product = client.get(
        f"/api/v1/products/barcode/{initial_product['barcode']}"
    ).json()
    assert partially_updated_product["stock"] == initial_product["stock"] + 2

    completed = client.post(
        f"/api/v1/admin/purchase-orders/{purchase_order['id']}/receive",
        json={"items": [{"item_id": purchase_order["items"][0]["id"], "quantity": 3}]},
    )
    assert completed.status_code == 200
    assert completed.json()["status"] == "received"
    assert completed.json()["items"][0]["quantity_received"] == 5

    updated_product = client.get(f"/api/v1/products/barcode/{initial_product['barcode']}").json()
    assert updated_product["stock"] == initial_product["stock"] + 5

    duplicate_receipt = client.post(
        f"/api/v1/admin/purchase-orders/{purchase_order['id']}/receive",
        json={},
    )
    assert duplicate_receipt.status_code == 409


def test_manual_adjustment_cannot_make_stock_negative(client: TestClient) -> None:
    product = client.get("/api/v1/products/barcode/8993053710505").json()
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


def test_admin_sales_and_report_use_completed_pos_transactions(client: TestClient) -> None:
    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": "8998866200224", "quantity": 2}],
            "payment": {"method": "qris", "confirmed": True},
        },
    )
    assert checkout.status_code == 201

    sales = client.get("/api/v1/admin/sales")
    assert sales.status_code == 200
    assert sales.json()[0]["transaction_no"] == checkout.json()["transaction_no"]
    assert sales.json()[0]["payment_method"] == "qris"
    assert sales.json()[0]["cashier_name"] == "Athasyahri"

    report = client.get("/api/v1/admin/reports/sales")
    assert report.status_code == 200
    payload = report.json()
    assert payload["total_sales"] == 7_000
    assert payload["transaction_count"] == 1
    assert payload["item_count"] == 2
    assert payload["average_transaction"] == 7_000
    assert payload["estimated_gross_profit"] == 1_400
    assert payload["payment_methods"] == [{"label": "qris", "amount": 7_000, "count": 1}]
    assert payload["top_products"][0]["quantity"] == 2
