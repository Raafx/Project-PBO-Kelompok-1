from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import Product
from app.schemas import ProductCreate, ProductUpdate


def _ensure_unique_product(
    session: Session, barcode: str | None, sku: str | None, product_id: str | None = None
) -> None:
    conditions = []
    if barcode:
        conditions.append(Product.barcode == barcode)
    if sku:
        conditions.append(Product.sku == sku)
    if not conditions:
        return
    statement = select(Product).where(or_(*conditions))
    if product_id:
        statement = statement.where(Product.id != product_id)
    duplicate = session.scalar(statement)
    if duplicate is not None:
        field = "barcode" if duplicate.barcode == barcode else "SKU"
        raise HTTPException(status.HTTP_409_CONFLICT, f"{field} produk sudah digunakan")


def create_product(session: Session, payload: ProductCreate) -> Product:
    _ensure_unique_product(session, payload.barcode, payload.sku)
    product = Product(
        **payload.model_dump(),
        stock=0,
        warehouse_stock=0,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def update_product(session: Session, product: Product, payload: ProductUpdate) -> Product:
    values = payload.model_dump(exclude_unset=True)
    _ensure_unique_product(
        session,
        values.get("barcode", product.barcode),
        values.get("sku", product.sku),
        product.id,
    )
    for field, value in values.items():
        setattr(product, field, value)
    session.commit()
    session.refresh(product)
    return product


def archive_product(session: Session, product: Product) -> Product:
    product.is_active = False
    session.commit()
    session.refresh(product)
    return product
