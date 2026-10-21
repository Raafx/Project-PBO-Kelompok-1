from datetime import timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import LiveTransaction
from app.services.live_transactions import ONLINE_SECONDS, utc_now


def heartbeat_payload(session_id: str, status: str = "shopping") -> dict[str, object]:
    return {
        "session_id": session_id,
        "store_code": "MY-001",
        "cashier_code": "KASIR03",
        "status": status,
        "items": [{"barcode": "8997000400001", "quantity": 2}],
        "payment_method": "cash",
        "payment_ready": False,
        "member_phone": "081255449011",
        "current_action": "Memindai produk",
    }


def test_pos_heartbeat_builds_snapshot_from_real_products(client: TestClient) -> None:
    session_id = "11111111-1111-4111-8111-111111111111"
    response = client.post(
        "/api/v1/live-transactions/heartbeat",
        json=heartbeat_payload(session_id),
    )
    assert response.status_code == 200
    live = response.json()
    assert live["id"] == session_id
    assert live["status"] == "shopping"
    assert live["online"] is True
    assert live["cashier_name"]
    assert live["member_name"] == "Budi Santoso"
    assert live["item_count"] == 2
    assert live["unique_products"] == 1
    assert live["total"] == live["items"][0]["unit_price"] * 2
    assert live["progress"] == 45

    snapshot_response = client.get("/api/v1/admin/live-transactions")
    assert snapshot_response.status_code == 200
    snapshot = snapshot_response.json()
    assert snapshot["sessions"][0]["id"] == session_id


def test_live_workflow_moves_to_payment_and_detects_offline(
    client: TestClient, session: Session
) -> None:
    session_id = "22222222-2222-4222-8222-222222222222"
    payload = heartbeat_payload(session_id, "payment")
    payload["payment_method"] = "qris"
    payload["payment_ready"] = True
    payload["current_action"] = "Pembayaran diterima"
    response = client.post("/api/v1/live-transactions/heartbeat", json=payload)
    assert response.status_code == 200
    assert response.json()["progress"] == 85
    assert response.json()["payment_ready"] is True

    live = session.get(LiveTransaction, session_id)
    assert live is not None
    live.last_seen_at = utc_now() - timedelta(seconds=ONLINE_SECONDS + 1)
    session.commit()
    snapshot = client.get("/api/v1/admin/live-transactions").json()
    stored = next(item for item in snapshot["sessions"] if item["id"] == session_id)
    assert stored["online"] is False
    assert stored["service_ready"] is False


def test_completed_transaction_keeps_transaction_number(client: TestClient) -> None:
    session_id = "33333333-3333-4333-8333-333333333333"
    payload = heartbeat_payload(session_id, "completed")
    payload["payment_ready"] = True
    payload["transaction_no"] = "TRX-TEST-LIVE"
    payload["current_action"] = "Transaksi selesai"
    response = client.post("/api/v1/live-transactions/heartbeat", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert result["progress"] == 100
    assert result["transaction_no"] == "TRX-TEST-LIVE"
    assert result["completed_at"] is not None
