from __future__ import annotations

from datetime import UTC, datetime
from secrets import token_hex

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Cashier,
    Product,
    StockMovement,
    StockTransfer,
    Store,
)
from app.schemas import (
    StockAdjustmentCreate,
    StockItemRead,
    StockTransferCreate,
)


def _transfer_number() -> str:
    return f"TRF-{datetime.now(UTC):%Y%m%d}-{token_hex(3).upper()}"


def stock_item(product: Product) -> StockItemRead:
    if product.stock == 0:
        stock_status = "out"
    elif product.stock <= product.reorder_level:
        stock_status = "low"
    else:
        stock_status = "healthy"
    return StockItemRead(
        id=product.id,
        barcode=product.barcode,
        name=product.name,
        category=product.category,
        location=product.location,
        price=product.price,
        cost_price=product.cost_price,
        stock=product.stock,
        sales_stock=product.stock,
        warehouse_stock=product.warehouse_stock,
        total_stock=product.stock + product.warehouse_stock,
        reorder_level=product.reorder_level,
        stock_status=stock_status,
    )


def adjust_stock(session: Session, payload: StockAdjustmentCreate, actor: Cashier) -> StockMovement:
    product = session.scalar(
        select(Product).where(Product.id == payload.product_id).with_for_update()
    )
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    store = session.scalar(select(Store).where(Store.code == payload.store_code))
    if store is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Toko tidak ditemukan")
    area = payload.area.value
    current_stock = product.warehouse_stock if area == "warehouse" else product.stock
    next_stock = current_stock + payload.quantity_change
    if next_stock < 0:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Stok tidak boleh negatif")
    if area == "warehouse":
        product.warehouse_stock = next_stock
    else:
        product.stock = next_stock
    movement = StockMovement(
        product_id=product.id,
        store_id=store.id,
        movement_type="adjustment",
        stock_area=area,
        quantity_change=payload.quantity_change,
        balance_after=next_stock,
        reference_type="manual_adjustment",
        created_by_id=actor.id,
        note=payload.note,
    )
    session.add(movement)
    session.commit()
    session.refresh(movement)
    return movement


def transfer_stock(session: Session, payload: StockTransferCreate, actor: Cashier) -> StockTransfer:
    from_area = payload.from_area.value
    to_area = payload.to_area.value
    if from_area == to_area:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Lokasi asal dan tujuan harus berbeda",
        )
    product = session.scalar(
        select(Product).where(Product.id == payload.product_id).with_for_update()
    )
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    store = session.scalar(select(Store).where(Store.code == payload.store_code))
    if store is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Toko tidak ditemukan")

    source_balance = product.warehouse_stock if from_area == "warehouse" else product.stock
    if source_balance < payload.quantity:
        source_label = "gudang" if from_area == "warehouse" else "kasir"
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Stok {source_label} tidak cukup. Tersedia {source_balance}",
        )

    if from_area == "warehouse":
        product.warehouse_stock -= payload.quantity
        product.stock += payload.quantity
        source_after = product.warehouse_stock
        destination_after = product.stock
    else:
        product.stock -= payload.quantity
        product.warehouse_stock += payload.quantity
        source_after = product.stock
        destination_after = product.warehouse_stock

    transfer = StockTransfer(
        transfer_no=_transfer_number(),
        product_id=product.id,
        store_id=store.id,
        quantity=payload.quantity,
        from_area=from_area,
        to_area=to_area,
        note=payload.note,
        created_by_id=actor.id,
    )
    session.add(transfer)
    session.flush()
    movement_note = payload.note or f"Transfer {transfer.transfer_no}"
    session.add_all(
        [
            StockMovement(
                product_id=product.id,
                store_id=store.id,
                movement_type="transfer",
                stock_area=from_area,
                quantity_change=-payload.quantity,
                balance_after=source_after,
                unit_cost=product.cost_price,
                reference_type="stock_transfer",
                reference_id=transfer.id,
                created_by_id=actor.id,
                note=movement_note,
            ),
            StockMovement(
                product_id=product.id,
                store_id=store.id,
                movement_type="transfer",
                stock_area=to_area,
                quantity_change=payload.quantity,
                balance_after=destination_after,
                unit_cost=product.cost_price,
                reference_type="stock_transfer",
                reference_id=transfer.id,
                created_by_id=actor.id,
                note=movement_note,
            ),
        ]
    )
    session.commit()
    session.refresh(transfer)
    return transfer
