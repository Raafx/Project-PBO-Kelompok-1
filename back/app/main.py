from __future__ import annotations

from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.admin import router as admin_router
from app.api.analisis_produk import router as analisis_produk_router
from app.api.ceo_chat import router as ceo_chat_router
from app.api.kasir import router as kasir_router
from app.api.laporan_penjualan import router as laporan_penjualan_router
from app.api.operasional_toko import router as operasional_toko_router
from app.api.transaksi_langsung import router as transaksi_langsung_router
from app.config import get_settings
from app.database import get_db

settings = get_settings()
DbSession = Annotated[Session, Depends(get_db)]

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs" if settings.app_env != "production" else None,
    redoc_url=None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Actor-Code", "X-Idempotency-Key"],
)
# Setiap file di folder api/ menangani kelompok URL yang berbeda.
# Contoh: kasir.py menangani produk dan checkout, analisis_produk.py menangani grafik produk.
app.include_router(kasir_router, prefix=settings.api_prefix)
app.include_router(operasional_toko_router, prefix=settings.api_prefix)
app.include_router(admin_router, prefix=settings.api_prefix)
app.include_router(laporan_penjualan_router, prefix=settings.api_prefix)
app.include_router(analisis_produk_router, prefix=settings.api_prefix)
app.include_router(ceo_chat_router, prefix=settings.api_prefix)
app.include_router(transaksi_langsung_router, prefix=settings.api_prefix)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": settings.app_name, "docs": "/docs"}


@app.get("/health")
def health(session: DbSession) -> dict[str, str]:
    session.execute(text("SELECT 1"))
    return {"status": "ok", "database": "mysql"}
