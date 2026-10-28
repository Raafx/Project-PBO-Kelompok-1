import asyncio
import json
from datetime import date, datetime
from types import SimpleNamespace

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Sale
from app.services import ceo_assistant
from app.services.ceo_assistant import (
    SYSTEM_INSTRUCTION,
    build_executive_snapshot,
    executive_fast_reply,
    model_answer_is_safe,
    small_talk_reply,
)
from app.services.ceo_queries import answer_business_question


def test_chat_status_and_conversation_crud(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr(get_settings(), "gemini_api_key", "")

    status_response = client.get("/api/v1/admin/ceo-chat/status")
    assert status_response.status_code == 200
    assert status_response.json()["configured"] is True
    assert status_response.json()["model"] == "database"
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
    assert "messages" not in list_response.json()[0]
    detail_response = client.get(f"/api/v1/admin/ceo-chat/conversations/{conversation['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["messages"] == []

    local_response = client.post(
        f"/api/v1/admin/ceo-chat/conversations/{conversation['id']}/messages",
        json={"message": "Bagaimana omzet hari ini?"},
    )
    assert local_response.status_code == 200
    assert [json.loads(line)["type"] for line in local_response.text.splitlines()][-1] == "done"

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
        json={"message": "Berikan insight strategis singkat"},
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

    saved = client.get(f"/api/v1/admin/ceo-chat/conversations/{conversation['id']}").json()
    assert saved["title"] == "Berikan insight strategis singkat"
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
    comparison = executive_fast_reply("Bandingkan omzet bulan ini dengan bulan lalu.", snapshot)
    stock = executive_fast_reply("Stok apa saja yang perlu segera dibeli ulang?", snapshot)

    assert products is not None and "30 hari terakhir" in products
    assert comparison is not None and "Omzet bulan berjalan" in comparison
    assert stock is not None and "stok" in stock.casefold()


def test_daily_revenue_and_follow_up_are_answered_from_snapshot() -> None:
    snapshot = {
        "periode": {"hari_ini": "2026-10-27"},
        "ringkasan": {},
        "tren_harian_bulan_berjalan_dan_sebelumnya": [
            {"tanggal": "2026-10-02", "omzet": 259_400, "transaksi": 10},
            {"tanggal": "2026-10-03", "omzet": 790_350, "transaksi": 14},
            {"tanggal": "2026-10-04", "omzet": 313_500, "transaksi": 9},
        ],
    }
    question = "Omzet tertinggi pada Oktober di tanggal berapa?"

    answer = executive_fast_reply(question, snapshot)
    follow_up = executive_fast_reply(
        "Berapa total omzetnya?",
        snapshot,
        [
            SimpleNamespace(role="user", content=question),
            SimpleNamespace(role="assistant", content=answer),
        ],
    )

    assert answer == (
        "Omzet tertinggi pada Oktober 2026 terjadi pada 3 Oktober 2026, yaitu "
        "Rp790.350 dari 14 transaksi."
    )
    assert follow_up == ("Total omzet pada 3 Oktober 2026 adalah Rp790.350 dari 14 transaksi.")


def test_internal_or_incomplete_model_output_is_rejected() -> None:
    assert model_answer_is_safe("Omzet Oktober adalah Rp9.472.110.") is True
    assert model_answer_is_safe("Omzet tertinggi pada **3 Oktober 20") is False
    assert model_answer_is_safe("for Tone & Constraints: Warm, direct, no read-write") is False


def test_model_outage_returns_clear_answer_without_network(monkeypatch) -> None:
    class FailingModels:
        async def generate_content_stream(self, **_kwargs):
            raise RuntimeError("offline")

    monkeypatch.setattr(
        ceo_assistant,
        "_client",
        lambda: SimpleNamespace(aio=SimpleNamespace(models=FailingModels())),
    )
    answer = asyncio.run(
        anext(ceo_assistant.stream_gemini_answer("Apa strateginya?", {}, []))
    )
    assert "Analisis lanjutan sedang tidak tersedia" in answer


def test_queries_use_live_sales_and_follow_up(client: TestClient, session: Session) -> None:
    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": "0089686010947", "quantity": 2}],
            "payment": {"method": "cash"},
        },
    )
    assert checkout.status_code == 201
    product = answer_business_question(session, "Berapa laba Indomie Original hari ini?")
    by_product = answer_business_question(session, "Performa per produk hari ini")
    transaction = answer_business_question(
        session, f"Rincian transaksi {checkout.json()['transaction_no']}"
    )
    assert product is not None and "Rp1.600" in product and "Rp7.000" in product
    assert by_product is not None and "Indomie Mi Goreng" in by_product
    assert transaction is not None and "Indomie Mi Goreng" in transaction


def test_explicit_period_overrides_conversation_context(session: Session) -> None:
    history = [SimpleNamespace(role="user", content="Omzet tertinggi pada Oktober?")]
    answer = answer_business_question(
        session,
        "Berapa total omzet bulan ini?",
        history,
    )
    assert answer is not None and "Omzet harian tertinggi" not in answer


def test_monthly_peak_and_follow_up_use_same_transaction_totals(
    client: TestClient, session: Session
) -> None:
    for day, quantity in ((3, 1), (4, 2)):
        response = client.post(
            "/api/v1/sales/checkout",
            json={
                "store_code": "MY-001",
                "cashier_code": "KASIR03",
                "items": [{"barcode": "0089686010947", "quantity": quantity}],
                "payment": {"method": "cash"},
            },
        )
        assert response.status_code == 201
        sale = session.query(Sale).filter_by(transaction_no=response.json()["transaction_no"]).one()
        sale.created_at = datetime(2026, 10, day, 12)
        session.commit()

    question = "Omzet tertinggi Oktober di tanggal berapa?"
    answer = answer_business_question(session, question, today=date(2026, 10, 27))
    follow_up = answer_business_question(
        session,
        "Berapa total omzetnya?",
        [SimpleNamespace(role="user", content=question)],
        today=date(2026, 10, 27),
    )
    assert answer is not None and "4 Oktober 2026" in answer and "Rp7.000" in answer
    assert follow_up is not None and "4 Oktober 2026" in follow_up and "Rp7.000" in follow_up


def test_product_profit_reply_uses_exact_database_snapshot(
    client: TestClient, session: Session
) -> None:
    checkout = client.post(
        "/api/v1/sales/checkout",
        json={
            "store_code": "MY-001",
            "cashier_code": "KASIR03",
            "items": [{"barcode": "0089686010947", "quantity": 2}],
            "payment": {"method": "cash"},
        },
    )
    assert checkout.status_code == 201

    snapshot = build_executive_snapshot(session)
    answer = executive_fast_reply("Berapa keuntungan produk Indomie Original?", snapshot)
    transaction_answer = executive_fast_reply(
        f"Barang di transaksi {checkout.json()['transaction_no']} apa saja?",
        snapshot,
    )

    assert answer is not None
    assert "Rp1.600" in answer
    assert "Rp7.000" in answer
    assert transaction_answer is not None
    assert "Indomie Mi Goreng" in transaction_answer
