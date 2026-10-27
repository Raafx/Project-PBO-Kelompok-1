import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import get_settings
from app.services.ceo_assistant import (
    SYSTEM_INSTRUCTION,
    build_executive_snapshot,
    executive_fast_reply,
    small_talk_reply,
)


def test_chat_status_and_conversation_crud(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr(get_settings(), "gemini_api_key", "")

    status_response = client.get("/api/v1/admin/ceo-chat/status")
    assert status_response.status_code == 200
    assert status_response.json()["configured"] is False
    assert status_response.json()["project_number"] == "69198748984"

    create_response = client.post(
        "/api/v1/admin/ceo-chat/conversations",
        json={"title": "Cek penjualan"},
    )
    assert create_response.status_code == 201
    conversation = create_response.json()
    assert conversation["title"] == "Cek penjualan"
    assert conversation["messages"] == []

    list_response = client.get("/api/v1/admin/ceo-chat/conversations")
    assert list_response.status_code == 200
    assert [item["id"] for item in list_response.json()] == [conversation["id"]]

    unavailable_response = client.post(
        f"/api/v1/admin/ceo-chat/conversations/{conversation['id']}/messages",
        json={"message": "Bagaimana omzet hari ini?"},
    )
    assert unavailable_response.status_code == 503

    delete_response = client.delete(f"/api/v1/admin/ceo-chat/conversations/{conversation['id']}")
    assert delete_response.status_code == 204


def test_chat_stream_is_saved(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr(get_settings(), "gemini_api_key", "test-key")

    async def fake_stream(*_args, **_kwargs):
        yield "Omzet aktual "
        yield "berasal dari database."

    monkeypatch.setattr("app.api.ceo_chat.stream_gemini_answer", fake_stream)
    conversation = client.post(
        "/api/v1/admin/ceo-chat/conversations",
        json={"title": "Percakapan baru"},
    ).json()
    response = client.post(
        f"/api/v1/admin/ceo-chat/conversations/{conversation['id']}/messages",
        json={"message": "Tolong cek omzet"},
    )

    assert response.status_code == 200
    events = [json.loads(line) for line in response.text.splitlines()]
    assert [event["type"] for event in events] == [
        "user_message",
        "delta",
        "delta",
        "done",
    ]
    assert events[-1]["message"]["content"] == "Omzet aktual berasal dari database."

    saved = client.get("/api/v1/admin/ceo-chat/conversations").json()[0]
    assert saved["title"] == "Tolong cek omzet"
    assert [message["role"] for message in saved["messages"]] == ["user", "assistant"]


def test_executive_snapshot_uses_database(session: Session) -> None:
    snapshot = build_executive_snapshot(session)

    assert snapshot["sumber"] == "database operasional MYMARKET (read-only)"
    assert "30_hari_terakhir" in snapshot["ringkasan"]
    assert snapshot["persediaan"]["produk_aktif"] > 0
    assert isinstance(snapshot["produk_teratas_30_hari"], list)
    assert isinstance(snapshot["performa_produk_30_hari"], list)
    assert isinstance(snapshot["transaksi_terbaru"], list)


def test_copilot_instruction_prefers_natural_conversation() -> None:
    assert 'pesan seperti "halo" dan "tes" cukup' in SYSTEM_INSTRUCTION
    assert 'Jangan memaksakan struktur "Fakta"' in SYSTEM_INSTRUCTION
    assert "Jangan langsung menyimpulkan ada gangguan sistem" in SYSTEM_INSTRUCTION
    assert small_talk_reply("tes") == "Siap, aku online. Mau cek apa?"
    assert small_talk_reply("Halo!") == (
        "Hai! Aku siap bantu. Mau cek penjualan, stok, atau hal lain hari ini?"
    )
    assert small_talk_reply("gimana transaksi hari ini") is None


def test_common_business_questions_are_answered_without_waiting_for_ai(session: Session) -> None:
    snapshot = build_executive_snapshot(session)

    products = executive_fast_reply(
        "Produk apa yang paling laris dalam 30 hari terakhir?", snapshot
    )
    comparison = executive_fast_reply(
        "Bandingkan omzet bulan ini dengan bulan lalu.", snapshot
    )
    stock = executive_fast_reply(
        "Stok apa saja yang perlu segera dibeli ulang?", snapshot
    )

    assert products is not None and "30 hari terakhir" in products
    assert comparison is not None and "Omzet bulan berjalan" in comparison
    assert stock is not None and "stok" in stock.casefold()


def test_product_profit_reply_uses_exact_database_snapshot(
    client: TestClient, session: Session
) -> None:
    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": "8997000400001", "quantity": 2}],
            "payment": {"method": "cash"},
        },
    )
    assert checkout.status_code == 201

    snapshot = build_executive_snapshot(session)
    answer = executive_fast_reply("Berapa keuntungan produk Cerelac?", snapshot)
    transaction_answer = executive_fast_reply(
        f"Barang di transaksi {checkout.json()['transaction_no']} apa saja?",
        snapshot,
    )

    assert answer is not None
    assert "Rp35.800" in answer
    assert "Rp145.800" in answer
    assert transaction_answer is not None
    assert "Nestle Cerelac" in transaction_answer
