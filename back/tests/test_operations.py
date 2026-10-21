from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AccessRole, Cashier
from app.services.operations import hash_secret


def test_login_shift_cash_and_close(client: TestClient) -> None:
    login = client.post(
        "/api/v1/auth/login",
        json={"identity": "KASIR03", "password": "admin12345"},
    )
    assert login.status_code == 200
    assert login.json()["status"] == "authenticated"
    assert login.json()["employee_code"] == "KASIR03"

    opened = client.post(
        "/api/v1/shifts/open",
        json={"store_code": "MY-001", "cashier_code": "KASIR03", "opening_cash": 100_000},
    )
    assert opened.status_code == 201
    shift_id = opened.json()["id"]

    cash_out = client.post(
        f"/api/v1/shifts/{shift_id}/cash-movements",
        json={
            "cashier_code": "KASIR03",
            "movement_type": "cash_out",
            "category": "Operasional",
            "amount": 10_000,
            "note": "Parkir",
        },
    )
    assert cash_out.status_code == 200
    assert cash_out.json()["expected_cash"] == 90_000

    closed = client.post(
        f"/api/v1/shifts/{shift_id}/close",
        json={"cashier_code": "KASIR03", "closing_cash": 88_000},
    )
    assert closed.status_code == 200
    assert closed.json()["difference"] == -2_000


def test_catalog_promotion_member_and_finance(client: TestClient) -> None:
    catalog = client.post(
        "/api/v1/admin/catalog-options",
        json={"kind": "brand", "code": "tes-brand", "name": "Tes Brand"},
    )
    assert catalog.status_code == 200
    assert catalog.json()["code"] == "TES-BRAND"

    products = client.get("/api/v1/admin/products").json()
    product = next(item for item in products if item["stock"] >= 2)
    now = datetime.now(UTC)
    promotion = client.post(
        "/api/v1/admin/promotions",
        json={
            "code": "TEST10",
            "name": "Diskon test",
            "promotion_type": "percent",
            "product_id": product["id"],
            "value": 10,
            "min_quantity": 1,
            "starts_at": (now - timedelta(hours=1)).isoformat(),
            "ends_at": (now + timedelta(hours=1)).isoformat(),
        },
    )
    assert promotion.status_code == 200

    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": product["barcode"], "quantity": 1}],
            "payment": {"method": "cash", "received_amount": product["price"]},
        },
    )
    assert checkout.status_code == 201
    assert checkout.json()["discount"] == product["price"] // 10

    member = client.post(
        "/api/v1/admin/members",
        json={"phone": "081234567890", "full_name": "Member Baru"},
    )
    assert member.status_code == 200

    finance = client.post(
        "/api/v1/admin/finance",
        json={
            "entry_type": "expense",
            "amount": 50_000,
            "status": "paid",
            "note": "Beli galon",
        },
    )
    assert finance.status_code == 200
    assert finance.json()["amount"] == 50_000

    snapshot = client.get("/api/v1/admin/operations")
    assert snapshot.status_code == 200
    assert snapshot.json()["finance_entries"]


def test_purchase_order_receive_stock_count_and_void(client: TestClient) -> None:
    product = client.get("/api/v1/admin/products").json()[0]
    supplier = client.get("/api/v1/admin/suppliers").json()[0]
    order_response = client.post(
        "/api/v1/admin/purchase-orders",
        json={
            "supplier_id": supplier["id"],
            "store_code": "MY-001",
            "items": [
                {
                    "barcode": product["barcode"],
                    "quantity": 4,
                    "unit_cost": product["cost_price"],
                }
            ],
        },
    )
    assert order_response.status_code == 200
    order = order_response.json()
    received = client.post(
        f"/api/v1/admin/purchase-orders/{order['id']}/receive",
        json={"items": [{"item_id": order["items"][0]["id"], "quantity_received": 4}]},
    )
    assert received.status_code == 200
    assert received.json()["status"] == "received"

    counted = client.post(
        "/api/v1/admin/stock-counts",
        json={
            "product_id": product["id"],
            "stock_area": "warehouse",
            "physical_quantity": 3,
            "note": "Opname test",
        },
    )
    assert counted.status_code == 200

    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": product["barcode"], "quantity": 1}],
            "payment": {"method": "cash", "received_amount": product["price"]},
        },
    )
    transaction_no = checkout.json()["transaction_no"]
    cancelled = client.post(
        f"/api/v1/sales/{transaction_no}/void",
        json={
            "supervisor_code": "KASIR03",
            "supervisor_pin": "123456",
            "reason": "Salah input transaksi",
        },
    )
    assert cancelled.status_code == 200


def test_excel_barcode_branch_account_and_auto_po(client: TestClient) -> None:
    products = client.get("/api/v1/admin/products").json()
    barcode = client.get(f"/api/v1/products/{products[0]['id']}/barcode.svg")
    assert barcode.status_code == 200
    assert barcode.headers["content-type"].startswith("image/svg+xml")

    exported = client.get("/api/v1/admin/products/export.xlsx")
    assert exported.status_code == 200
    imported = client.post(
        "/api/v1/admin/products/import.xlsx",
        files={
            "file": (
                "produk.xlsx",
                exported.content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        },
    )
    assert imported.status_code == 200
    assert imported.json()["updated"] == len(products)

    branch = client.post(
        "/api/v1/admin/stores",
        json={
            "code": "MY-002",
            "name": "MYMARKET Cabang Dua",
            "address": "Samarinda",
            "timezone": "Asia/Makassar",
        },
    )
    assert branch.status_code == 201

    supplier = client.get("/api/v1/admin/suppliers").json()[0]
    automatic = client.post(
        "/api/v1/admin/purchase-orders/auto",
        json={"supplier_id": supplier["id"], "store_code": "MY-001"},
    )
    assert automatic.status_code == 200
    assert automatic.json()["items"]

    profile = client.put(
        "/api/v1/auth/profile",
        json={"full_name": "Athasyahri Syawal", "email": "athasyahri@mymarket.local"},
    )
    assert profile.status_code == 200
    pin = client.post(
        "/api/v1/auth/change-pin",
        json={"current_pin": "123456", "new_pin": "654321"},
    )
    assert pin.status_code == 204


def test_regular_cashier_cannot_approve_void(client: TestClient, session: Session) -> None:
    cashier_role = session.scalar(select(AccessRole).where(AccessRole.code == "CASHIER"))
    assert cashier_role is not None
    session.add(
        Cashier(
            employee_code="CASH02",
            full_name="Kasir Biasa",
            role="cashier",
            role_id=cashier_role.id,
            pin_hash=hash_secret("112233"),
            is_active=True,
        )
    )
    session.commit()
    product = next(item for item in client.get("/api/v1/admin/products").json() if item["stock"])
    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": product["barcode"], "quantity": 1}],
            "payment": {"method": "cash", "received_amount": product["price"]},
        },
    )
    denied = client.post(
        f"/api/v1/sales/{checkout.json()['transaction_no']}/void",
        json={
            "supervisor_code": "CASH02",
            "supervisor_pin": "112233",
            "reason": "Mencoba void sendiri",
        },
    )
    assert denied.status_code == 403


def test_pos_configuration_controls_tax(client: TestClient) -> None:
    for key, label, value in (
        ("tax.rate", "PPN (%)", "10"),
        ("tax.included", "Harga termasuk pajak", "false"),
        ("receipt.paper", "Ukuran kertas", "58"),
    ):
        response = client.put(
            f"/api/v1/admin/settings/{key}",
            json={
                "group_name": "tax" if key.startswith("tax") else "receipt",
                "label": label,
                "value": value,
            },
        )
        assert response.status_code == 200

    config = client.get("/api/v1/pos/config")
    assert config.status_code == 200
    assert config.json()["tax_rate"] == 10
    assert config.json()["receipt_paper"] == "58"

    product = next(item for item in client.get("/api/v1/admin/products").json() if item["stock"])
    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": product["barcode"], "quantity": 1}],
            "payment": {"method": "cash", "received_amount": product["price"] * 2},
        },
    )
    assert checkout.status_code == 201
    assert checkout.json()["tax"] == product["price"] // 10
    assert checkout.json()["total"] == product["price"] + product["price"] // 10
