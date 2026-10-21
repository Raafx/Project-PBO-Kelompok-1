from __future__ import annotations

from collections import defaultdict
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
    StockTransfer,
    Store,
    Supplier,
)
from app.schemas import (
    DirectPurchaseCreate,
    StockAdjustmentCreate,
    StockItemRead,
    StockTransferCreate,
    SupplierCreate,
)


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _purchase_number() -> str:
    return f"PUR-{datetime.now(UTC):%Y%m%d}-{token_hex(3).upper()}"


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

    requested: dict[str, dict[str, int | None]] = defaultdict(
        lambda: {"quantity": 0, "unit_cost": None}
    )
    for line in payload.items:
        requested[line.barcode]["quantity"] = (
            int(requested[line.barcode]["quantity"] or 0) + line.quantity
        )
        if line.unit_cost is not None:
            requested[line.barcode]["unit_cost"] = line.unit_cost

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
        quantity = int(requested_line["quantity"] or 0)
        if quantity > 100_000:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                f"Jumlah {product.name} melebihi batas 100.000 unit",
            )
        unit_cost = requested_line["unit_cost"]
        resolved_cost = int(unit_cost) if unit_cost is not None else product.cost_price
        line_total = quantity * resolved_cost
        subtotal += line_total
        current_total_stock = product.stock + product.warehouse_stock
        next_total_stock = current_total_stock + quantity
        product.cost_price = (
            ((current_total_stock * product.cost_price) + line_total) // next_total_stock
            if next_total_stock
            else resolved_cost
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
