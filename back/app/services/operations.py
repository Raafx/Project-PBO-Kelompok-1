from __future__ import annotations

import base64
import hashlib
import hmac
import json
from datetime import UTC, datetime, timedelta
from secrets import token_hex, token_urlsafe
from urllib.parse import quote, urlencode

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models import (
    AuditLog,
    AuthSession,
    Cashier,
    CashMovement,
    CatalogOption,
    FinanceEntry,
    Member,
    PasswordResetToken,
    Payment,
    Product,
    ProductBatch,
    Promotion,
    PurchaseOrder,
    PurchaseOrderItem,
    Sale,
    SaleReturn,
    Shift,
    StockCount,
    StockMovement,
    Store,
    Supplier,
    TotpChallenge,
)
from app.schemas_operations import (
    CashMovementCreate,
    CatalogOptionCreate,
    FinanceEntryCreate,
    LoginRead,
    LoginStatus,
    MemberCreate,
    MemberUpdate,
    ProductBatchCreate,
    PromotionCreate,
    PurchaseOrderDraftCreate,
    PurchaseReceiveCreate,
    PurchaseReturnCreate,
    ShiftRead,
    StockCountCreate,
)
from app.services.access import access_profile, ensure_permission


def now_utc() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def hash_secret(value: str) -> str:
    salt = token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", value.encode(), salt.encode(), 210_000).hex()
    return f"pbkdf2_sha256$210000${salt}${digest}"


def verify_secret(value: str, encoded: str | None) -> bool:
    if not encoded:
        return False
    try:
        algorithm, iterations, salt, expected = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", value.encode(), salt.encode(), int(iterations)).hex()
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


TOTP_ISSUER = "MYMARKET"
TOTP_PERIOD_SECONDS = 30
TOTP_DIGITS = 6


def generate_totp_secret() -> str:
    return base64.b32encode(bytes.fromhex(token_hex(20))).decode().rstrip("=")


def totp_provisioning_uri(secret: str, account_name: str) -> str:
    label = quote(f"{TOTP_ISSUER}:{account_name}", safe=":")
    query = urlencode(
        {
            "secret": secret,
            "issuer": TOTP_ISSUER,
            "algorithm": "SHA1",
            "digits": TOTP_DIGITS,
            "period": TOTP_PERIOD_SECONDS,
        }
    )
    return f"otpauth://totp/{label}?{query}"


def _totp_code(secret: str, counter: int) -> str:
    padding = "=" * ((8 - len(secret) % 8) % 8)
    key = base64.b32decode(secret + padding, casefold=True)
    digest = hmac.new(key, counter.to_bytes(8, "big"), hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    value = int.from_bytes(digest[offset : offset + 4], "big") & 0x7FFFFFFF
    return f"{value % (10**TOTP_DIGITS):0{TOTP_DIGITS}d}"


def verify_totp_code(secret: str, code: str, last_counter: int | None = None) -> int | None:
    # TOTP selalu memakai Unix time UTC. `now_utc()` sengaja menghasilkan
    # datetime naive untuk kompatibilitas kolom MySQL; memanggil timestamp()
    # padanya akan dianggap sebagai waktu lokal (WITA) dan menggeser kode 8 jam.
    current_counter = int(datetime.now(UTC).timestamp()) // TOTP_PERIOD_SECONDS
    for window_offset in (0, -1, 1):
        counter = current_counter + window_offset
        if last_counter is not None and counter <= last_counter:
            continue
        if hmac.compare_digest(_totp_code(secret, counter), code):
            return counter
    return None


def write_audit(
    session: Session,
    actor: Cashier | None,
    action: str,
    entity_type: str,
    entity_id: str | None,
    details: dict[str, object] | None = None,
) -> None:
    session.add(
        AuditLog(
            actor_id=actor.id if actor else None,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details_json=json.dumps(details or {}, ensure_ascii=False),
        )
    )


def store_by_code(session: Session, code: str) -> Store:
    store = session.scalar(select(Store).where(Store.code == code.strip().upper()))
    if store is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Toko tidak ditemukan")
    return store


def cashier_by_code(session: Session, code: str) -> Cashier:
    cashier = session.scalar(
        select(Cashier).where(
            Cashier.employee_code == code.strip().upper(), Cashier.is_active.is_(True)
        )
    )
    if cashier is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kasir tidak ditemukan atau nonaktif")
    return cashier


def shift_summary(session: Session, shift: Shift) -> ShiftRead:
    store = session.get(Store, shift.store_id)
    cashier = session.get(Cashier, shift.cashier_id)
    movements = list(
        session.scalars(
            select(CashMovement)
            .where(CashMovement.shift_id == shift.id)
            .order_by(CashMovement.created_at)
        ).all()
    )
    cash_sales = int(
        session.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0))
            .join(Sale, Sale.id == Payment.sale_id)
            .where(
                Sale.shift_id == shift.id,
                Sale.status == "completed",
                Payment.status == "paid",
                Payment.method == "cash",
            )
        )
        or 0
    )
    cash_in = sum(item.amount for item in movements if item.movement_type == "cash_in")
    cash_out = sum(item.amount for item in movements if item.movement_type == "cash_out")
    expected = shift.opening_cash + cash_sales + cash_in - cash_out
    difference = shift.closing_cash - expected if shift.closing_cash is not None else None
    return ShiftRead(
        id=shift.id,
        store_code=store.code if store else "",
        cashier_code=cashier.employee_code if cashier else "",
        cashier_name=cashier.full_name if cashier else "Kasir",
        opened_at=shift.opened_at,
        closed_at=shift.closed_at,
        opening_cash=shift.opening_cash,
        cash_sales=cash_sales,
        cash_in=cash_in,
        cash_out=cash_out,
        expected_cash=expected,
        closing_cash=shift.closing_cash,
        difference=difference,
        status=shift.status,
        movements=movements,
    )


def current_shift(session: Session, store_code: str, cashier_code: str) -> ShiftRead | None:
    store = store_by_code(session, store_code)
    cashier = cashier_by_code(session, cashier_code)
    shift = session.scalar(
        select(Shift)
        .where(
            Shift.store_id == store.id,
            Shift.cashier_id == cashier.id,
            Shift.status == "open",
        )
        .order_by(Shift.opened_at.desc())
    )
    return shift_summary(session, shift) if shift else None


def open_shift(
    session: Session, store_code: str, cashier_code: str, opening_cash: int
) -> ShiftRead:
    if current_shift(session, store_code, cashier_code):
        raise HTTPException(status.HTTP_409_CONFLICT, "Kasir masih memiliki shift aktif")
    store = store_by_code(session, store_code)
    cashier = cashier_by_code(session, cashier_code)
    ensure_permission(cashier, "pos.access")
    shift = Shift(
        store_id=store.id,
        cashier_id=cashier.id,
        opening_cash=opening_cash,
        status="open",
    )
    session.add(shift)
    session.flush()
    write_audit(
        session,
        cashier,
        "shift.open",
        "shift",
        shift.id,
        {"opening_cash": opening_cash},
    )
    session.commit()
    session.refresh(shift)
    return shift_summary(session, shift)


def add_cash_movement(
    session: Session, shift_id: str, payload: CashMovementCreate, cashier_code: str
) -> ShiftRead:
    cashier = cashier_by_code(session, cashier_code)
    shift = session.get(Shift, shift_id)
    if shift is None or shift.status != "open":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Shift aktif tidak ditemukan")
    if shift.cashier_id != cashier.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Shift ini milik kasir lain")
    movement = CashMovement(
        shift_id=shift.id,
        movement_type=payload.movement_type.value,
        category=payload.category.strip(),
        amount=payload.amount,
        note=(payload.note or "").strip() or None,
        created_by_id=cashier.id,
    )
    session.add(movement)
    session.flush()
    write_audit(
        session,
        cashier,
        f"cash.{payload.movement_type.value}",
        "cash_movement",
        movement.id,
        {"amount": payload.amount, "category": payload.category},
    )
    session.commit()
    return shift_summary(session, shift)


def close_shift(session: Session, shift_id: str, cashier_code: str, closing_cash: int) -> ShiftRead:
    cashier = cashier_by_code(session, cashier_code)
    shift = session.get(Shift, shift_id)
    if shift is None or shift.status != "open":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Shift aktif tidak ditemukan")
    if shift.cashier_id != cashier.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Shift ini milik kasir lain")
    summary = shift_summary(session, shift)
    shift.closing_cash = closing_cash
    shift.closed_at = now_utc()
    shift.status = "closed"
    write_audit(
        session,
        cashier,
        "shift.close",
        "shift",
        shift.id,
        {"expected_cash": summary.expected_cash, "closing_cash": closing_cash},
    )
    session.commit()
    session.refresh(shift)
    return shift_summary(session, shift)


def void_sale(
    session: Session,
    transaction_no: str,
    supervisor_code: str,
    supervisor_pin: str,
    reason: str,
) -> SaleReturn:
    supervisor = cashier_by_code(session, supervisor_code)
    ensure_permission(supervisor, "pos.supervise")
    if not verify_secret(supervisor_pin, supervisor.pin_hash):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "PIN supervisor salah")
    sale = session.scalar(select(Sale).where(Sale.transaction_no == transaction_no))
    if sale is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Transaksi tidak ditemukan")
    if sale.status != "completed":
        raise HTTPException(status.HTTP_409_CONFLICT, "Transaksi tidak dapat di-void")
    if session.scalar(select(SaleReturn).where(SaleReturn.sale_id == sale.id)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Transaksi sudah pernah diretur")

    for item in sale.items:
        product = session.get(Product, item.product_id)
        if product:
            product.stock += item.quantity
            session.add(
                StockMovement(
                    product_id=product.id,
                    store_id=sale.store_id,
                    movement_type="return",
                    stock_area="sales",
                    quantity_change=item.quantity,
                    balance_after=product.stock,
                    unit_cost=product.cost_price,
                    reference_type="sale_return",
                    reference_id=sale.id,
                    created_by_id=supervisor.id,
                    note=f"Void {sale.transaction_no}: {reason}",
                )
            )
    sale.status = "cancelled"
    if sale.member_id:
        member = session.get(Member, sale.member_id)
        if member:
            member.points = max(0, member.points - sale.total // 10_000)
    if sale.payment:
        sale.payment.status = "failed"
    sale_return = SaleReturn(
        return_no=f"RET-{datetime.now(UTC):%Y%m%d}-{token_hex(3).upper()}",
        sale_id=sale.id,
        supervisor_id=supervisor.id,
        amount=sale.total,
        reason=reason.strip(),
    )
    session.add(sale_return)
    session.flush()
    write_audit(
        session,
        supervisor,
        "sale.void",
        "sale",
        sale.id,
        {"transaction_no": sale.transaction_no, "amount": sale.total, "reason": reason},
    )
    session.commit()
    session.refresh(sale_return)
    return sale_return


def create_catalog_option(
    session: Session, payload: CatalogOptionCreate, actor: Cashier
) -> CatalogOption:
    exists = session.scalar(
        select(CatalogOption).where(
            CatalogOption.kind == payload.kind.value, CatalogOption.code == payload.code
        )
    )
    if exists:
        raise HTTPException(status.HTTP_409_CONFLICT, "Kode master sudah digunakan")
    item = CatalogOption(**payload.model_dump(mode="json"))
    session.add(item)
    session.flush()
    write_audit(session, actor, "catalog.create", "catalog_option", item.id, {"name": item.name})
    session.commit()
    session.refresh(item)
    return item


def create_promotion(session: Session, payload: PromotionCreate, actor: Cashier) -> Promotion:
    if session.scalar(select(Promotion).where(Promotion.code == payload.code.strip().upper())):
        raise HTTPException(status.HTTP_409_CONFLICT, "Kode promo sudah digunakan")
    if payload.product_id and session.get(Product, payload.product_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk promo tidak ditemukan")
    values = payload.model_dump()
    values["code"] = payload.code.strip().upper()
    values["promotion_type"] = payload.promotion_type.value
    values["starts_at"] = payload.starts_at.replace(tzinfo=None)
    values["ends_at"] = payload.ends_at.replace(tzinfo=None)
    promotion = Promotion(**values)
    session.add(promotion)
    session.flush()
    write_audit(
        session, actor, "promotion.create", "promotion", promotion.id, {"code": promotion.code}
    )
    session.commit()
    session.refresh(promotion)
    return promotion


def create_batch(session: Session, payload: ProductBatchCreate, actor: Cashier) -> ProductBatch:
    product = session.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    store = store_by_code(session, payload.store_code)
    if session.scalar(
        select(ProductBatch).where(
            ProductBatch.product_id == product.id, ProductBatch.batch_no == payload.batch_no
        )
    ):
        raise HTTPException(status.HTTP_409_CONFLICT, "Nomor batch sudah digunakan")
    batch = ProductBatch(
        product_id=product.id,
        store_id=store.id,
        batch_no=payload.batch_no.strip().upper(),
        expiry_date=payload.expiry_date,
        quantity=payload.quantity,
    )
    session.add(batch)
    session.flush()
    write_audit(
        session, actor, "batch.create", "product_batch", batch.id, {"batch": batch.batch_no}
    )
    session.commit()
    session.refresh(batch)
    return batch


def perform_stock_count(session: Session, payload: StockCountCreate, actor: Cashier) -> StockCount:
    product = session.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    store = store_by_code(session, payload.store_code)
    field = "warehouse_stock" if payload.stock_area.value == "warehouse" else "stock"
    system_quantity = int(getattr(product, field))
    difference = payload.physical_quantity - system_quantity
    setattr(product, field, payload.physical_quantity)
    count = StockCount(
        product_id=product.id,
        store_id=store.id,
        stock_area=payload.stock_area.value,
        system_quantity=system_quantity,
        physical_quantity=payload.physical_quantity,
        difference=difference,
        note=(payload.note or "").strip() or None,
        counted_by_id=actor.id,
    )
    session.add(count)
    session.flush()
    if difference:
        session.add(
            StockMovement(
                product_id=product.id,
                store_id=store.id,
                movement_type="adjustment",
                stock_area=payload.stock_area.value,
                quantity_change=difference,
                balance_after=payload.physical_quantity,
                unit_cost=product.cost_price,
                reference_type="stock_count",
                reference_id=count.id,
                created_by_id=actor.id,
                note=payload.note or "Stock opname",
            )
        )
    write_audit(
        session,
        actor,
        "stock.count",
        "product",
        product.id,
        {"system": system_quantity, "physical": payload.physical_quantity, "area": field},
    )
    session.commit()
    session.refresh(count)
    return count


def create_member(session: Session, payload: MemberCreate, actor: Cashier) -> Member:
    if session.scalar(select(Member).where(Member.phone == payload.phone)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Nomor member sudah terdaftar")
    member = Member(**payload.model_dump(), is_active=True)
    session.add(member)
    session.flush()
    write_audit(session, actor, "member.create", "member", member.id, {"phone": member.phone})
    session.commit()
    session.refresh(member)
    return member


def update_member(
    session: Session, member: Member, payload: MemberUpdate, actor: Cashier
) -> Member:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(member, field, value)
    write_audit(
        session, actor, "member.update", "member", member.id, payload.model_dump(exclude_unset=True)
    )
    session.commit()
    session.refresh(member)
    return member


def create_finance_entry(
    session: Session, payload: FinanceEntryCreate, actor: Cashier
) -> FinanceEntry:
    entry = FinanceEntry(
        entry_type=payload.entry_type.value,
        reference_no=f"FIN-{datetime.now(UTC):%Y%m%d}-{token_hex(3).upper()}",
        counterparty=(payload.counterparty or "").strip() or None,
        amount=payload.amount,
        status=payload.status,
        due_date=payload.due_date,
        payment_method=payload.payment_method.value if payload.payment_method else None,
        note=(payload.note or "").strip() or None,
        created_by_id=actor.id,
    )
    session.add(entry)
    session.flush()
    write_audit(
        session,
        actor,
        "finance.create",
        "finance_entry",
        entry.id,
        {"type": entry.entry_type, "amount": entry.amount},
    )
    session.commit()
    session.refresh(entry)
    return entry


def create_purchase_order(
    session: Session, payload: PurchaseOrderDraftCreate, actor: Cashier
) -> PurchaseOrder:
    supplier = session.get(Supplier, payload.supplier_id)
    if supplier is None or not supplier.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier tidak ditemukan")
    store = store_by_code(session, payload.store_code)
    items: list[PurchaseOrderItem] = []
    subtotal = 0
    seen: set[str] = set()
    for requested in payload.items:
        if requested.barcode in seen:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT, "Produk PO tidak boleh duplikat"
            )
        seen.add(requested.barcode)
        product = session.scalar(select(Product).where(Product.barcode == requested.barcode))
        if product is None:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, f"Produk {requested.barcode} tidak ditemukan"
            )
        unit_cost = product.cost_price if requested.unit_cost is None else requested.unit_cost
        line_total = unit_cost * requested.quantity
        subtotal += line_total
        items.append(
            PurchaseOrderItem(
                product_id=product.id,
                barcode=product.barcode,
                product_name=product.name,
                quantity_ordered=requested.quantity,
                quantity_received=0,
                unit_cost=unit_cost,
                subtotal=line_total,
            )
        )
    order = PurchaseOrder(
        po_number=f"PO-{datetime.now(UTC):%Y%m%d}-{token_hex(3).upper()}",
        supplier_id=supplier.id,
        store_id=store.id,
        created_by_id=actor.id,
        status="ordered",
        expected_date=payload.expected_date,
        subtotal=subtotal,
        notes=(payload.notes or "").strip() or None,
        ordered_at=now_utc(),
        items=items,
    )
    session.add(order)
    session.flush()
    write_audit(session, actor, "purchase.order", "purchase_order", order.id, {"total": subtotal})
    session.commit()
    session.refresh(order)
    return order


def receive_purchase_order(
    session: Session, order: PurchaseOrder, payload: PurchaseReceiveCreate, actor: Cashier
) -> PurchaseOrder:
    if order.status not in {"ordered", "partially_received"}:
        raise HTTPException(status.HTTP_409_CONFLICT, "PO tidak dapat diterima pada status ini")
    by_id = {item.id: item for item in order.items}
    for received in payload.items:
        item = by_id.get(received.item_id)
        if item is None:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Item PO tidak ditemukan")
        remaining = item.quantity_ordered - item.quantity_received
        if received.quantity_received > remaining:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT, "Jumlah terima melebihi sisa PO"
            )
        product = session.get(Product, item.product_id)
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk PO tidak ditemukan")
        old_total = product.stock + product.warehouse_stock
        old_value = old_total * product.cost_price
        product.warehouse_stock += received.quantity_received
        new_total = old_total + received.quantity_received
        product.cost_price = (old_value + received.quantity_received * item.unit_cost) // new_total
        item.quantity_received += received.quantity_received
        session.add(
            StockMovement(
                product_id=product.id,
                store_id=order.store_id,
                movement_type="purchase",
                stock_area="warehouse",
                quantity_change=received.quantity_received,
                balance_after=product.warehouse_stock,
                unit_cost=item.unit_cost,
                reference_type="purchase_order",
                reference_id=order.id,
                created_by_id=actor.id,
                note=f"Penerimaan {order.po_number}",
            )
        )
        if received.expiry_date and received.batch_no:
            session.add(
                ProductBatch(
                    product_id=product.id,
                    store_id=order.store_id,
                    batch_no=received.batch_no.strip().upper(),
                    expiry_date=received.expiry_date,
                    quantity=received.quantity_received,
                )
            )
    order.status = (
        "received"
        if all(item.quantity_received == item.quantity_ordered for item in order.items)
        else "partially_received"
    )
    if order.status == "received":
        order.received_at = now_utc()
        payable_reference = f"PAY-{order.po_number}"
        if (
            session.scalar(
                select(FinanceEntry).where(FinanceEntry.reference_no == payable_reference)
            )
            is None
        ):
            session.add(
                FinanceEntry(
                    entry_type="payable",
                    reference_no=payable_reference,
                    counterparty=order.supplier.name,
                    amount=order.subtotal,
                    status="open",
                    due_date=(datetime.now(UTC) + timedelta(days=30)).date(),
                    note=f"Hutang penerimaan {order.po_number}",
                    created_by_id=actor.id,
                )
            )
    write_audit(
        session, actor, "purchase.receive", "purchase_order", order.id, {"status": order.status}
    )
    session.commit()
    session.refresh(order)
    return order


def return_purchase(
    session: Session, payload: PurchaseReturnCreate, actor: Cashier
) -> FinanceEntry:
    product = session.get(Product, payload.product_id)
    supplier = session.get(Supplier, payload.supplier_id)
    store = store_by_code(session, payload.store_code)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    if supplier is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier tidak ditemukan")
    if product.warehouse_stock < payload.quantity:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Stok gudang tidak cukup. Tersedia {product.warehouse_stock}",
        )
    product.warehouse_stock -= payload.quantity
    amount = product.cost_price * payload.quantity
    entry = FinanceEntry(
        entry_type="purchase_return",
        reference_no=f"RPO-{datetime.now(UTC):%Y%m%d}-{token_hex(3).upper()}",
        counterparty=supplier.name,
        amount=amount,
        status="settled",
        note=payload.note.strip(),
        created_by_id=actor.id,
    )
    session.add(entry)
    session.flush()
    session.add(
        StockMovement(
            product_id=product.id,
            store_id=store.id,
            movement_type="return",
            stock_area="warehouse",
            quantity_change=-payload.quantity,
            balance_after=product.warehouse_stock,
            unit_cost=product.cost_price,
            reference_type="purchase_return",
            reference_id=entry.id,
            created_by_id=actor.id,
            note=payload.note.strip(),
        )
    )
    write_audit(
        session,
        actor,
        "purchase.return",
        "product",
        product.id,
        {"quantity": payload.quantity, "supplier": supplier.name},
    )
    session.commit()
    session.refresh(entry)
    return entry


def _login_read(
    cashier: Cashier,
    *,
    login_status: LoginStatus,
    access_token: str | None = None,
    challenge_token: str | None = None,
    provisioning_uri: str | None = None,
    totp_secret: str | None = None,
    expires_at: datetime | None = None,
) -> LoginRead:
    profile = access_profile(cashier)
    return LoginRead(
        status=login_status,
        access_token=access_token,
        challenge_token=challenge_token,
        provisioning_uri=provisioning_uri,
        totp_secret=totp_secret,
        expires_at=expires_at.replace(tzinfo=UTC) if expires_at else None,
        employee_code=cashier.employee_code,
        full_name=cashier.full_name,
        role_name=profile.role_name,
        permissions=profile.permissions,
    )


def _complete_login(session: Session, cashier: Cashier, audit_action: str) -> LoginRead:
    raw_token = token_urlsafe(40)
    expires_at = now_utc() + timedelta(hours=12)
    session.add(
        AuthSession(
            token_hash=token_hash(raw_token),
            cashier_id=cashier.id,
            expires_at=expires_at,
        )
    )
    write_audit(session, cashier, audit_action, "cashier", cashier.id)
    return _login_read(
        cashier,
        login_status=LoginStatus.authenticated,
        access_token=raw_token,
        expires_at=expires_at,
    )


def _create_totp_challenge(
    session: Session, cashier: Cashier, purpose: str
) -> tuple[str, datetime]:
    created_at = now_utc()
    for existing in session.scalars(
        select(TotpChallenge).where(
            TotpChallenge.cashier_id == cashier.id,
            TotpChallenge.used_at.is_(None),
        )
    ):
        existing.used_at = created_at
    raw_token = token_urlsafe(40)
    expires_at = created_at + timedelta(minutes=10)
    session.add(
        TotpChallenge(
            token_hash=token_hash(raw_token),
            cashier_id=cashier.id,
            purpose=purpose,
            expires_at=expires_at,
        )
    )
    return raw_token, expires_at


def authenticate(session: Session, identity: str, password: str) -> LoginRead:
    normalized = identity.strip()
    cashier = session.scalar(
        select(Cashier).where(
            or_(Cashier.employee_code == normalized.upper(), Cashier.email == normalized.lower()),
            Cashier.is_active.is_(True),
        )
    )
    if cashier is None or not verify_secret(password, cashier.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Kode/email atau password salah")

    is_cashier = (
        cashier.access_role is not None and cashier.access_role.code == "CASHIER"
    ) or (cashier.access_role is None and cashier.role.lower() == "cashier")
    if is_cashier or not cashier.totp_required:
        result = _complete_login(session, cashier, "auth.login")
        session.commit()
        return result

    if not cashier.totp_secret:
        cashier.totp_secret = generate_totp_secret()
    purpose = "login" if cashier.totp_enabled else "setup"
    challenge_token, expires_at = _create_totp_challenge(session, cashier, purpose)
    write_audit(
        session,
        cashier,
        "auth.totp_challenge",
        "cashier",
        cashier.id,
        {"purpose": purpose},
    )
    session.commit()
    return _login_read(
        cashier,
        login_status=(
            LoginStatus.totp_required
            if purpose == "login"
            else LoginStatus.totp_setup_required
        ),
        challenge_token=challenge_token,
        provisioning_uri=(
            totp_provisioning_uri(cashier.totp_secret, cashier.email or cashier.employee_code)
            if purpose == "setup"
            else None
        ),
        totp_secret=cashier.totp_secret if purpose == "setup" else None,
        expires_at=expires_at,
    )


def verify_totp_challenge(
    session: Session,
    raw_challenge_token: str,
    code: str,
    *,
    expected_purpose: str,
) -> LoginRead:
    challenge = session.scalar(
        select(TotpChallenge).where(
            TotpChallenge.token_hash == token_hash(raw_challenge_token),
            TotpChallenge.purpose == expected_purpose,
            TotpChallenge.used_at.is_(None),
            TotpChallenge.expires_at > now_utc(),
        )
    )
    if challenge is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Sesi Authenticator tidak valid atau kedaluwarsa",
        )
    cashier = session.get(Cashier, challenge.cashier_id)
    if cashier is None or not cashier.is_active or not cashier.totp_secret:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Akun tidak tersedia")
    if expected_purpose == "login" and not cashier.totp_enabled:
        raise HTTPException(status.HTTP_409_CONFLICT, "Authenticator belum diaktifkan")

    counter = verify_totp_code(cashier.totp_secret, code, cashier.totp_last_counter)
    if counter is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Kode Authenticator salah")

    verified_at = now_utc()
    challenge.used_at = verified_at
    cashier.totp_last_counter = counter
    if expected_purpose == "setup":
        cashier.totp_enabled = True
        cashier.totp_enrolled_at = verified_at
    result = _complete_login(
        session,
        cashier,
        "auth.totp_enrolled" if expected_purpose == "setup" else "auth.login_totp",
    )
    session.commit()
    return result


def actor_from_token(session: Session, raw_token: str) -> Cashier | None:
    auth_session = session.scalar(
        select(AuthSession).where(
            AuthSession.token_hash == token_hash(raw_token),
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now_utc(),
        )
    )
    if auth_session is None:
        return None
    cashier = session.get(Cashier, auth_session.cashier_id)
    return cashier if cashier and cashier.is_active else None


def request_password_reset(session: Session, email: str) -> str | None:
    cashier = session.scalar(select(Cashier).where(Cashier.email == email.strip().lower()))
    if cashier is None:
        return None
    raw_token = token_urlsafe(32)
    session.add(
        PasswordResetToken(
            token_hash=token_hash(raw_token),
            cashier_id=cashier.id,
            expires_at=now_utc() + timedelta(minutes=30),
        )
    )
    session.commit()
    return raw_token


def reset_password(session: Session, raw_token: str, new_password: str) -> None:
    reset = session.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash(raw_token),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now_utc(),
        )
    )
    if reset is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "Token reset tidak valid atau kedaluwarsa"
        )
    cashier = session.get(Cashier, reset.cashier_id)
    if cashier is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pengguna tidak ditemukan")
    cashier.password_hash = hash_secret(new_password)
    reset.used_at = now_utc()
    write_audit(session, cashier, "auth.password_reset", "cashier", cashier.id)
    session.commit()
