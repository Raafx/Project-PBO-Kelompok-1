"""Exact, read-only answers to common executive questions.

The model may explain business data, but numbers shown by this module come from
the same sales tables and aggregation service used by the admin reports.
"""

from __future__ import annotations

import re
from calendar import monthrange
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import CeoChatMessage, Product, Sale
from app.services.reporting import period_summary, product_performance

MONTHS = (
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
)
STOP_WORDS = {
    "apa",
    "saja",
    "paling",
    "terlaris",
    "tertinggi",
    "terbesar",
    "teratas",
    "keuntungan",
    "berapa",
    "bagaimana",
    "barang",
    "bandingkan",
    "bulan",
    "cek",
    "dalam",
    "dari",
    "dan",
    "dengan",
    "di",
    "hari",
    "harga",
    "ini",
    "itu",
    "jumlah",
    "laris",
    "ke",
    "laba",
    "lalu",
    "kemarin",
    "minggu",
    "tahun",
    "sebelumnya",
    "omzet",
    "pada",
    "per",
    "masing",
    "tiap",
    "semua",
    "seluruh",
    "penjualan",
    "performa",
    "produk",
    "rasa",
    "selama",
    "stok",
    "tanggal",
    "terakhir",
    "terjual",
    "total",
    "untung",
    "unit",
    "untuk",
    "tolong",
    "yang",
    "nya",
}


@dataclass(frozen=True)
class Period:
    start: date
    end: date
    label: str

    @property
    def bounds(self) -> tuple[datetime, datetime]:
        return datetime.combine(self.start, time.min), datetime.combine(
            self.end + timedelta(days=1), time.min
        )


def _money(value: int | None) -> str:
    return f"Rp{int(value or 0):,}".replace(",", ".")


def _date_label(value: date) -> str:
    return f"{value.day} {MONTHS[value.month - 1]} {value.year}"


def _text(value: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", value.casefold()))


def _question_with_context(question: str, history: Sequence[CeoChatMessage]) -> tuple[str, bool]:
    current = _text(question)
    explicit_period = bool(
        re.search(
            r"\b(?:hari ini|kemarin|bulan ini|bulan lalu|minggu ini|minggu lalu|"
            r"tahun ini|tahun lalu|\d+ hari|20\d{2})\b",
            current,
        )
        or any(re.search(rf"\b{name.casefold()}\b", current) for name in MONTHS)
    )
    refers_back = bool(re.search(r"\b(nya|tadi|tersebut|itu)\b", current)) or current.startswith(
        ("berapa total", "berapa jumlah", "jadi berapa")
    )
    if not refers_back or explicit_period:
        return question, False
    previous = next(
        (
            item.content
            for item in reversed(history)
            if item.role == "user" and item.content.strip()
        ),
        "",
    )
    return (f"{previous} {question}", True) if previous else (question, False)


def _period(question: str, today: date, *, default_days: int = 30) -> Period:
    normalized = _text(question)
    exact_date = re.search(r"\b(20\d{2})-(\d{1,2})-(\d{1,2})\b", question)
    if exact_date:
        try:
            day = date(*(int(part) for part in exact_date.groups()))
            return Period(day, day, _date_label(day))
        except ValueError:
            pass
    month_match = next(
        (
            (number, name)
            for number, name in enumerate(MONTHS, 1)
            if re.search(rf"\b{name.casefold()}\b", normalized)
        ),
        None,
    )
    year_match = re.search(r"\b20\d{2}\b", normalized)
    if month_match:
        number, month_name = month_match
        year = int(year_match.group()) if year_match else today.year - (number > today.month)
        day_match = re.search(rf"\b([0-3]?\d)\s+{month_name.casefold()}\b", normalized)
        if day_match:
            try:
                day = date(year, number, int(day_match.group(1)))
                return Period(day, day, _date_label(day))
            except ValueError:
                pass
        start = date(year, number, 1)
        next_month = date(year + (number == 12), number % 12 + 1, 1)
        end = min(next_month - timedelta(days=1), today)
        return Period(start, end, f"{month_name} {year}")
    if "kemarin" in normalized:
        day = today - timedelta(days=1)
        return Period(day, day, _date_label(day))
    if "hari ini" in normalized:
        return Period(today, today, _date_label(today))
    if "bulan lalu" in normalized or "bulan sebelumnya" in normalized:
        end = today.replace(day=1) - timedelta(days=1)
        return Period(end.replace(day=1), end, f"{MONTHS[end.month - 1]} {end.year}")
    if "bulan ini" in normalized or "bulan berjalan" in normalized:
        return Period(today.replace(day=1), today, f"{MONTHS[today.month - 1]} {today.year}")
    if "minggu lalu" in normalized or "pekan lalu" in normalized:
        end = today - timedelta(days=today.weekday() + 1)
        return Period(end - timedelta(days=6), end, "minggu lalu")
    if "minggu ini" in normalized or "pekan ini" in normalized:
        return Period(today - timedelta(days=today.weekday()), today, "minggu ini")
    if "tahun lalu" in normalized or "tahun sebelumnya" in normalized:
        year = today.year - 1
        return Period(date(year, 1, 1), date(year, 12, 31), f"tahun {year}")
    if "tahun ini" in normalized:
        return Period(date(today.year, 1, 1), today, f"tahun {today.year}")
    if year_match and ("tahun" in normalized or re.fullmatch(r"20\d{2}", normalized)):
        year = int(year_match.group())
        return Period(date(year, 1, 1), min(date(year, 12, 31), today), f"tahun {year}")
    days_match = re.search(r"\b(\d{1,3})\s+hari\b", normalized)
    if days_match:
        days = min(max(int(days_match.group(1)), 1), 366)
        return Period(today - timedelta(days=days - 1), today, f"{days} hari terakhir")
    return Period(today - timedelta(days=default_days - 1), today, f"{default_days} hari terakhir")


def _product_match(question: str, products: list[Product]) -> tuple[Product | None, list[Product]]:
    normalized = _text(question)
    tokens = set(normalized.split()) - STOP_WORDS
    ranked: list[tuple[int, Product]] = []
    for product in products:
        name = _text(product.name)
        if product.barcode in normalized or (
            product.sku and product.sku.casefold() in question.casefold()
        ):
            ranked.append((100, product))
            continue
        name_tokens = set(name.split())
        overlap = tokens & name_tokens
        if overlap:
            score = sum(3 if token not in {"mi", "milk", "air"} else 1 for token in overlap)
            if all(token in name_tokens for token in tokens):
                score += 4
            ranked.append((score, product))
    if not ranked:
        return None, []
    ranked.sort(key=lambda pair: (-pair[0], pair[1].name))
    best_score = ranked[0][0]
    matches = [product for score, product in ranked if score == best_score]
    return (matches[0], []) if len(matches) == 1 else (None, matches[:5])


def _transaction_answer(session: Session, question: str) -> str | None:
    match = re.search(r"\b(?:DMY|TRX|MY)-[A-Z0-9-]{8,40}\b", question, re.IGNORECASE)
    if not match:
        return None
    sale = session.scalar(select(Sale).where(Sale.transaction_no == match.group().upper()))
    if sale is None:
        return f"Transaksi {match.group().upper()} tidak ditemukan. Periksa nomor transaksinya."
    if sale.status != "completed":
        return (
            f"Transaksi {sale.transaction_no} berstatus {sale.status}, "
            "jadi tidak dihitung sebagai penjualan selesai."
        )
    gross_profit = sum(item.gross_profit for item in sale.items)
    lines = [
        f"Transaksi {sale.transaction_no} pada {_date_label(sale.created_at.date())}: "
        f"total {_money(sale.total)}, {sale.item_count} item, laba kotor {_money(gross_profit)}."
    ]
    lines.extend(
        f"- {item.product_name}: {item.quantity} × {_money(item.unit_price)} "
        f"= {_money(item.subtotal)}"
        for item in sale.items
    )
    return "\n".join(lines)


def answer_business_question(
    session: Session,
    question: str,
    history: Sequence[CeoChatMessage] = (),
    *,
    today: date | None = None,
) -> str | None:
    """Return a grounded answer, or None for a qualitative model-only question."""

    if today is None:
        from zoneinfo import ZoneInfo

        today = datetime.now(ZoneInfo(get_settings().business_timezone)).date()
    current = _text(question)
    if current in {"halo", "hai", "hi", "hello", "tes", "test", "ping"}:
        return "Hai! Saya siap membantu analisis penjualan, produk, transaksi, dan stok MYMARKET."

    transaction = _transaction_answer(session, question)
    if transaction:
        return transaction

    contextual, follow_up = _question_with_context(question, history)
    intent = _text(contextual)
    period = _period(contextual, today)
    start_at, end_at = period.bounds

    if any(
        word in intent
        for word in ("kenapa", "mengapa", "penyebab", "strategi", "saran", "rekomendasi")
    ):
        return None

    product_words = any(
        word in intent
        for word in (
            "produk", "barang", "stok", "harga", "laris", "laba", "untung", "omzet", "performa"
        )
    )
    if product_words:
        products = list(session.scalars(select(Product).where(Product.is_active.is_(True))).all())
        product, ambiguous = _product_match(contextual, products)
        if ambiguous:
            names = ", ".join(item.name for item in ambiguous)
            return f"Produk yang dimaksud belum spesifik. Pilih salah satu: {names}."
        if product:
            if "stok" in intent:
                total = product.stock + product.warehouse_stock
                return (
                    f"Stok {product.name}: {product.stock} di kasir dan {product.warehouse_stock} "
                    f"di gudang, total {total} unit. Batas minimum {product.reorder_level} unit."
                )
            if "harga" in intent and not any(word in intent for word in ("untung", "laba")):
                return (
                    f"Harga jual {product.name} saat ini {_money(product.price)} "
                    f"per {product.unit}."
                )
            performance = next(
                (
                    item
                    for item in product_performance(session, start_at, end_at)
                    if item["product_id"] == product.id
                ),
                None,
            )
            if not performance:
                return f"{product.name} belum tercatat terjual pada {period.label}."
            return (
                f"{product.name} pada {period.label}: {performance['quantity']} unit dalam "
                f"{performance['transaction_count']} transaksi; omzet bersih "
                f"{_money(performance['net_revenue'])}, "
                f"HPP {_money(performance['cost_of_goods'])}, "
                f"laba kotor {_money(performance['gross_profit'])}, margin "
                f"{performance['margin_percentage']:.2f}%."
            )

        identifying_tokens = {
            token for token in intent.split() if token not in STOP_WORDS and not token.isdigit()
        }
        if (
            "produk" in intent
            and identifying_tokens
            and not any(word in intent for word in ("terlaris", "teratas", "tertinggi", "terbesar"))
        ):
            return "Produk yang disebut belum ditemukan. Coba gunakan nama lengkap atau barcode."
        if "harga" in intent and product is None:
            return "Sebutkan nama atau barcode produk yang ingin dicek harganya."

    if any(
        phrase in intent
        for phrase in (
            "per produk", "masing masing produk", "tiap produk", "laba produk", "keuntungan produk"
        )
    ):
        rows = product_performance(session, start_at, end_at)
        if not rows:
            return f"Belum ada penjualan produk pada {period.label}."
        profit_first = any(word in intent for word in ("laba", "untung", "keuntungan"))
        metric = (
            "gross_profit" if profit_first else "net_revenue" if "omzet" in intent else "quantity"
        )
        rows.sort(key=lambda item: (-int(item[metric]), str(item["name"])))
        heading = f"Performa per produk pada {period.label}"
        if len(rows) > 10:
            heading += f" (10 teratas dari {len(rows)} produk)"
        return heading + ":\n" + "\n".join(
            f"- {item['name']}: {item['quantity']} unit, omzet {_money(item['net_revenue'])}, "
            f"laba kotor {_money(item['gross_profit'])}"
            for item in rows[:10]
        )

    if "stok" in intent and any(
        word in intent for word in ("kritis", "minimum", "beli", "ulang", "habis", "menipis")
    ):
        stock_total = Product.stock + Product.warehouse_stock
        low = session.scalars(
            select(Product)
            .where(Product.is_active.is_(True), stock_total <= Product.reorder_level)
            .order_by(stock_total, Product.name)
            .limit(10)
        ).all()
        if not low:
            return "Saat ini tidak ada produk dengan total stok pada atau di bawah batas minimum."
        return "Produk yang perlu dibeli ulang:\n" + "\n".join(
            f"- {item.name}: {item.stock + item.warehouse_stock} unit, "
            f"batas minimum {item.reorder_level}"
            for item in low
        )

    if any(word in intent for word in ("laris", "teratas", "produk", "barang")) and any(
        word in intent for word in ("laris", "teratas", "tertinggi", "terbesar", "laba", "untung")
    ):
        rows = product_performance(session, start_at, end_at)
        if not rows:
            return f"Belum ada penjualan produk pada {period.label}."
        by_profit = "laba" in intent or "untung" in intent or "keuntungan" in intent
        by_revenue = "omzet" in intent or "pendapatan" in intent
        metric = "gross_profit" if by_profit else "net_revenue" if by_revenue else "quantity"
        rows.sort(key=lambda item: (-int(item[metric]), str(item["name"])))
        heading = "laba kotor" if by_profit else "omzet" if by_revenue else "jumlah terjual"
        return f"Produk teratas menurut {heading} pada {period.label}:\n" + "\n".join(
            f"- {item['name']}: {item['quantity']} unit, omzet {_money(item['net_revenue'])}, "
            f"laba kotor {_money(item['gross_profit'])}"
            for item in rows[:5]
        )

    if any(
        word in intent for word in ("omzet", "penjualan", "transaksi", "laba", "untung", "performa")
    ):
        if "banding" in intent or "dibanding" in intent:
            month_pattern = r"\b(?:" + "|".join(name.casefold() for name in MONTHS) + r")\b"
            mentioned_months = [match.group() for match in re.finditer(month_pattern, intent)]
            if len(mentioned_months) >= 2:
                year_match = re.search(r"\b20\d{2}\b", intent)
                year = f" {year_match.group()}" if year_match else ""
                current = _period(f"{mentioned_months[0]}{year}", today)
                previous = _period(f"{mentioned_months[1]}{year}", today)
            elif "minggu" in intent or "pekan" in intent:
                current = _period("minggu ini", today)
                previous = _period("minggu lalu", today)
            else:
                current = _period("bulan ini", today)
                previous_end = today.replace(day=1) - timedelta(days=1)
                previous_day = min(today.day, monthrange(previous_end.year, previous_end.month)[1])
                previous = Period(
                    previous_end.replace(day=1),
                    previous_end.replace(day=previous_day),
                    f"{MONTHS[previous_end.month - 1]} {previous_end.year}, "
                    f"tanggal 1–{previous_day}",
                )
            a = period_summary(session, *current.bounds)
            b = period_summary(session, *previous.bounds)
            change = (
                f"; selisih {((a['omzet'] - b['omzet']) / b['omzet']) * 100:+.1f}%"
                if b["omzet"]
                else ""
            )
            return (
                f"Omzet {current.label} {_money(a['omzet'])} dari {a['transaksi']} transaksi. "
                f"Pembanding {previous.label} {_money(b['omzet'])} dari {b['transaksi']} "
                f"transaksi{change}."
            )
        if "per bulan" in intent or "bulanan" in intent:
            month_col = func.extract("month", Sale.created_at)
            year_col = func.extract("year", Sale.created_at)
            rows = session.execute(
                select(year_col, month_col, func.sum(Sale.total), func.count(Sale.id))
                .where(
                    Sale.status == "completed",
                    Sale.created_at >= start_at,
                    Sale.created_at < end_at,
                )
                .group_by(year_col, month_col)
                .order_by(year_col, month_col)
            ).all()
            if not rows:
                return f"Belum ada transaksi selesai pada {period.label}."
            return f"Omzet per bulan pada {period.label}:\n" + "\n".join(
                f"- {MONTHS[int(month) - 1]} {int(year)}: {_money(amount)}, {count} transaksi"
                for year, month, amount, count in rows
            )
        if ("per hari" in intent or "harian" in intent) and not any(
            word in intent for word in ("tertinggi", "terbesar", "puncak")
        ):
            day_col = func.date(Sale.created_at)
            rows = session.execute(
                select(day_col, func.sum(Sale.total), func.count(Sale.id))
                .where(
                    Sale.status == "completed",
                    Sale.created_at >= start_at,
                    Sale.created_at < end_at,
                )
                .group_by(day_col)
                .order_by(day_col.desc())
                .limit(31)
            ).all()
            if not rows:
                return f"Belum ada transaksi selesai pada {period.label}."
            lines = [f"Omzet harian pada {period.label} (tanggal terbaru lebih dulu):"]
            lines.extend(
                f"- {_date_label(date.fromisoformat(str(day)))}: "
                f"{_money(amount)}, {count} transaksi"
                for day, amount, count in rows
            )
            return "\n".join(lines)
        if any(word in intent for word in ("tertinggi", "terbesar", "puncak", "paling tinggi")):
            day_col = func.date(Sale.created_at)
            rows = session.execute(
                select(day_col, func.sum(Sale.total), func.count(Sale.id))
                .where(
                    Sale.status == "completed",
                    Sale.created_at >= start_at,
                    Sale.created_at < end_at,
                )
                .group_by(day_col)
                .order_by(func.sum(Sale.total).desc(), day_col)
                .limit(1)
            ).all()
            if not rows:
                return f"Belum ada transaksi selesai pada {period.label}."
            day, amount, count = rows[0]
            day_label = _date_label(date.fromisoformat(str(day)))
            prefix = (
                "Total omzet pada"
                if follow_up and "total" in _text(question)
                else f"Omzet harian tertinggi pada {period.label} terjadi pada"
            )
            return f"{prefix} {day_label}: {_money(amount)} dari {count} transaksi."
        if any(word in intent for word in ("pelanggan", "member", "supplier", "per kasir")):
            return (
                "Rincian untuk metrik itu belum tersedia di chat. "
                "Gunakan halaman laporan untuk memeriksa datanya."
            )
        summary = period_summary(session, start_at, end_at)
        if "daftar" in intent or "list" in intent or "rincian" in intent or "detail" in intent:
            recent = session.scalars(
                select(Sale)
                .where(
                    Sale.status == "completed",
                    Sale.created_at >= start_at,
                    Sale.created_at < end_at,
                )
                .order_by(Sale.created_at.desc())
                .limit(10)
            ).all()
            if not recent:
                return f"Belum ada transaksi selesai pada {period.label}."
            return (
                f"{summary['transaksi']} transaksi pada {period.label}, "
                f"omzet {_money(summary['omzet'])}. "
                "Berikut 10 transaksi terbaru:\n"
                + "\n".join(
                    f"- {sale.transaction_no}: {_date_label(sale.created_at.date())}, "
                    f"{sale.item_count} item, {_money(sale.total)}"
                    for sale in recent
                )
            )
        return (
            f"Pada {period.label}, omzet {_money(summary['omzet'])} dari "
            f"{summary['transaksi']} transaksi dan {summary['item_terjual']} item. "
            f"Laba kotor {_money(summary['laba_kotor'])}; diskon {_money(summary['diskon'])}."
        )

    if any(word in intent for word in ("ubah", "hapus", "tambah", "edit")) and any(
        word in intent for word in ("stok", "produk", "transaksi")
    ):
        return (
            "Saya dapat membantu analisis data. Perubahan produk, stok, dan transaksi "
            "dilakukan melalui menu operasional sesuai hak akses."
        )

    if re.search(r"\b(berapa|jumlah|total|persen|persentase|rata rata)\b", current):
        return (
            "Saya belum punya perhitungan terverifikasi untuk angka itu. "
            "Sebutkan metrik dan periode, misalnya omzet harian Oktober atau laba produk 30 hari."
        )

    return None
