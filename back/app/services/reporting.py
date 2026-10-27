from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session

from app.models import Product, Sale, SaleItem


def _integer(value: Any) -> int:
    return int(value or 0)


def period_summary(session: Session, start_at: datetime, end_at: datetime) -> dict[str, int]:
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
            func.coalesce(
                func.sum(SaleItem.subtotal - (SaleItem.unit_cost * SaleItem.quantity)),
                0,
            )
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .where(
            Sale.status == "completed",
            Sale.created_at >= start_at,
            Sale.created_at < end_at,
        )
    )
    transaction_count = _integer(transactions)
    return {
        "omzet": _integer(total),
        "transaksi": transaction_count,
        "item_terjual": _integer(items),
        "rata_rata_transaksi": _integer(total) // transaction_count
        if transaction_count
        else 0,
        "diskon": _integer(discounts),
        "laba_kotor": _integer(gross_profit),
    }


def product_performance(
    session: Session,
    start_at: datetime,
    end_at: datetime,
) -> list[dict[str, int | float | str | None]]:
    gross_revenue = func.sum(SaleItem.unit_price * SaleItem.quantity)
    discount = func.sum(SaleItem.discount)
    net_revenue = func.sum(SaleItem.subtotal)
    cost_of_goods = func.sum(SaleItem.unit_cost * SaleItem.quantity)
    gross_profit = func.sum(
        SaleItem.subtotal - (SaleItem.unit_cost * SaleItem.quantity)
    )
    rows = session.execute(
        select(
            SaleItem.product_id,
            SaleItem.barcode,
            SaleItem.product_name,
            Product.category,
            Product.image_url,
            func.count(distinct(SaleItem.sale_id)).label("transaction_count"),
            func.sum(SaleItem.quantity).label("quantity"),
            gross_revenue.label("gross_revenue"),
            discount.label("discount"),
            net_revenue.label("net_revenue"),
            cost_of_goods.label("cost_of_goods"),
            gross_profit.label("gross_profit"),
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .join(Product, Product.id == SaleItem.product_id)
        .where(
            Sale.status == "completed",
            Sale.created_at >= start_at,
            Sale.created_at < end_at,
        )
        .group_by(
            SaleItem.product_id,
            SaleItem.barcode,
            SaleItem.product_name,
            Product.category,
            Product.image_url,
        )
        .order_by(gross_profit.desc(), net_revenue.desc(), SaleItem.product_name)
    ).all()

    result: list[dict[str, int | float | str | None]] = []
    for row in rows:
        revenue = _integer(row.net_revenue)
        profit = _integer(row.gross_profit)
        quantity = _integer(row.quantity)
        result.append(
            {
                "product_id": row.product_id,
                "barcode": row.barcode,
                "name": row.product_name,
                "category": row.category,
                "image_url": row.image_url,
                "transaction_count": _integer(row.transaction_count),
                "quantity": quantity,
                "gross_revenue": _integer(row.gross_revenue),
                "discount": _integer(row.discount),
                "net_revenue": revenue,
                "cost_of_goods": _integer(row.cost_of_goods),
                "gross_profit": profit,
                "margin_percentage": round((profit / revenue) * 100, 2) if revenue else 0.0,
                "average_unit_price": revenue // quantity if quantity else 0,
            }
        )
    return result
