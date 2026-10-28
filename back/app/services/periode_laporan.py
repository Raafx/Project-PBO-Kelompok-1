"""Membuat batas tanggal yang sama untuk semua laporan admin."""

from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from fastapi import HTTPException

from app.config import get_settings


def waktu_bisnis() -> datetime:
    """Waktu lokal toko, tanpa informasi zona untuk kolom waktu database."""
    return datetime.now(ZoneInfo(get_settings().business_timezone)).replace(tzinfo=None)


def rentang_laporan(
    tanggal_awal: date | None, tanggal_akhir: date | None
) -> tuple[date, date, datetime, datetime]:
    """Ubah tanggal pilihan menjadi rentang database [awal, akhir)."""
    akhir = tanggal_akhir or waktu_bisnis().date()
    awal = tanggal_awal or (akhir - timedelta(days=29))
    if awal > akhir:
        raise HTTPException(
            status_code=422, detail="Tanggal awal tidak boleh melewati tanggal akhir"
        )
    if (akhir - awal).days > 366:
        raise HTTPException(status_code=422, detail="Rentang laporan maksimal 366 hari")
    mulai = datetime.combine(awal, time.min)
    selesai = datetime.combine(akhir + timedelta(days=1), time.min)
    return awal, akhir, mulai, selesai
