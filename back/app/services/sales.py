from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime
from secrets import token_hex

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    BusinessSetting,
    Cashier,
    Member,
    Payment,
    Product,
    Promotion,
    Sale,
    SaleItem,
    Shift,
    StockMovement,
    Store,
    Voucher,
)
from app.schemas import CheckoutCreate, HoldCreate, PaymentCreate
from app.services.access import ensure_permission


def _transaction_number(prefix: str = "TRX") -> str:
    timestamp = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
    return f"{prefix}-{timestamp}-{token_hex(3).upper()}"


def _resolve_context(
    session: Session, store_code: str, cashier_code: str, member_phone: str | None
) -> tuple[Store, Cashier, Member | None]:
    store = session.scalar(select(Store).where(Store.code == store_code))
    if store is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Toko tidak ditemukan")

    cashier = session.scalar(
        select(Cashier).where(
            Cashier.employee_code == cashier_code,
            Cashier.is_active.is_(True),
        )
    )
    if cashier is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "Kasir tidak aktif atau tidak ditemukan"
        )
    ensure_permission(cashier, "pos.access")

    member = None
    if member_phone:
        normalized_phone = "".join(character for character in member_phone if character.isdigit())
        member = session.scalar(
            select(Member).where(Member.phone == normalized_phone, Member.is_active.is_(True))
        )
        if member is None:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Member tidak ditemukan")
    return store, cashier, member


def _build_items(
    session: Session, requested_items: list
) -> tuple[list[SaleItem], int, int, int, dict[str, Product]]:
    quantities: dict[str, int] = defaultdict(int)
    for item in requested_items:
        quantities[item.barcode] += item.quantity
        if quantities[item.barcode] > 999:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Jumlah produk maksimal 999")

    products = session.scalars(
        select(Product)
        .where(Product.barcode.in_(quantities), Product.is_active.is_(True))
        .with_for_update()
    ).all()
    products_by_barcode = {product.barcode: product for product in products}
    missing = sorted(set(quantities) - set(products_by_barcode))
    if missing:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Barcode tidak ditemukan: {', '.join(missing)}",
        )

    items: list[SaleItem] = []
    subtotal = 0
    total_discount = 0
    item_count = 0
    now = datetime.now(UTC).replace(tzinfo=None)
    promotions = session.scalars(
        select(Promotion).where(
            Promotion.is_active.is_(True),
            Promotion.starts_at <= now,
            Promotion.ends_at >= now,
        )
    ).all()
    for barcode, quantity in quantities.items():
        product = products_by_barcode[barcode]
        if product.stock < quantity:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                f"Stok {product.name} tidak cukup. Tersedia {product.stock}",
            )
        line_total = product.price * quantity
        discounts = [0]
        for promotion in promotions:
            if promotion.product_id not in {None, product.id} or quantity < promotion.min_quantity:
                continue
            if promotion.promotion_type == "percent":
                discounts.append(line_total * promotion.value // 100)
            elif promotion.promotion_type == "fixed":
                discounts.append(min(line_total, promotion.value * quantity))
            elif promotion.promotion_type == "wholesale" and promotion.value < product.price:
                discounts.append((product.price - promotion.value) * quantity)
            elif (
                promotion.promotion_type == "buy_x_get_y"
                and promotion.buy_quantity
                and promotion.free_quantity
            ):
                group = promotion.buy_quantity + promotion.free_quantity
                free_units = quantity // group * promotion.free_quantity
                discounts.append(free_units * product.price)
        discount = min(line_total, max(discounts))
        subtotal += line_total
        total_discount += discount
        item_count += quantity
        items.append(
            SaleItem(
                product_id=product.id,
                barcode=product.barcode,
                product_name=product.name,
                unit_price=product.price,
                unit_cost=product.cost_price,
                quantity=quantity,
                discount=discount,
                subtotal=line_total - discount,
            )
        )
    return items, subtotal, total_discount, item_count, products_by_barcode


def _validate_payment(session: Session, payment: PaymentCreate, total: int) -> Payment:
    method = payment.method.value
    received_amount = None
    change_amount = None
    approval_code = (payment.approval_code or "").strip()
    card_type = None
    card_last4 = None

    if method == "cash":
        received_amount = total if payment.received_amount is None else payment.received_amount
        if received_amount < total:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Uang diterima kurang")
        change_amount = received_amount - total
    elif method == "qris":
        if not payment.confirmed:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                "Pembayaran QRIS belum dikonfirmasi",
            )
        if len(approval_code) < 4:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                "Nomor approval QRIS wajib diisi",
            )
    elif method == "edc":
        card_digits = "".join(
            character for character in (payment.card_number or "") if character.isdigit()
        )
        if payment.card_type not in {"debit", "credit"}:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                "Pilih jenis kartu Debit atau Kredit",
            )
        if not 12 <= len(card_digits) <= 19:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                "Nomor kartu EDC harus 12 sampai 19 digit",
            )
        if len(approval_code) < 4:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                "Nomor approval EDC wajib diisi",
            )
        if not payment.confirmed:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                "Pembayaran EDC belum dikonfirmasi",
            )
        card_type = payment.card_type
        card_last4 = card_digits[-4:]
    elif method in {"debit", "credit", "wallet"} and not payment.confirmed:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Pembayaran non-tunai belum dikonfirmasi",
        )
    elif method == "voucher":
        code = (payment.voucher_code or "").strip().upper()
        voucher = session.scalar(
            select(Voucher).where(Voucher.code == code, Voucher.is_active.is_(True))
        )
        now = datetime.now(UTC).replace(tzinfo=None)
        is_in_period = bool(
            voucher
            and (voucher.starts_at is None or voucher.starts_at <= now)
            and (voucher.ends_at is None or voucher.ends_at >= now)
        )
        if not is_in_period or voucher is None or total < voucher.min_purchase:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Voucher tidak valid")

    return Payment(
        method=method,
        amount=total,
        received_amount=received_amount,
        change_amount=change_amount,
        approval_code=approval_code or None,
        card_type=card_type,
        card_last4=card_last4,
        voucher_code=(payment.voucher_code or "").strip().upper() or None,
        status="paid",
    )


def _tax_total(session: Session, net_amount: int) -> tuple[int, int]:
    rate_setting = session.get(BusinessSetting, "tax.rate")
    included_setting = session.get(BusinessSetting, "tax.included")
    try:
        rate = max(0, int(rate_setting.value if rate_setting else "0"))
    except ValueError:
        rate = 0
    included = (included_setting.value if included_setting else "true").lower() == "true"
    if not rate:
        return 0, net_amount
    if included:
        return net_amount * rate // (100 + rate), net_amount
    tax = net_amount * rate // 100
    return tax, net_amount + tax


def checkout(session: Session, payload: CheckoutCreate, idempotency_key: str | None) -> Sale:
    if idempotency_key:
        existing = session.scalar(select(Sale).where(Sale.idempotency_key == idempotency_key))
        if existing is not None:
            return existing

    store, cashier, member = _resolve_context(
        session, payload.store_code, payload.cashier_code, payload.member_phone
    )
    items, subtotal, discount, item_count, products_by_barcode = _build_items(
        session, payload.items
    )
    tax, total = _tax_total(session, subtotal - discount)
    payment = _validate_payment(session, payload.payment, total)
    sale = Sale(
        transaction_no=_transaction_number(),
        idempotency_key=idempotency_key,
        store_id=store.id,
        cashier_id=cashier.id,
        shift_id=session.scalar(
            select(Shift.id).where(
                Shift.store_id == store.id,
                Shift.cashier_id == cashier.id,
                Shift.status == "open",
            )
        ),
        member_id=member.id if member else None,
        status="completed",
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        rounding=0,
        total=total,
        item_count=item_count,
        items=items,
        payment=payment,
    )
    session.add(sale)
    session.flush()
    for item in items:
        product = products_by_barcode[item.barcode]
        product.stock -= item.quantity
        session.add(
            StockMovement(
                product_id=product.id,
                store_id=store.id,
                movement_type="sale",
                stock_area="sales",
                quantity_change=-item.quantity,
                balance_after=product.stock,
                unit_cost=product.cost_price,
                reference_type="sale",
                reference_id=sale.id,
                created_by_id=cashier.id,
                note=f"Penjualan {sale.transaction_no}",
            )
        )
    if member:
        member.points += total // 10_000
    session.commit()
    session.refresh(sale)
    return sale


def hold(session: Session, payload: HoldCreate) -> Sale:
    store, cashier, member = _resolve_context(
        session, payload.store_code, payload.cashier_code, payload.member_phone
    )
    items, subtotal, discount, item_count, _ = _build_items(session, payload.items)
    tax, total = _tax_total(session, subtotal - discount)
    sale = Sale(
        transaction_no=_transaction_number("HOLD"),
        store_id=store.id,
        cashier_id=cashier.id,
        shift_id=session.scalar(
            select(Shift.id).where(
                Shift.store_id == store.id,
                Shift.cashier_id == cashier.id,
                Shift.status == "open",
            )
        ),
        member_id=member.id if member else None,
        status="held",
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        rounding=0,
        total=total,
        item_count=item_count,
        notes=payload.notes,
        items=items,
    )
    session.add(sale)
    session.commit()
    session.refresh(sale)
    return sale
