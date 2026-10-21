from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import AsyncIterator, Sequence
from datetime import datetime, time, timedelta
from functools import lru_cache
from typing import Any
from zoneinfo import ZoneInfo

from google import genai
from google.genai import types
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import (
    CeoChatMessage,
    Payment,
    Product,
    PurchaseOrder,
    Sale,
    SaleItem,
    Supplier,
)

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """Anda adalah teman diskusi bisnis untuk CEO MYMARKET.
Gunakan bahasa Indonesia yang natural, hangat, dan langsung seperti chief of staff yang sedang
berbicara dengan CEO. Ikuti gaya pengguna: sapaan atau pesan seperti "halo" dan "tes" cukup
dijawab singkat dan ramah, tanpa membacakan laporan bisnis yang tidak diminta.

Jawab inti pertanyaan di kalimat pertama. Untuk pertanyaan sederhana, cukup 1-3 paragraf pendek.
Jangan memaksakan struktur "Fakta", "Interpretasi", dan "Rekomendasi" pada setiap jawaban.
Gunakan bullet hanya jika memang membantu membaca beberapa angka atau pilihan. Hindari pembuka
formal, jargon berlebihan, pengulangan pertanyaan, dan kesimpulan yang terlalu dramatis.

Gunakan hanya fakta dalam EXECUTIVE_SNAPSHOT dan jangan mengarang angka atau kondisi bisnis.
Sebutkan periode ketika menyampaikan angka, tetapi tidak perlu mengulang tanggal berkali-kali.
Jika datanya nol, sampaikan apa adanya. Jangan langsung menyimpulkan ada gangguan sistem atau
operasional kecuali ada bukti di snapshot atau pengguna secara khusus meminta analisis penyebab.
Jika data belum cukup, jelaskan singkat data apa yang belum tersedia.

Format rupiah secara natural. Hindari tabel dan heading Markdown. Anda boleh memakai penebalan
atau bullet sederhana jika benar-benar berguna. Anda hanya analis read-only dan tidak boleh
mengaku telah mengubah stok, transaksi, atau data lain.
"""


def small_talk_reply(question: str) -> str | None:
    normalized = " ".join(question.casefold().strip(" .,!?").split())
    if normalized in {"tes", "test", "cek", "ping"}:
        return "Siap, aku online. Mau cek apa?"
    if normalized in {"halo", "hai", "hi", "hello", "selamat pagi", "selamat siang"}:
        return "Hai! Aku siap bantu. Mau cek penjualan, stok, atau hal lain hari ini?"
    if normalized in {"makasih", "terima kasih", "thanks", "thank you"}:
        return "Sama-sama. Kalau ada angka lain yang mau dicek, tinggal bilang."
    return None


def _rupiah(value: Any) -> str:
    return f"Rp{_integer(value):,}".replace(",", ".")


def executive_fast_reply(question: str, snapshot: dict[str, Any]) -> str | None:
    """Answer common dashboard questions locally so they feel instantaneous."""

    normalized = " ".join(question.casefold().strip(" .,!?").split())
    summaries = snapshot.get("ringkasan", {})

    if "produk" in normalized and any(
        word in normalized for word in ("laris", "terlaris", "teratas")
    ):
        products = snapshot.get("produk_teratas_30_hari", [])[:5]
        if not products:
            return "Belum ada penjualan produk yang tercatat dalam 30 hari terakhir."
        lines = ["Produk terlaris dalam 30 hari terakhir:"]
        lines.extend(
            (
                f"- **{item['nama']}** — {_integer(item['jumlah'])} item, "
                f"omzet {_rupiah(item['omzet'])}"
            )
            for item in products
        )
        return "\n".join(lines)

    if "banding" in normalized and "omzet" in normalized:
        current = summaries.get("bulan_berjalan", {})
        previous = summaries.get("bulan_sebelumnya", {})
        current_revenue = _integer(current.get("omzet"))
        previous_revenue = _integer(previous.get("omzet"))
        if previous_revenue == 0:
            comparison = "Bulan sebelumnya belum memiliki omzet pembanding."
        else:
            change = ((current_revenue - previous_revenue) / previous_revenue) * 100
            if change == 0:
                comparison = "Nilainya sama dengan bulan sebelumnya."
            else:
                direction = "naik" if change > 0 else "turun"
                comparison = (
                    f"Omzet sementara {direction} {abs(change):.1f}% "
                    "dibanding bulan sebelumnya."
                )
        return (
            f"Omzet bulan berjalan {_rupiah(current_revenue)} dari "
            f"{_integer(current.get('transaksi'))} transaksi. Bulan sebelumnya "
            f"{_rupiah(previous_revenue)} dari {_integer(previous.get('transaksi'))} transaksi. "
            f"{comparison}"
        )

    if "stok" in normalized and any(
        word in normalized for word in ("beli", "dibeli", "pembelian", "ulang", "kritis")
    ):
        products = snapshot.get("persediaan", {}).get("stok_kritis", [])[:8]
        if not products:
            return "Tidak ada produk aktif yang berada pada atau di bawah batas minimum stok."
        lines = ["Produk yang paling perlu segera dibeli ulang:"]
        lines.extend(
            (
                f"- **{item['nama']}** — total stok "
                f"{_integer(item['stok_kasir']) + _integer(item['stok_gudang'])}, "
                f"batas minimum {_integer(item['batas_minimum'])}"
            )
            for item in products
        )
        return "\n".join(lines)

    if "hari ini" in normalized and any(
        word in normalized for word in ("performa", "penjualan", "omzet", "transaksi")
    ):
        today = summaries.get("hari_ini", {})
        yesterday = summaries.get("kemarin", {})
        today_revenue = _integer(today.get("omzet"))
        yesterday_revenue = _integer(yesterday.get("omzet"))
        if not _integer(today.get("transaksi")):
            return "Hari ini belum ada transaksi tersimpan, jadi omzet masih Rp0."
        if yesterday_revenue:
            change = ((today_revenue - yesterday_revenue) / yesterday_revenue) * 100
            comparison = (
                f"naik {abs(change):.1f}%" if change >= 0 else f"turun {abs(change):.1f}%"
            )
            comparison = f", {comparison} dibanding kemarin"
        else:
            comparison = "; kemarin belum memiliki omzet pembanding"
        return (
            f"Hari ini omzet mencapai {_rupiah(today_revenue)} dari "
            f"{_integer(today.get('transaksi'))} transaksi dan "
            f"{_integer(today.get('item_terjual'))} item{comparison}."
        )

    return None


def _integer(value: Any) -> int:
    return int(value or 0)


def _period_summary(session: Session, start_at: datetime, end_at: datetime) -> dict[str, int]:
    total, transactions, items, discounts = session.execute(
        select(
            func.coalesce(func.sum(Sale.total), 0),
            func.count(Sale.id),
            func.coalesce(func.sum(Sale.item_count), 0),
            func.coalesce(func.sum(Sale.discount), 0),
        ).where(
            Sale.status == "completed",
            Sale.created_at >= start_at,
            Sale.created_at < end_at,
        )
    ).one()
    gross_profit = session.scalar(
        select(
            func.coalesce(func.sum(SaleItem.subtotal - (Product.cost_price * SaleItem.quantity)), 0)
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .join(Product, Product.id == SaleItem.product_id)
        .where(
            Sale.status == "completed",
            Sale.created_at >= start_at,
            Sale.created_at < end_at,
        )
    )
    return {
        "omzet": _integer(total),
        "transaksi": _integer(transactions),
        "item_terjual": _integer(items),
        "rata_rata_transaksi": _integer(total) // _integer(transactions) if transactions else 0,
        "diskon": _integer(discounts),
        "estimasi_laba_kotor": _integer(gross_profit),
    }


def build_executive_snapshot(session: Session) -> dict[str, Any]:
    settings = get_settings()
    now = datetime.now(ZoneInfo(settings.business_timezone))
    today = now.date()
    today_start = datetime.combine(today, time.min)
    tomorrow_start = today_start + timedelta(days=1)
    yesterday_start = today_start - timedelta(days=1)
    month_start = today_start.replace(day=1)
    previous_month_end = month_start
    previous_month_start = (month_start - timedelta(days=1)).replace(day=1)
    thirty_day_start = today_start - timedelta(days=29)

    daily_rows = session.execute(
        select(
            func.date(Sale.created_at),
            func.coalesce(func.sum(Sale.total), 0),
            func.count(Sale.id),
        )
        .where(
            Sale.status == "completed",
            Sale.created_at >= thirty_day_start,
            Sale.created_at < tomorrow_start,
        )
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at))
    ).all()

    top_products = session.execute(
        select(
            SaleItem.barcode,
            SaleItem.product_name,
            func.sum(SaleItem.quantity),
            func.sum(SaleItem.subtotal),
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .where(
            Sale.status == "completed",
            Sale.created_at >= thirty_day_start,
            Sale.created_at < tomorrow_start,
        )
        .group_by(SaleItem.barcode, SaleItem.product_name)
        .order_by(func.sum(SaleItem.subtotal).desc())
        .limit(10)
    ).all()

    category_rows = session.execute(
        select(Product.category, func.sum(SaleItem.subtotal), func.sum(SaleItem.quantity))
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .where(
            Sale.status == "completed",
            Sale.created_at >= thirty_day_start,
            Sale.created_at < tomorrow_start,
        )
        .group_by(Product.category)
        .order_by(func.sum(SaleItem.subtotal).desc())
        .limit(10)
    ).all()

    payment_rows = session.execute(
        select(Payment.method, func.sum(Payment.amount), func.count(Payment.id))
        .join(Sale, Sale.id == Payment.sale_id)
        .where(
            Sale.status == "completed",
            Payment.status == "paid",
            Sale.created_at >= thirty_day_start,
            Sale.created_at < tomorrow_start,
        )
        .group_by(Payment.method)
        .order_by(func.sum(Payment.amount).desc())
    ).all()

    total_stock = Product.stock + Product.warehouse_stock
    low_stock_rows = session.execute(
        select(
            Product.name,
            Product.barcode,
            Product.stock,
            Product.warehouse_stock,
            Product.reorder_level,
        )
        .where(Product.is_active.is_(True), total_stock <= Product.reorder_level)
        .order_by(total_stock, Product.name)
        .limit(20)
    ).all()

    product_count, stock_units, inventory_value = session.execute(
        select(
            func.count(Product.id),
            func.coalesce(func.sum(total_stock), 0),
            func.coalesce(func.sum(total_stock * Product.cost_price), 0),
        ).where(Product.is_active.is_(True))
    ).one()
    active_suppliers = session.scalar(
        select(func.count(Supplier.id)).where(Supplier.is_active.is_(True))
    )
    open_purchases = session.scalar(
        select(func.count(PurchaseOrder.id)).where(
            PurchaseOrder.status.in_(("draft", "ordered", "partially_received"))
        )
    )
    purchase_spend = session.scalar(
        select(func.coalesce(func.sum(PurchaseOrder.subtotal), 0)).where(
            PurchaseOrder.status != "cancelled",
            PurchaseOrder.created_at >= month_start,
            PurchaseOrder.created_at < tomorrow_start,
        )
    )
    recent_purchases = session.execute(
        select(
            PurchaseOrder.po_number,
            PurchaseOrder.status,
            PurchaseOrder.subtotal,
            PurchaseOrder.created_at,
            Supplier.name,
        )
        .join(Supplier, Supplier.id == PurchaseOrder.supplier_id)
        .order_by(PurchaseOrder.created_at.desc())
        .limit(5)
    ).all()
    latest_sale = session.scalar(select(func.max(Sale.created_at)))

    return {
        "dibuat_pada": now.isoformat(),
        "mata_uang": "IDR",
        "sumber": "database operasional MYMARKET (read-only)",
        "periode": {
            "hari_ini": str(today),
            "30_hari": {"dari": str(thirty_day_start.date()), "sampai": str(today)},
            "bulan_berjalan": {"dari": str(month_start.date()), "sampai": str(today)},
            "bulan_sebelumnya": {
                "dari": str(previous_month_start.date()),
                "sampai": str((previous_month_end - timedelta(days=1)).date()),
            },
        },
        "ringkasan": {
            "hari_ini": _period_summary(session, today_start, tomorrow_start),
            "kemarin": _period_summary(session, yesterday_start, today_start),
            "bulan_berjalan": _period_summary(session, month_start, tomorrow_start),
            "bulan_sebelumnya": _period_summary(session, previous_month_start, previous_month_end),
            "30_hari_terakhir": _period_summary(session, thirty_day_start, tomorrow_start),
        },
        "tren_harian_30_hari": [
            {"tanggal": str(day), "omzet": _integer(total), "transaksi": _integer(count)}
            for day, total, count in daily_rows
        ],
        "produk_teratas_30_hari": [
            {
                "barcode": barcode,
                "nama": name,
                "jumlah": _integer(quantity),
                "omzet": _integer(revenue),
            }
            for barcode, name, quantity, revenue in top_products
        ],
        "kategori_30_hari": [
            {"kategori": category, "omzet": _integer(revenue), "jumlah": _integer(quantity)}
            for category, revenue, quantity in category_rows
        ],
        "metode_pembayaran_30_hari": [
            {"metode": method, "nilai": _integer(amount), "transaksi": _integer(count)}
            for method, amount, count in payment_rows
        ],
        "persediaan": {
            "produk_aktif": _integer(product_count),
            "total_unit": _integer(stock_units),
            "nilai_modal": _integer(inventory_value),
            "stok_kritis": [
                {
                    "nama": name,
                    "barcode": barcode,
                    "stok_kasir": _integer(sales_stock),
                    "stok_gudang": _integer(warehouse_stock),
                    "batas_minimum": _integer(reorder_level),
                }
                for name, barcode, sales_stock, warehouse_stock, reorder_level in low_stock_rows
            ],
        },
        "pembelian": {
            "pengeluaran_bulan_berjalan": _integer(purchase_spend),
            "pesanan_terbuka": _integer(open_purchases),
            "supplier_aktif": _integer(active_suppliers),
            "terbaru": [
                {
                    "nomor": number,
                    "supplier": supplier,
                    "status": status,
                    "subtotal": _integer(subtotal),
                    "tanggal": created_at.isoformat(),
                }
                for number, status, subtotal, created_at, supplier in recent_purchases
            ],
        },
        "transaksi_terakhir_tersimpan": latest_sale.isoformat() if latest_sale else None,
    }


@lru_cache
def _client() -> genai.Client:
    settings = get_settings()
    return genai.Client(
        api_key=settings.gemini_api_key,
        http_options=types.HttpOptions(
            timeout=settings.gemini_timeout_seconds * 1000,
            retry_options=types.HttpRetryOptions(
                attempts=settings.gemini_retry_attempts,
                initial_delay=0.25,
                max_delay=1.0,
                jitter=0.1,
            ),
        ),
    )


async def stream_gemini_answer(
    question: str,
    snapshot: dict[str, Any],
    history: Sequence[CeoChatMessage],
) -> AsyncIterator[str]:
    casual_reply = small_talk_reply(question)
    if casual_reply:
        yield casual_reply
        return

    fast_reply = executive_fast_reply(question, snapshot)
    if fast_reply:
        yield fast_reply
        return

    settings = get_settings()
    contents: list[types.Content] = []
    for message in history[-settings.ceo_chat_history_limit :]:
        role = "model" if message.role == "assistant" else "user"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=message.content)])
        )
    context = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":"))
    contents.append(
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(
                    text=f"EXECUTIVE_SNAPSHOT:\n{context}\n\nPERTANYAAN CEO:\n{question}"
                )
            ],
        )
    )
    candidate_models = list(
        dict.fromkeys(
            model.strip()
            for model in (settings.gemini_model, settings.gemini_fallback_model)
            if model.strip()
        )
    )
    last_error: Exception | None = None
    for model in candidate_models:
        emitted = False
        try:
            async with asyncio.timeout(settings.gemini_timeout_seconds):
                stream = await _client().aio.models.generate_content_stream(
                    model=model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        temperature=0.35,
                        max_output_tokens=600,
                    ),
                )
                async for chunk in stream:
                    if chunk.text:
                        emitted = True
                        yield chunk.text
            if emitted:
                return
            raise RuntimeError(f"Model {model} mengembalikan jawaban kosong")
        except Exception as error:
            last_error = error
            if emitted:
                raise
            logger.warning("Model %s gagal sebelum mengirim jawaban; mencoba fallback", model)

    if last_error is not None:
        raise last_error
    raise RuntimeError("Tidak ada model Gemini yang dikonfigurasi")
