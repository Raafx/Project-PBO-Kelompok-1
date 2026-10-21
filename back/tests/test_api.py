from fastapi.testclient import TestClient


def checkout_payload(**payment_overrides: object) -> dict:
    payment = {"method": "cash", **payment_overrides}
    return {
        "store_code": "MY-001",
        "cashier_code": "KASIR03",
        "member_phone": "081255449011",
        "items": [
            {"barcode": "8997000400001", "quantity": 2},
            {"barcode": "8997000400002", "quantity": 1},
        ],
        "payment": payment,
    }


def test_health_checks_database(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "mysql"}


def test_product_lookup_by_barcode(client: TestClient) -> None:
    response = client.get("/api/v1/products/barcode/8997000400010")
    assert response.status_code == 200
    assert response.json()["name"] == "Kembang Kol Segar 1kg"
    assert response.json()["price"] == 29_900


def test_checkout_uses_database_prices_and_exact_cash(client: TestClient) -> None:
    stock_before = client.get("/api/v1/products/barcode/8997000400001").json()["stock"]
    response = client.post(
        "/api/v1/sales/checkout",
        json=checkout_payload(),
        headers={"X-Idempotency-Key": "register-1-sale-1"},
    )
    assert response.status_code == 201
    sale = response.json()
    assert sale["subtotal"] == 194_700
    assert sale["total"] == 194_700
    assert sale["item_count"] == 3
    assert sale["payment"]["received_amount"] == 194_700
    assert sale["payment"]["change_amount"] == 0
    stock_after = client.get("/api/v1/products/barcode/8997000400001").json()["stock"]
    assert stock_after == stock_before - 2

    repeated = client.post(
        "/api/v1/sales/checkout",
        json=checkout_payload(),
        headers={"X-Idempotency-Key": "register-1-sale-1"},
    )
    assert repeated.status_code == 201
    assert repeated.json()["id"] == sale["id"]
    stock_after_retry = client.get("/api/v1/products/barcode/8997000400001").json()["stock"]
    assert stock_after_retry == stock_after


def test_checkout_rejects_quantity_above_available_stock(client: TestClient) -> None:
    response = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": "8997000400010", "quantity": 999}],
            "payment": {"method": "cash"},
        },
    )
    assert response.status_code == 422
    assert "tidak cukup" in response.json()["detail"]


def test_checkout_rejects_cashier_identity_different_from_login(
    client: TestClient,
) -> None:
    payload = checkout_payload()
    payload["cashier_code"] = "CASH02"

    response = client.post("/api/v1/sales/checkout", json=payload)

    assert response.status_code == 403
    assert response.json()["detail"] == "Identitas kasir tidak sesuai dengan sesi login"


def test_checkout_rejects_insufficient_cash(client: TestClient) -> None:
    response = client.post(
        "/api/v1/sales/checkout",
        json=checkout_payload(received_amount=10_000),
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "Uang diterima kurang"


def test_qris_requires_confirmation(client: TestClient) -> None:
    unconfirmed = client.post(
        "/api/v1/sales/checkout",
        json=checkout_payload(method="qris", confirmed=False),
    )
    assert unconfirmed.status_code == 422

    confirmed = client.post(
        "/api/v1/sales/checkout",
        json=checkout_payload(
            method="qris",
            confirmed=True,
            approval_code="QRIS-123456",
        ),
    )
    assert confirmed.status_code == 201
    assert confirmed.json()["payment"]["method"] == "qris"


def test_edc_requires_card_details_and_stores_only_last_four(client: TestClient) -> None:
    rejected = client.post(
        "/api/v1/sales/checkout",
        json=checkout_payload(method="edc", confirmed=True),
    )
    assert rejected.status_code == 422

    confirmed = client.post(
        "/api/v1/sales/checkout",
        json=checkout_payload(
            method="edc",
            confirmed=True,
            card_type="debit",
            card_number="4111111111111111",
            approval_code="EDC-654321",
        ),
    )
    assert confirmed.status_code == 201
    payment = confirmed.json()["payment"]
    assert payment["method"] == "edc"
    assert payment["card_type"] == "debit"
    assert payment["card_last4"] == "1111"
    assert "4111111111111111" not in confirmed.text


def test_hold_transaction(client: TestClient) -> None:
    payload = checkout_payload()
    payload.pop("payment")
    response = client.post("/api/v1/sales/hold", json=payload)
    assert response.status_code == 201
    assert response.json()["status"] == "held"
    holds = client.get("/api/v1/sales/holds")
    assert [item["id"] for item in holds.json()] == [response.json()["id"]]
