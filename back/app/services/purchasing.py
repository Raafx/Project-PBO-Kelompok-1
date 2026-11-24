"""Pencatatan supplier dan pembelian langsung ke stok gudang."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime
from secrets import token_hex

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Cashier,
    Product,
    PurchaseOrder,
    PurchaseOrderItem,
    StockMovement,
    Store,
    Supplier,
)
from app.schemas import DirectPurchaseCreate, SupplierCreate


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _purchase_number() -> str:
    return f"PUR-{datetime.now(UTC):%Y%m%d}-{token_hex(3).upper()}"


@dataclass
class RequestedLine:
    quantity: int = 0
    unit_cost: int | None = None


def _requested_lines(payload: DirectPurchaseCreate) -> dict[str, RequestedLine]:
    requested: dict[str, RequestedLine] = defaultdict(RequestedLine)
    for line in payload.items:
        requested[line.barcode].quantity += line.quantity
        if line.unit_cost is not None:
            requested[line.barcode].unit_cost = line.unit_cost
    return requested


def _weighted_cost(stock: int, old_cost: int, quantity: int, new_cost: int) -> int:
    total_stock = stock + quantity
    return (stock * old_cost + quantity * new_cost) // total_stock if total_stock else new_cost


def create_supplier(session: Session, payload: SupplierCreate) -> Supplier:
    existing = session.scalar(select(Supplier).where(Supplier.code == payload.code))
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Kode supplier sudah digunakan")
    supplier = Supplier(**payload.model_dump())
    session.add(supplier)
    session.commit()
    session.refresh(supplier)
    return supplier


def record_direct_purchase(
    session: Session,
    payload: DirectPurchaseCreate,
    actor: Cashier,
    idempotency_key: str | None = None,
) -> PurchaseOrder:
    if idempotency_key:
        existing = session.scalar(
            select(PurchaseOrder).where(PurchaseOrder.idempotency_key == idempotency_key)
        )
        if existing is not None:
            return existing
    supplier = session.scalar(
        select(Supplier).where(Supplier.id == payload.supplier_id, Supplier.is_active.is_(True))
    )
    if supplier is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Supplier tidak ditemukan")
    store = session.scalar(select(Store).where(Store.code == payload.store_code))
    if store is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Toko tidak ditemukan")
    today = _now().date()
    if payload.purchase_date and payload.purchase_date > today:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Tanggal pembelian tidak boleh di masa depan",
        )

    requested = _requested_lines(payload)

    products = session.scalars(
        select(Product)
        .where(Product.barcode.in_(requested), Product.is_active.is_(True))
        .with_for_update()
    ).all()
    by_barcode = {product.barcode: product for product in products}
    missing = sorted(set(requested) - set(by_barcode))
    if missing:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Barcode tidak ditemukan: {', '.join(missing)}",
        )

    now = _now()
    purchase_order = PurchaseOrder(
        po_number=_purchase_number(),
        idempotency_key=idempotency_key,
        supplier=supplier,
        store_id=store.id,
        created_by_id=actor.id,
        status="received",
        expected_date=payload.purchase_date or today,
        subtotal=0,
        notes=payload.notes,
        ordered_at=now,
        received_at=now,
    )
    session.add(purchase_order)
    session.flush()

    items: list[PurchaseOrderItem] = []
    subtotal = 0
    for barcode, requested_line in requested.items():
        product = by_barcode[barcode]
        quantity = requested_line.quantity
        if quantity > 100_000:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                f"Jumlah {product.name} melebihi batas 100.000 unit",
            )
        unit_cost = requested_line.unit_cost
        resolved_cost = unit_cost if unit_cost is not None else product.cost_price
        line_total = quantity * resolved_cost
        subtotal += line_total
        current_total_stock = product.stock + product.warehouse_stock
        product.cost_price = _weighted_cost(
            current_total_stock, product.cost_price, quantity, resolved_cost
        )
        product.warehouse_stock += quantity
        items.append(
            PurchaseOrderItem(
                purchase_order_id=purchase_order.id,
                product_id=product.id,
                barcode=product.barcode,
                product_name=product.name,
                quantity_ordered=quantity,
                quantity_received=quantity,
                unit_cost=resolved_cost,
                subtotal=line_total,
            )
        )
        session.add(
            StockMovement(
                product_id=product.id,
                store_id=store.id,
                movement_type="purchase",
                stock_area="warehouse",
                quantity_change=quantity,
                balance_after=product.warehouse_stock,
                unit_cost=resolved_cost,
                reference_type="purchase",
                reference_id=purchase_order.id,
                created_by_id=actor.id,
                note=f"Pembelian {purchase_order.po_number}",
            )
        )

    purchase_order.subtotal = subtotal
    purchase_order.items = items
    session.commit()
    session.refresh(purchase_order)
    return purchase_order
