"""Exact, read-only answers to common executive questions.

The model may explain business data, but numbers shown by this module come from
the same sales tables and aggregation service used by the admin reports.
"""

from __future__ import annotations

import re
from calendar import monthrange
from collections.abc import Sequence
from contextvars import ContextVar
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
    "aja",
    "analisa",
    "analisis",
    "anda",
    "antara",
    "bahas",
    "banding",
    "bantu",
    "banyak",
    "beli",
    "bila",
    "cari",
    "carikan",
    "coba",
    "deh",
    "dibanding",
    "dikit",
    "dong",
    "etalase",
    "evaluasi",
    "gudang",
    "habis",
    "insight",
    "jika",
    "jelasin",
    "jelaskan",
    "kalau",
    "kamu",
    "kasir",
    "kategori",
    "kenapa",
    "keseluruhan",
    "kondisi",
    "kosong",
    "kritis",
    "lengkap",
    "lihat",
    "list",
    "mana",
    "mengenai",
    "mengapa",
    "menipis",
    "menurut",
    "minimum",
    "modal",
    "mymarket",
    "nih",
    "nilai",
    "overstok",
    "penyebab",
    "persediaan",
    "posisi",
    "rak",
    "ranking",
    "rekomendasi",
    "restock",
    "saat",
    "saran",
    "sebaiknya",
    "seharusnya",
    "sebutkan",
    "secara",
    "sedikit",
    "sekarang",
    "siapa",
    "sih",
    "singkat",
    "soal",
    "strategi",
    "tampilkan",
    "tentang",
    "terbanyak",
    "terkait",
    "terkecil",
    "terkini",
    "terendah",
    "tersedikit",
    "toko",
    "ulang",
    "urutan",
    "berjalan",
    "pekan",
    "puncak",
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
    ) or any(
        token.endswith("nya")
        and token.removesuffix("nya")
        in {"total", "jumlah", "stok", "omzet", "laba", "harga", "produk"}
        for token in current.split()
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


def _content_tokens(value: str) -> set[str]:
    tokens: set[str] = set()
    for token in _text(value).split():
        if token.endswith("nya") and token.removesuffix("nya") in STOP_WORDS:
            continue
        if token not in STOP_WORDS:
            tokens.add(token)
    return tokens


def _product_match(question: str, products: list[Product]) -> tuple[Product | None, list[Product]]:
    normalized = _text(question)
    tokens = _content_tokens(question)
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


_pending_evidence: ContextVar[dict[str, str] | None] = ContextVar(
    "ceo_question_evidence",
    default=None,
)
_HIGH_WORDS = {"terbanyak", "tertinggi", "terbesar"}
_LOW_WORDS = {"tersedikit", "terendah", "terkecil"}
_HIGH_PHRASES = ("paling banyak", "paling tinggi", "paling besar")
_LOW_PHRASES = ("paling sedikit", "paling rendah", "paling kecil", "paling dikit", "paling tipis")
_QUALITATIVE_TOKENS = {
    "kenapa",
    "mengapa",
    "penyebab",
    "saran",
    "rekomendasi",
    "analisis",
    "analisa",
    "evaluasi",
    "insight",
    "sebaiknya",
    "seharusnya",
    "menurutmu",
    "pendapat",
    "kondisi",
    "risiko",
}
_BUSINESS_TOKENS = {
    "produk",
    "barang",
    "stok",
    "persediaan",
    "harga",
    "laris",
    "terlaris",
    "laba",
    "untung",
    "keuntungan",
    "omzet",
    "penjualan",
    "performa",
    "transaksi",
    "supplier",
    "pembelian",
    "kasir",
    "pelanggan",
    "member",
    "kategori",
    "barcode",
    "margin",
    "hpp",
    "diskon",
    "gudang",
    "laporan",
    "toko",
    "mymarket",
    "modal",
    "retur",
    "promo",
    "etalase",
}
_OFF_TOPIC_TOKENS = {
    "cuaca",
    "berita",
    "politik",
    "presiden",
    "lagu",
    "puisi",
    "resep",
    "masak",
    "memasak",
    "film",
    "bola",
    "sepakbola",
    "game",
    "novel",
    "terjemahkan",
    "translate",
    "matematika",
    "pemilu",
    "chatgpt",
    "python",
    "javascript",
    "dongeng",
    "horoskop",
    "zodiak",
}
_IDENTITY_QUESTIONS = {
    "kamu siapa",
    "siapa kamu",
    "anda siapa",
    "siapa anda",
    "namamu siapa",
    "siapa namamu",
    "kamu bisa apa",
    "bisa apa",
    "bantuan",
    "help",
}
_SCOPE_REPLY = (
    "Itu di luar data operasional MYMARKET. Saya bisa membantu pertanyaan penjualan, "
    "stok, produk, dan transaksi toko. Misalnya: stok produk terbanyak, produk paling "
    "laris bulan ini, atau analisis satu produk beserta namanya."
)
_CLARIFY_REPLY = (
    "Supaya angkanya tepat, sebutkan yang ingin dicek. Contohnya stok terbanyak saat ini, "
    "produk paling laris, laba satu produk, atau omzet hari ini."
)
_UNSUPPORTED_REPLY = (
    "Hitungan itu belum tersedia di chat. Saya bisa menjawab omzet, perbandingan periode, "
    "produk terlaris, laba produk, stok terbanyak atau tersedikit, stok menipis, harga, "
    "dan rincian nomor transaksi."
)


def take_question_evidence() -> dict[str, str] | None:
    evidence = _pending_evidence.get()
    _pending_evidence.set(None)
    return evidence


def _tokens(intent: str) -> set[str]:
    return set(intent.split())


def _qualitative(intent: str) -> bool:
    tokens = _tokens(intent)
    if tokens & _QUALITATIVE_TOKENS or any(token.startswith("strateg") for token in tokens):
        return True
    return any(
        phrase in intent
        for phrase in (
            "menurut kamu",
            "menurut anda",
            "bagaimana cara",
            "gimana cara",
            "cara meningkatkan",
            "cara menaikkan",
        )
    )


def _business(intent: str) -> bool:
    return bool(_tokens(intent) & _BUSINESS_TOKENS)


def _off_topic(intent: str) -> bool:
    return bool(_tokens(intent) & _OFF_TOPIC_TOKENS)


def _mentions_stock(intent: str) -> bool:
    return bool(_tokens(intent) & {"stok", "persediaan"})


def _reply(intent: str, text: str) -> str | None:
    if not _qualitative(intent):
        return text
    _pending_evidence.set(
        {
            "instruksi": (
                "Angka pada ringkas diverifikasi dari database. Salin angka, nama, dan periode "
                "itu apa adanya, lalu jelaskan artinya tanpa menambah angka baru."
            ),
            "ringkas": text,
        }
    )
    if get_settings().gemini_api_key.strip():
        return None
    return text


def _name_tokens(intent: str, categories: Sequence[str] = ()) -> set[str]:
    ignored = set(STOP_WORDS)
    ignored.update(name.casefold() for name in MONTHS)
    for category in categories:
        ignored.update(_text(category).split())
    names: set[str] = set()
    for token in intent.split():
        if token.endswith("nya") and token.removesuffix("nya") in ignored:
            continue
        if token not in ignored and not token.isdigit() and len(token) > 2:
            names.add(token)
    return names


def _matching_categories(products: Sequence[Product], intent: str) -> list[str]:
    intent_tokens = _tokens(intent)
    catalog = sorted({item.category for item in products if item.category})
    exact: list[str] = []
    covered_categories: list[str] = []
    covered_tokens: set[str] = set()
    for category in catalog:
        tokens = {token for token in _text(category).split() if token not in STOP_WORDS}
        if not tokens:
            continue
        if tokens <= intent_tokens:
            exact.append(category)
        if tokens & intent_tokens:
            covered_categories.append(category)
            covered_tokens |= tokens
    if exact:
        return exact
    names = _name_tokens(intent)
    if names and names <= covered_tokens:
        return covered_categories
    return []


def _filter_categories(products: Sequence[Product], categories: Sequence[str]) -> list[Product]:
    if not categories:
        return list(products)
    allowed = set(categories)
    return [item for item in products if item.category in allowed]


def _active_products(session: Session) -> list[Product]:
    return list(session.scalars(select(Product).where(Product.is_active.is_(True))).all())


def _rank_direction(intent: str) -> str | None:
    found: list[tuple[int, str]] = []
    tokens = _tokens(intent)
    for word in _HIGH_WORDS:
        if word in tokens:
            found.append((intent.find(word), "high"))
    for word in _LOW_WORDS:
        if word in tokens:
            found.append((intent.find(word), "low"))
    for phrase in _HIGH_PHRASES:
        index = intent.find(phrase)
        if index >= 0:
            found.append((index, "high"))
    for phrase in _LOW_PHRASES:
        index = intent.find(phrase)
        if index >= 0:
            found.append((index, "low"))
    if not found:
        return None
    found.sort()
    return found[0][1]


def _sales_rank(intent: str) -> bool:
    if _mentions_stock(intent):
        return False
    subject = any(word in intent for word in ("laris", "teratas", "produk", "barang"))
    metric = any(
        word in intent
        for word in ("laris", "teratas", "tertinggi", "terbesar", "terbanyak", "laba", "untung")
    ) or any(phrase in intent for phrase in ("paling banyak", "paling laris"))
    return subject and metric


def _stock_alert(intent: str) -> bool:
    tokens = _tokens(intent)
    if tokens & {"kritis", "menipis", "habis", "kosong", "restock", "overstok"}:
        return True
    if "minimum" in tokens and _mentions_stock(intent):
        return True
    return "beli" in intent and ("ulang" in intent or "dibeli" in intent or "pembelian" in intent)


def _wants_stock_summary(intent: str, residual: set[str]) -> bool:
    if not _mentions_stock(intent) or _rank_direction(intent) or _stock_alert(intent):
        return False
    if "kategori" in _tokens(intent) or "per produk" in intent or "per kategori" in intent:
        return False
    if residual and not (_tokens(intent) & {"total", "keseluruhan", "jumlah", "nilai", "modal"}):
        return False
    return True


def _stock_area(intent: str) -> str:
    tokens = _tokens(intent)
    warehouse = "gudang" in tokens
    register = bool(tokens & {"kasir", "etalase", "rak"})
    if warehouse and not register:
        return "gudang"
    if register and not warehouse:
        return "kasir"
    return "total"


def _stock_total(product: Product, area: str) -> int:
    if area == "gudang":
        return product.warehouse_stock
    if area == "kasir":
        return product.stock
    return product.stock + product.warehouse_stock


def _stock_phrase(product: Product, area: str) -> str:
    total = product.stock + product.warehouse_stock
    if area == "gudang":
        return f"{product.warehouse_stock} unit di gudang, total {total} unit"
    if area == "kasir":
        return f"{product.stock} unit di kasir, total {total} unit"
    return f"{product.stock} di kasir dan {product.warehouse_stock} di gudang, total {total} unit"


def _format_stock_ranking(products: Sequence[Product], intent: str) -> str:
    if not products:
        return "Tidak ada produk aktif untuk diurutkan."
    area = _stock_area(intent)
    direction = _rank_direction(intent) or "high"
    ranked = sorted(products, key=lambda item: item.name)
    ranked.sort(key=lambda item: _stock_total(item, area), reverse=direction == "high")
    scope = {"gudang": "di gudang", "kasir": "di kasir", "total": "saat ini"}[area]
    label = "paling sedikit" if direction == "low" else "paling banyak"
    top_qty = _stock_total(ranked[0], area)
    leaders = [item for item in ranked if _stock_total(item, area) == top_qty]
    if len(leaders) == 1:
        lead = f"Stok {label} {scope}: {leaders[0].name}, {_stock_phrase(leaders[0], area)}."
    else:
        sample = ", ".join(item.name for item in leaders[:5])
        extra = len(leaders) - min(len(leaders), 5)
        suffix = f", dan {extra} produk lain" if extra else ""
        lead = (
            f"Stok {label} {scope} sama pada {len(leaders)} produk "
            f"({top_qty} unit): {sample}{suffix}."
        )
    followers = [item for item in ranked if _stock_total(item, area) != top_qty][:4]
    if not followers:
        return lead
    lines = [lead, "Berikutnya:"]
    lines.extend(f"- {item.name}: {_stock_phrase(item, area)}" for item in followers)
    return "\n".join(lines)


def _format_stock_listing(products: Sequence[Product], intent: str) -> str:
    area = _stock_area(intent)
    direction = _rank_direction(intent) or "high"
    ranked = sorted(products, key=lambda item: item.name)
    ranked.sort(key=lambda item: _stock_total(item, area), reverse=direction == "high")
    if not ranked:
        return "Tidak ada produk aktif."
    shown = ranked[:10]
    lines = [f"Stok per produk saat ini ({len(shown)} dari {len(ranked)}):"]
    lines.extend(f"- {item.name}: {_stock_phrase(item, area)}" for item in shown)
    return "\n".join(lines)


def _stock_summary(products: Sequence[Product]) -> str:
    if not products:
        return "Tidak ada produk aktif."
    register = sum(item.stock for item in products)
    warehouse = sum(item.warehouse_stock for item in products)
    capital = sum((item.stock + item.warehouse_stock) * item.cost_price for item in products)
    empty = sum(1 for item in products if item.stock + item.warehouse_stock <= 0)
    return (
        f"Saat ini ada {len(products)} produk aktif. Total stok {register + warehouse} unit: "
        f"{register} di kasir dan {warehouse} di gudang. Nilai modal persediaan {_money(capital)}. "
        f"Produk dengan stok kosong: {empty}."
    )


def _stock_by_category(products: Sequence[Product]) -> str:
    if not products:
        return "Tidak ada produk aktif."
    buckets: dict[str, list[int]] = {}
    for item in products:
        units, count = buckets.get(item.category, [0, 0])
        buckets[item.category] = [units + item.stock + item.warehouse_stock, count + 1]
    rows = sorted(buckets.items(), key=lambda pair: (-pair[1][0], pair[0]))
    lines = ["Stok per kategori saat ini:"]
    lines.extend(
        f"- {name}: {units} unit dari {count} produk" for name, (units, count) in rows[:12]
    )
    return "\n".join(lines)


def _low_stock_answer(products: Sequence[Product]) -> str:
    low = [item for item in products if item.stock + item.warehouse_stock <= item.reorder_level]
    low.sort(key=lambda item: (item.stock + item.warehouse_stock, item.name))
    low = low[:10]
    if not low:
        return "Saat ini tidak ada produk dengan total stok pada atau di bawah batas minimum."
    return "Produk yang perlu dibeli ulang:\n" + "\n".join(
        f"- {item.name}: {item.stock + item.warehouse_stock} unit, "
        f"batas minimum {item.reorder_level}"
        for item in low
    )


def _store_overview(
    session: Session,
    period: Period,
    start_at: datetime,
    end_at: datetime,
) -> str:
    products = _active_products(session)
    summary = period_summary(session, start_at, end_at)
    rows = product_performance(session, start_at, end_at)
    rows.sort(key=lambda item: (-int(item["quantity"]), str(item["name"])))
    parts = [
        _stock_summary(products),
        _format_stock_ranking(products, "stok terbanyak"),
        _format_stock_ranking(products, "stok tersedikit"),
        (
            f"Pada {period.label}, omzet {_money(summary['omzet'])} dari "
            f"{summary['transaksi']} transaksi dan {summary['item_terjual']} item. "
            f"Laba kotor {_money(summary['laba_kotor'])}."
        ),
    ]
    if rows:
        parts.append(
            f"Produk terlaris pada {period.label}:\n"
            + "\n".join(
                f"- {item['name']}: {item['quantity']} unit, omzet {_money(item['net_revenue'])}, "
                f"laba kotor {_money(item['gross_profit'])}"
                for item in rows[:5]
            )
        )
    return "\n".join(parts)


def answer_business_question(
    session: Session,
    question: str,
    history: Sequence[CeoChatMessage] = (),
    *,
    today: date | None = None,
) -> str | None:
    """Return a grounded answer, or None when Gemini should explain verified facts."""

    _pending_evidence.set(None)
    if today is None:
        from zoneinfo import ZoneInfo

        today = datetime.now(ZoneInfo(get_settings().business_timezone)).date()
    current = _text(question)
    if current in {"halo", "hai", "hi", "hello", "tes", "test", "ping"}:
        return "Hai! Saya siap membantu analisis penjualan, produk, transaksi, dan stok MYMARKET."
    if current in {"apa kabar", "gimana kabar", "kabar"}:
        return "Baik. Saya bisa cek omzet, stok, produk, dan transaksi MYMARKET."
    if current in _IDENTITY_QUESTIONS:
        return (
            "Saya asisten analisis MYMARKET. Saya menjawab omzet, stok, performa produk, "
            "dan transaksi dari database toko."
        )

    transaction = _transaction_answer(session, question)
    if transaction:
        failed = "tidak ditemukan" in transaction or "berstatus" in transaction
        return transaction if failed else _reply(_text(question), transaction)

    contextual, follow_up = _question_with_context(question, history)
    intent = _text(contextual)
    period = _period(contextual, today)
    start_at, end_at = period.bounds
    direction = _rank_direction(intent) if _mentions_stock(intent) else None
    products: list[Product] = []
    categories: list[str] = []
    residual: set[str] = set()
    product: Product | None = None
    ambiguous: list[Product] = []
    product_words = any(
        word in intent
        for word in (
            "produk",
            "barang",
            "stok",
            "persediaan",
            "harga",
            "laris",
            "laba",
            "untung",
            "omzet",
            "performa",
        )
    )
    if product_words:
        products = _active_products(session)
        categories = _matching_categories(products, intent)
        residual = _name_tokens(intent, categories)
        product, ambiguous = _product_match(contextual, products)
        if ambiguous and residual and not direction:
            names = ", ".join(item.name for item in ambiguous)
            return f"Produk yang dimaksud belum spesifik. Pilih salah satu: {names}."
        if direction and not (product and residual and not ambiguous):
            pool = ambiguous if ambiguous and residual else _filter_categories(products, categories)
            return _reply(intent, _format_stock_ranking(pool, intent))
        if product and residual:
            if _mentions_stock(intent):
                total = product.stock + product.warehouse_stock
                return _reply(
                    intent,
                    (
                        f"Stok {product.name}: {product.stock} di kasir dan "
                        f"{product.warehouse_stock} di gudang, total {total} unit. "
                        f"Batas minimum {product.reorder_level} unit."
                    ),
                )
            if "harga" in intent and not any(word in intent for word in ("untung", "laba")):
                return _reply(
                    intent,
                    (
                        f"Harga jual {product.name} saat ini {_money(product.price)} "
                        f"per {product.unit}."
                    ),
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
                return _reply(
                    intent,
                    f"{product.name} belum tercatat terjual pada {period.label}.",
                )
            return _reply(
                intent,
                (
                    f"{product.name} pada {period.label}: {performance['quantity']} unit dalam "
                    f"{performance['transaction_count']} transaksi; omzet bersih "
                    f"{_money(performance['net_revenue'])}, "
                    f"HPP {_money(performance['cost_of_goods'])}, "
                    f"laba kotor {_money(performance['gross_profit'])}, margin "
                    f"{performance['margin_percentage']:.2f}%."
                ),
            )
        if (
            residual
            and not direction
            and not _sales_rank(intent)
            and not _stock_alert(intent)
            and "per produk" not in intent
            and "per kategori" not in intent
            and not categories
        ):
            return "Produk yang disebut belum ditemukan. Coba gunakan nama lengkap atau barcode."
        if "harga" in intent and product is None and not residual and not _mentions_stock(intent):
            return "Sebutkan nama atau barcode produk yang ingin dicek harganya."

    if _mentions_stock(intent) and (categories or "kategori" in intent or "per kategori" in intent):
        pool = _filter_categories(products or _active_products(session), categories)
        if direction:
            return _reply(intent, _format_stock_ranking(pool, intent))
        if _stock_alert(intent):
            return _reply(intent, _low_stock_answer(pool))
        if "kategori" in _tokens(intent) or "per kategori" in intent:
            return _reply(intent, _stock_by_category(pool))
        if not residual:
            return _reply(intent, _stock_summary(pool))

    if _stock_alert(intent) and (
        _mentions_stock(intent) or bool(_tokens(intent) & {"produk", "barang"})
    ):
        pool = _filter_categories(products or _active_products(session), categories)
        return _reply(intent, _low_stock_answer(pool))

    if _mentions_stock(intent) and any(
        phrase in intent for phrase in ("per produk", "masing masing produk", "tiap produk")
    ):
        pool = _filter_categories(products or _active_products(session), categories)
        return _reply(intent, _format_stock_listing(pool, intent))

    if _wants_stock_summary(intent, residual):
        pool = _filter_categories(products or _active_products(session), categories)
        text = _stock_summary(pool)
        if _qualitative(intent):
            text = "\n".join(
                (
                    text,
                    _format_stock_ranking(pool, "stok terbanyak"),
                    _format_stock_ranking(pool, "stok tersedikit"),
                    _low_stock_answer(pool),
                )
            )
        return _reply(intent, text)

    if not _mentions_stock(intent) and any(
        phrase in intent
        for phrase in (
            "per produk",
            "masing masing produk",
            "tiap produk",
            "laba produk",
            "keuntungan produk",
        )
    ):
        rows = product_performance(session, start_at, end_at)
        if not rows:
            return _reply(intent, f"Belum ada penjualan produk pada {period.label}.")
        profit_first = any(word in intent for word in ("laba", "untung", "keuntungan"))
        metric = (
            "gross_profit" if profit_first else "net_revenue" if "omzet" in intent else "quantity"
        )
        rows.sort(key=lambda item: (-int(item[metric]), str(item["name"])))
        heading = f"Performa per produk pada {period.label}"
        if len(rows) > 10:
            heading += f" (10 teratas dari {len(rows)} produk)"
        return _reply(
            intent,
            heading
            + ":\n"
            + "\n".join(
                f"- {item['name']}: {item['quantity']} unit, omzet {_money(item['net_revenue'])}, "
                f"laba kotor {_money(item['gross_profit'])}"
                for item in rows[:10]
            ),
        )

    if _sales_rank(intent):
        rows = product_performance(session, start_at, end_at)
        if not rows:
            return _reply(intent, f"Belum ada penjualan produk pada {period.label}.")
        by_profit = "laba" in intent or "untung" in intent or "keuntungan" in intent
        by_revenue = "omzet" in intent or "pendapatan" in intent
        metric = "gross_profit" if by_profit else "net_revenue" if by_revenue else "quantity"
        rows.sort(key=lambda item: (-int(item[metric]), str(item["name"])))
        heading = "laba kotor" if by_profit else "omzet" if by_revenue else "jumlah terjual"
        return _reply(
            intent,
            f"Produk teratas menurut {heading} pada {period.label}:\n"
            + "\n".join(
                f"- {item['name']}: {item['quantity']} unit, omzet {_money(item['net_revenue'])}, "
                f"laba kotor {_money(item['gross_profit'])}"
                for item in rows[:5]
            ),
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
            return _reply(
                intent,
                (
                    f"Omzet {current.label} {_money(a['omzet'])} dari {a['transaksi']} transaksi. "
                    f"Pembanding {previous.label} {_money(b['omzet'])} dari {b['transaksi']} "
                    f"transaksi{change}."
                ),
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
                return _reply(intent, f"Belum ada transaksi selesai pada {period.label}.")
            return _reply(
                intent,
                f"Omzet per bulan pada {period.label}:\n"
                + "\n".join(
                    f"- {MONTHS[int(month) - 1]} {int(year)}: {_money(amount)}, {count} transaksi"
                    for year, month, amount, count in rows
                ),
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
                return _reply(intent, f"Belum ada transaksi selesai pada {period.label}.")
            lines = [f"Omzet harian pada {period.label} (tanggal terbaru lebih dulu):"]
            lines.extend(
                f"- {_date_label(date.fromisoformat(str(day)))}: "
                f"{_money(amount)}, {count} transaksi"
                for day, amount, count in rows
            )
            return _reply(intent, "\n".join(lines))
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
                return _reply(intent, f"Belum ada transaksi selesai pada {period.label}.")
            day, amount, count = rows[0]
            day_label = _date_label(date.fromisoformat(str(day)))
            prefix = (
                "Total omzet pada"
                if follow_up and "total" in _text(question)
                else f"Omzet harian tertinggi pada {period.label} terjadi pada"
            )
            return _reply(intent, f"{prefix} {day_label}: {_money(amount)} dari {count} transaksi.")
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
                return _reply(intent, f"Belum ada transaksi selesai pada {period.label}.")
            return _reply(
                intent,
                (
                    f"{summary['transaksi']} transaksi pada {period.label}, "
                    f"omzet {_money(summary['omzet'])}. "
                    "Berikut 10 transaksi terbaru:\n"
                    + "\n".join(
                        f"- {sale.transaction_no}: {_date_label(sale.created_at.date())}, "
                        f"{sale.item_count} item, {_money(sale.total)}"
                        for sale in recent
                    )
                ),
            )
        return _reply(
            intent,
            (
                f"Pada {period.label}, omzet {_money(summary['omzet'])} dari "
                f"{summary['transaksi']} transaksi dan {summary['item_terjual']} item. "
                f"Laba kotor {_money(summary['laba_kotor'])}; diskon {_money(summary['diskon'])}."
            ),
        )

    if any(word in intent for word in ("ubah", "hapus", "tambah", "edit")) and any(
        word in intent for word in ("stok", "produk", "transaksi")
    ):
        return (
            "Saya dapat membantu analisis data. Perubahan produk, stok, dan transaksi "
            "dilakukan melalui menu operasional sesuai hak akses."
        )

    if _off_topic(intent) and not _business(intent):
        return _SCOPE_REPLY

    if _qualitative(intent):
        return _reply(intent, _store_overview(session, period, start_at, end_at))

    if re.search(r"\b(berapa|jumlah|total|persen|persentase|rata rata)\b", current):
        return (
            "Saya belum punya perhitungan terverifikasi untuk angka itu. "
            "Sebutkan metrik dan periode, misalnya omzet harian Oktober atau laba produk 30 hari."
        )

    if not _business(intent):
        return _CLARIFY_REPLY

    return _UNSUPPORTED_REPLY
