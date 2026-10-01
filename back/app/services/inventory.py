from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime
from secrets import token_hex

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Product,
    PurchaseOrder,
    PurchaseOrderItem,
    StockMovement,
    Store,
    Supplier,
)
from app.schemas import (
    PurchaseOrderCreate,
    ReceivePurchaseOrder,
    StockAdjustmentCreate,
    StockItemRead,
    SupplierCreate,
)


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _po_number() -> str:
    return f"PO-{datetime.now(UTC):%Y%m%d}-{token_hex(3).upper()}"


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


def create_purchase_order(session: Session, payload: PurchaseOrderCreate) -> PurchaseOrder:
    supplier = session.scalar(
        select(Supplier).where(Supplier.id == payload.supplier_id, Supplier.is_active.is_(True))
    )
    if supplier is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Supplier tidak ditemukan")
    store = session.scalar(select(Store).where(Store.code == payload.store_code))
    if store is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Toko tidak ditemukan")

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
        select(Product).where(Product.barcode.in_(requested), Product.is_active.is_(True))
    ).all()
    by_barcode = {product.barcode: product for product in products}
    missing = sorted(set(requested) - set(by_barcode))
    if missing:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Barcode tidak ditemukan: {', '.join(missing)}",
        )

    subtotal = 0
    items: list[PurchaseOrderItem] = []
    for barcode, requested_line in requested.items():
        product = by_barcode[barcode]
        quantity = int(requested_line["quantity"] or 0)
        if quantity > 100_000:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Jumlah item terlalu besar")
        unit_cost = requested_line["unit_cost"]
        resolved_cost = int(unit_cost) if unit_cost is not None else product.cost_price
        line_total = quantity * resolved_cost
        subtotal += line_total
        items.append(
            PurchaseOrderItem(
                product_id=product.id,
                barcode=product.barcode,
                product_name=product.name,
                quantity_ordered=quantity,
                quantity_received=0,
                unit_cost=resolved_cost,
                subtotal=line_total,
            )
        )

    purchase_order = PurchaseOrder(
        po_number=_po_number(),
        supplier=supplier,
        store_id=store.id,
        status="draft",
        expected_date=payload.expected_date,
        subtotal=subtotal,
        notes=payload.notes,
        items=items,
    )
    session.add(purchase_order)
    session.commit()
    session.refresh(purchase_order)
    return purchase_order


def submit_purchase_order(session: Session, purchase_order_id: str) -> PurchaseOrder:
    purchase_order = session.scalar(
        select(PurchaseOrder).where(PurchaseOrder.id == purchase_order_id).with_for_update()
    )
    if purchase_order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Purchase order tidak ditemukan")
    if purchase_order.status != "draft":
        raise HTTPException(status.HTTP_409_CONFLICT, "Hanya draft yang dapat dikirim")
    purchase_order.status = "ordered"
    purchase_order.ordered_at = _now()
    session.commit()
    session.refresh(purchase_order)
    return purchase_order


def receive_purchase_order(
    session: Session, purchase_order_id: str, payload: ReceivePurchaseOrder
) -> PurchaseOrder:
    purchase_order = session.scalar(
        select(PurchaseOrder).where(PurchaseOrder.id == purchase_order_id).with_for_update()
    )
    if purchase_order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Purchase order tidak ditemukan")
    if purchase_order.status not in {"ordered", "partially_received"}:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Purchase order harus berstatus dipesan sebelum barang diterima",
        )

    items_by_id = {item.id: item for item in purchase_order.items}
    requested: dict[str, int] = {}
    if payload.items:
        for line in payload.items:
            if line.item_id in requested:
                raise HTTPException(
                    status.HTTP_422_UNPROCESSABLE_CONTENT, "Item penerimaan duplikat"
                )
            requested[line.item_id] = line.quantity
    else:
        requested = {
            item.id: item.quantity_ordered - item.quantity_received
            for item in purchase_order.items
            if item.quantity_received < item.quantity_ordered
        }
    if not requested:
        raise HTTPException(status.HTTP_409_CONFLICT, "Tidak ada barang tersisa untuk diterima")

    unknown_items = set(requested) - set(items_by_id)
    if unknown_items:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Item tidak termasuk dalam PO")

    products = session.scalars(
        select(Product)
        .where(Product.id.in_([items_by_id[item_id].product_id for item_id in requested]))
        .with_for_update()
    ).all()
    products_by_id = {product.id: product for product in products}

    for item_id, quantity in requested.items():
        item = items_by_id[item_id]
        remaining = item.quantity_ordered - item.quantity_received
        if quantity > remaining:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                f"Penerimaan {item.product_name} melebihi sisa pesanan",
            )
        product = products_by_id[item.product_id]
        old_stock = product.stock
        new_stock = old_stock + quantity
        product.cost_price = (
            ((old_stock * product.cost_price) + (quantity * item.unit_cost)) // new_stock
            if new_stock
            else item.unit_cost
        )
        product.stock = new_stock
        item.quantity_received += quantity
        session.add(
            StockMovement(
                product_id=product.id,
                store_id=purchase_order.store_id,
                movement_type="purchase",
                quantity_change=quantity,
                balance_after=new_stock,
                unit_cost=item.unit_cost,
                reference_type="purchase_order",
                reference_id=purchase_order.id,
                note=f"Penerimaan {purchase_order.po_number}",
            )
        )

    fully_received = all(
        item.quantity_received == item.quantity_ordered for item in purchase_order.items
    )
    purchase_order.status = "received" if fully_received else "partially_received"
    if fully_received:
        purchase_order.received_at = _now()
    session.commit()
    session.refresh(purchase_order)
    return purchase_order


def adjust_stock(session: Session, payload: StockAdjustmentCreate) -> StockMovement:
    product = session.scalar(
        select(Product).where(Product.id == payload.product_id).with_for_update()
    )
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    store = session.scalar(select(Store).where(Store.code == payload.store_code))
    if store is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Toko tidak ditemukan")
    next_stock = product.stock + payload.quantity_change
    if next_stock < 0:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Stok tidak boleh negatif")
    product.stock = next_stock
    movement = StockMovement(
        product_id=product.id,
        store_id=store.id,
        movement_type="adjustment",
        quantity_change=payload.quantity_change,
        balance_after=next_stock,
        reference_type="manual_adjustment",
        note=payload.note,
    )
    session.add(movement)
    session.commit()
    session.refresh(movement)
    return movement
