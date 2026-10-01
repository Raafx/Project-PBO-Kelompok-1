from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Member, Product, Sale, Voucher
from app.schemas import (
    CheckoutCreate,
    HoldCreate,
    MemberRead,
    ProductRead,
    SaleRead,
    VoucherResult,
    VoucherValidate,
)
from app.services.sales import checkout, hold

router = APIRouter()
DbSession = Annotated[Session, Depends(get_db)]


@router.get("/products", response_model=list[ProductRead])
def list_products(
    session: DbSession,
    search: Annotated[str | None, Query(max_length=120)] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
) -> list[Product]:
    statement = (
        select(Product).where(Product.is_active.is_(True)).order_by(Product.name).limit(limit)
    )
    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Product.barcode == search.strip(),
                Product.name.like(term),
                Product.category.like(term),
            )
        )
    return list(session.scalars(statement).all())


@router.get("/products/barcode/{barcode}", response_model=ProductRead)
def product_by_barcode(barcode: str, session: DbSession) -> Product:
    product = session.scalar(
        select(Product).where(Product.barcode == barcode, Product.is_active.is_(True))
    )
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    return product


@router.get("/members/by-phone/{phone}", response_model=MemberRead)
def member_by_phone(phone: str, session: DbSession) -> Member:
    normalized = "".join(character for character in phone if character.isdigit())
    member = session.scalar(
        select(Member).where(Member.phone == normalized, Member.is_active.is_(True))
    )
    if member is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member tidak ditemukan")
    return member


@router.post("/vouchers/validate", response_model=VoucherResult)
def validate_voucher(payload: VoucherValidate, session: DbSession) -> VoucherResult:
    code = payload.code.strip().upper()
    voucher = session.scalar(
        select(Voucher).where(Voucher.code == code, Voucher.is_active.is_(True))
    )
    if voucher is None or payload.total < voucher.min_purchase:
        return VoucherResult(valid=False, code=code, message="Voucher tidak valid")
    return VoucherResult(valid=True, code=code, message="Voucher dapat digunakan")


@router.post("/sales/checkout", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
def create_checkout(
    payload: CheckoutCreate,
    session: DbSession,
    idempotency_key: Annotated[
        str | None, Header(alias="X-Idempotency-Key", max_length=128)
    ] = None,
) -> Sale:
    return checkout(session, payload, idempotency_key)


@router.post("/sales/hold", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
def create_hold(payload: HoldCreate, session: DbSession) -> Sale:
    return hold(session, payload)


@router.get("/sales/holds", response_model=list[SaleRead])
def list_holds(
    session: DbSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> list[Sale]:
    statement = (
        select(Sale).where(Sale.status == "held").order_by(Sale.created_at.desc()).limit(limit)
    )
    return list(session.scalars(statement).all())


@router.get("/sales/{transaction_no}", response_model=SaleRead)
def sale_detail(transaction_no: str, session: DbSession) -> Sale:
    sale = session.scalar(select(Sale).where(Sale.transaction_no == transaction_no))
    if sale is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Transaksi tidak ditemukan")
    return sale
