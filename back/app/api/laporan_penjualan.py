"""API daftar penjualan dan laporan bisnis admin.

Frontend memanggil URL di sini untuk filter transaksi dan angka laporan.
Perhitungan bersama ada di `app/services/reporting.py`.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.admin import require_any_permission
from app.database import get_db
from app.models import Cashier, FinanceEntry, Member, Payment, Product, Sale, SaleItem
from app.schemas import (
    AdminSaleRead,
    AdminSalesReportRead,
    ReportBreakdown,
    ReportDailySale,
    ReportMonthlySale,
    ReportProductPerformance,
    ReportTopProduct,
)
from app.services.periode_laporan import rentang_laporan
from app.services.reporting import period_summary, product_performance

router = APIRouter(prefix="/admin", tags=["Penjualan dan Laporan"])
DbSession = Annotated[Session, Depends(get_db)]


def _sale_list_statement():
    return (
        select(
            Sale,
            Cashier.full_name.label("cashier_name"),
            Member.full_name.label("member_name"),
            Payment.method.label("payment_method"),
        )
        .join(Cashier, Cashier.id == Sale.cashier_id)
        .outerjoin(Member, Member.id == Sale.member_id)
        .outerjoin(Payment, Payment.sale_id == Sale.id)
    )


def _sale_rows(rows: list[object]) -> list[AdminSaleRead]:
    return [
        AdminSaleRead(
            id=row.Sale.id,
            transaction_no=row.Sale.transaction_no,
            status=row.Sale.status,
            total=row.Sale.total,
            discount=row.Sale.discount,
            item_count=row.Sale.item_count,
            gross_profit=sum(item.gross_profit for item in row.Sale.items),
            created_at=row.Sale.created_at,
            cashier_name=row.cashier_name,
            member_name=row.member_name,
            payment_method=row.payment_method,
            items=list(row.Sale.items),
        )
        for row in rows
    ]


# Riwayat transaksi dan angka laporan berdasarkan filter periode.
@router.get(
    "/sales",
    response_model=list[AdminSaleRead],
    dependencies=[Depends(require_any_permission("admin.sales", "admin.reports"))],
)
def list_sales(
    session: DbSession,
    date_from: date | None = None,
    date_to: date | None = None,
    sale_status: Annotated[str | None, Query(alias="status", max_length=16)] = None,
    search: Annotated[str | None, Query(max_length=80)] = None,
    payment_method: Annotated[str | None, Query(max_length=16)] = None,
    product_id: Annotated[str | None, Query(max_length=36)] = None,
    limit: Annotated[int, Query(ge=1, le=500)] = 200,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[AdminSaleRead]:
    # Satu query dipakai semua filter. `limit` dan `offset` membagi hasil per halaman.
    statement = _sale_list_statement()
    if date_from or date_to:
        _, _, start_at, end_at = rentang_laporan(date_from, date_to)
        statement = statement.where(Sale.created_at >= start_at, Sale.created_at < end_at)
    if sale_status:
        statement = statement.where(Sale.status == sale_status)
    if payment_method:
        statement = statement.where(Payment.method == payment_method)
    if product_id:
        matching_product_sales = select(SaleItem.sale_id).where(
            SaleItem.product_id == product_id
        )
        statement = statement.where(Sale.id.in_(matching_product_sales))
    if search:
        term = f"%{search.strip()}%"
        matching_sale_ids = select(SaleItem.sale_id).where(
            or_(
                SaleItem.product_name.like(term),
                SaleItem.barcode.like(term),
            )
        )
        statement = statement.where(
            or_(
                Sale.transaction_no.like(term),
                Cashier.full_name.like(term),
                Member.full_name.like(term),
                Sale.id.in_(matching_sale_ids),
            )
        )
    rows = session.execute(
        statement.order_by(Sale.created_at.desc(), Sale.id.desc()).offset(offset).limit(limit)
    ).all()
    return _sale_rows(rows)


@router.get(
    "/reports/sales",
    response_model=AdminSalesReportRead,
    dependencies=[Depends(require_any_permission("admin.reports", "admin.overview"))],
)
def sales_report(
    session: DbSession,
    date_from: date | None = None,
    date_to: date | None = None,
) -> AdminSalesReportRead:
    start_date, end_date, start_at, end_at = rentang_laporan(date_from, date_to)
    # Hanya transaksi selesai yang ikut omzet dan laba; hold/batal tidak dihitung.
    completed = (
        Sale.status == "completed",
        Sale.created_at >= start_at,
        Sale.created_at < end_at,
    )

    summary = period_summary(session, start_at, end_at)
    # HPP memakai unit_cost pada item saat penjualan terjadi, bukan harga modal terbaru.
    cost_of_goods = int(
        session.scalar(
            select(func.coalesce(func.sum(SaleItem.unit_cost * SaleItem.quantity), 0))
            .join(Sale, Sale.id == SaleItem.sale_id)
            .where(*completed)
        )
        or 0
    )
    expenses = int(
        session.scalar(
            select(func.coalesce(func.sum(FinanceEntry.amount), 0)).where(
                FinanceEntry.entry_type == "expense",
                FinanceEntry.status != "cancelled",
                FinanceEntry.created_at >= start_at,
                FinanceEntry.created_at < end_at,
            )
        )
        or 0
    )

    day_column = func.date(Sale.created_at).label("day")
    daily_rows = session.execute(
        select(
            day_column,
            func.coalesce(func.sum(Sale.total), 0).label("total_sales"),
            func.count(Sale.id).label("transaction_count"),
        )
        .where(*completed)
        .group_by(day_column)
        .order_by(day_column)
    ).all()
    daily_by_date = {
        str(row.day): (int(row.total_sales), int(row.transaction_count)) for row in daily_rows
    }
    profit_day_column = func.date(Sale.created_at).label("day")
    daily_profit_rows = session.execute(
        select(
            profit_day_column,
            func.coalesce(
                func.sum(SaleItem.subtotal - (SaleItem.unit_cost * SaleItem.quantity)),
                0,
            ).label("gross_profit"),
        )
        .join(SaleItem, SaleItem.sale_id == Sale.id)
        .where(*completed)
        .group_by(profit_day_column)
    ).all()
    daily_profit_by_date = {
        str(row.day): int(row.gross_profit) for row in daily_profit_rows
    }
    expense_day_column = func.date(FinanceEntry.created_at).label("day")
    daily_expense_rows = session.execute(
        select(
            expense_day_column,
            func.coalesce(func.sum(FinanceEntry.amount), 0).label("expenses"),
        )
        .where(
            FinanceEntry.entry_type == "expense",
            FinanceEntry.status != "cancelled",
            FinanceEntry.created_at >= start_at,
            FinanceEntry.created_at < end_at,
        )
        .group_by(expense_day_column)
    ).all()
    daily_expenses_by_date = {
        str(row.day): int(row.expenses) for row in daily_expense_rows
    }
    # Masukkan tanggal tanpa penjualan dengan nilai nol agar grafik tetap utuh.
    daily_sales: list[ReportDailySale] = []
    cursor = start_date
    while cursor <= end_date:
        sales_amount, transactions = daily_by_date.get(cursor.isoformat(), (0, 0))
        gross_profit = daily_profit_by_date.get(cursor.isoformat(), 0)
        day_expenses = daily_expenses_by_date.get(cursor.isoformat(), 0)
        daily_sales.append(
            ReportDailySale(
                date=cursor,
                total_sales=sales_amount,
                transaction_count=transactions,
                gross_profit=gross_profit,
                expenses=day_expenses,
                net_profit=gross_profit - day_expenses,
            )
        )
        cursor += timedelta(days=1)

    payment_rows = session.execute(
        select(
            Payment.method.label("label"),
            func.coalesce(func.sum(Payment.amount), 0).label("amount"),
            func.count(Payment.id).label("count"),
        )
        .join(Sale, Sale.id == Payment.sale_id)
        .where(*completed)
        .group_by(Payment.method)
        .order_by(func.sum(Payment.amount).desc())
    ).all()

    category_rows = session.execute(
        select(
            Product.category.label("label"),
            func.coalesce(func.sum(SaleItem.subtotal), 0).label("amount"),
            func.coalesce(func.sum(SaleItem.quantity), 0).label("count"),
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .join(Product, Product.id == SaleItem.product_id)
        .where(*completed)
        .group_by(Product.category)
        .order_by(func.sum(SaleItem.subtotal).desc())
    ).all()

    performance = product_performance(session, start_at, end_at)
    top_products = sorted(
        performance,
        key=lambda item: (int(item["quantity"]), int(item["net_revenue"])),
        reverse=True,
    )[:8]

    transaction_rows = session.execute(
        _sale_list_statement()
        .where(*completed)
        .order_by(Sale.created_at.desc())
        .limit(500)
    ).all()
    transactions = _sale_rows(transaction_rows)

    monthly_totals: dict[str, dict[str, int]] = {}
    for daily in daily_sales:
        month = daily.date.strftime("%Y-%m")
        values = monthly_totals.setdefault(
            month,
            {"total_sales": 0, "transaction_count": 0, "gross_profit": 0,
             "expenses": 0, "net_profit": 0},
        )
        values["total_sales"] += daily.total_sales
        values["transaction_count"] += daily.transaction_count
        values["gross_profit"] += daily.gross_profit
        values["expenses"] += daily.expenses
        values["net_profit"] += daily.net_profit
    monthly_sales = [
        ReportMonthlySale(month=month, **values)
        for month, values in sorted(monthly_totals.items())
    ]

    transaction_total = summary["transaksi"]
    return AdminSalesReportRead(
        date_from=start_date,
        date_to=end_date,
        total_sales=summary["omzet"],
        transaction_count=transaction_total,
        item_count=summary["item_terjual"],
        average_transaction=summary["rata_rata_transaksi"],
        total_discount=summary["diskon"],
        estimated_gross_profit=summary["laba_kotor"],
        cost_of_goods=cost_of_goods,
        expenses=expenses,
        net_profit=summary["laba_kotor"] - expenses,
        daily_sales=daily_sales,
        monthly_sales=monthly_sales,
        payment_methods=[
            ReportBreakdown(label=row.label, amount=int(row.amount), count=int(row.count))
            for row in payment_rows
        ],
        category_sales=[
            ReportBreakdown(label=row.label, amount=int(row.amount), count=int(row.count))
            for row in category_rows
        ],
        top_products=[
            ReportTopProduct(
                barcode=str(item["barcode"]),
                name=str(item["name"]),
                quantity=int(item["quantity"]),
                revenue=int(item["net_revenue"]),
                transaction_count=int(item["transaction_count"]),
                gross_profit=int(item["gross_profit"]),
                margin_percentage=float(item["margin_percentage"]),
            )
            for item in top_products
        ],
        product_performance=[ReportProductPerformance(**item) for item in performance],
        recent_sales=transactions[:8],
        transactions=transactions,
    )
