"""API untuk menu Analisis Produk di frontend.

Endpoint 1 mengisi pilihan produk. Endpoint 2 menghitung grafik satu produk.
Riwayat transaksinya memakai endpoint `/admin/sales` dengan filter `product_id`.
"""

from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.admin import require_permission
from app.database import get_db
from app.models import Product, Sale, SaleItem
from app.schemas import (
    ReportProductAnalysisRead,
    ReportProductDaily,
    ReportProductOption,
    ReportProductPerformance,
)
from app.services.periode_laporan import rentang_laporan
from app.services.reporting import product_performance

router = APIRouter(prefix="/admin", tags=["Analisis Produk"])
DbSession = Annotated[Session, Depends(get_db)]


@router.get(
    "/reports/product-options",
    response_model=list[ReportProductOption],
    dependencies=[Depends(require_permission("admin.reports"))],
)
def daftar_produk_analisis(session: DbSession) -> list[ReportProductOption]:
    """Semua produk, termasuk yang belum terjual, untuk select pencarian."""
    produk = session.scalars(select(Product).order_by(Product.name)).all()
    return [
        ReportProductOption(
            id=item.id,
            barcode=item.barcode,
            name=item.name,
            category=item.category,
        )
        for item in produk
    ]


@router.get(
    "/reports/products/{product_id}",
    response_model=ReportProductAnalysisRead,
    dependencies=[Depends(require_permission("admin.reports"))],
)
def laporan_analisis_produk(
    session: DbSession,
    product_id: str,
    date_from: date | None = None,
    date_to: date | None = None,
) -> ReportProductAnalysisRead:
    """Ringkasan dan grafik harian satu produk pada periode yang dipilih."""
    produk = session.get(Product, product_id)
    if produk is None:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")

    awal, akhir, mulai, selesai = rentang_laporan(date_from, date_to)
    hasil = product_performance(session, mulai, selesai, product_id)
    if hasil:
        ringkasan = ReportProductPerformance(**hasil[0])
    else:
        # Produk tetap bisa dipilih meskipun penjualan pada bulan itu masih nol.
        ringkasan = ReportProductPerformance(
            product_id=produk.id,
            barcode=produk.barcode,
            name=produk.name,
            category=produk.category,
            image_url=produk.image_url,
            transaction_count=0,
            quantity=0,
            gross_revenue=0,
            discount=0,
            net_revenue=0,
            cost_of_goods=0,
            gross_profit=0,
            margin_percentage=0,
            average_unit_price=0,
        )

    kolom_hari = func.date(Sale.created_at).label("hari")
    baris_harian = session.execute(
        select(
            kolom_hari,
            func.count(Sale.id).label("jumlah_transaksi"),
            func.coalesce(func.sum(SaleItem.quantity), 0).label("jumlah_unit"),
            func.coalesce(func.sum(SaleItem.subtotal), 0).label("omzet"),
            func.coalesce(func.sum(SaleItem.unit_cost * SaleItem.quantity), 0).label("hpp"),
        )
        .join(SaleItem, SaleItem.sale_id == Sale.id)
        .where(
            Sale.status == "completed",
            Sale.created_at >= mulai,
            Sale.created_at < selesai,
            SaleItem.product_id == product_id,
        )
        .group_by(kolom_hari)
        .order_by(kolom_hari)
    ).all()
    data_per_tanggal = {str(baris.hari): baris for baris in baris_harian}

    # Isi juga tanggal tanpa penjualan supaya sumbu grafik tidak melompati hari.
    grafik: list[ReportProductDaily] = []
    hari = awal
    while hari <= akhir:
        baris = data_per_tanggal.get(hari.isoformat())
        omzet = int(baris.omzet) if baris else 0
        hpp = int(baris.hpp) if baris else 0
        grafik.append(
            ReportProductDaily(
                date=hari,
                transaction_count=int(baris.jumlah_transaksi) if baris else 0,
                quantity=int(baris.jumlah_unit) if baris else 0,
                net_revenue=omzet,
                cost_of_goods=hpp,
                gross_profit=omzet - hpp,
            )
        )
        hari += timedelta(days=1)

    return ReportProductAnalysisRead(
        date_from=awal,
        date_to=akhir,
        product=ringkasan,
        daily_sales=grafik,
    )
