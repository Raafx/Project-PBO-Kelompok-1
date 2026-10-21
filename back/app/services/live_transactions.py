from __future__ import annotations

import json
from collections import defaultdict
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Cashier, LiveTransaction, Member, Product, Store
from app.schemas import (
    LiveCartItemRead,
    LiveTransactionHeartbeat,
    LiveTransactionRead,
    LiveWorkflowSnapshot,
)
from app.services.access import ensure_permission

ONLINE_SECONDS = 15
RECENT_HOURS = 2
TERMINAL_MINUTES = 15
TERMINAL_STATUSES = {"completed", "held", "cancelled"}


def utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _context(
    session: Session, payload: LiveTransactionHeartbeat
) -> tuple[Store, Cashier, Member | None]:
    store = session.scalar(select(Store).where(Store.code == payload.store_code))
    if store is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Toko tidak ditemukan")
    cashier = session.scalar(
        select(Cashier).where(
            Cashier.employee_code == payload.cashier_code,
            Cashier.is_active.is_(True),
        )
    )
    if cashier is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Kasir tidak aktif atau tidak ditemukan",
        )
    ensure_permission(cashier, "pos.access")

    member = None
    if payload.member_phone:
        phone = "".join(character for character in payload.member_phone if character.isdigit())
        member = session.scalar(
            select(Member).where(Member.phone == phone, Member.is_active.is_(True))
        )
    return store, cashier, member


def _cart_snapshot(
    session: Session, payload: LiveTransactionHeartbeat
) -> tuple[list[dict[str, object]], int, int]:
    quantities: dict[str, int] = defaultdict(int)
    for item in payload.items:
        quantities[item.barcode] += item.quantity
    if not quantities:
        return [], 0, 0

    products = session.scalars(
        select(Product).where(
            Product.barcode.in_(quantities),
            Product.is_active.is_(True),
        )
    ).all()
    by_barcode = {product.barcode: product for product in products}
    missing = sorted(set(quantities) - set(by_barcode))
    if missing:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Barcode tidak ditemukan: {', '.join(missing)}",
        )

    items: list[dict[str, object]] = []
    total = 0
    item_count = 0
    for barcode, quantity in quantities.items():
        product = by_barcode[barcode]
        line_total = product.price * quantity
        total += line_total
        item_count += quantity
        items.append(
            {
                "barcode": product.barcode,
                "name": product.name,
                "quantity": quantity,
                "unit_price": product.price,
                "subtotal": line_total,
                "image_url": product.image_url,
            }
        )
    return items, total, item_count


def _progress(status_value: str, has_member: bool, payment_ready: bool) -> int:
    if status_value == "ready":
        return 0
    if status_value == "shopping":
        return 45 if has_member else 35
    if status_value == "payment":
        return 85 if payment_ready else 70
    if status_value == "processing":
        return 95
    return 100


def record_heartbeat(session: Session, payload: LiveTransactionHeartbeat) -> LiveTransactionRead:
    store, cashier, member = _context(session, payload)
    items, total, item_count = _cart_snapshot(session, payload)
    now = utc_now()
    live = session.get(LiveTransaction, payload.session_id)
    if live is None:
        live = LiveTransaction(
            id=payload.session_id,
            store_id=store.id,
            cashier_id=cashier.id,
            last_seen_at=now,
        )
        session.add(live)
    elif live.store_id != store.id or live.cashier_id != cashier.id:
        raise HTTPException(status.HTTP_409_CONFLICT, "Session kasir sudah dipakai")

    status_value = payload.status.value
    live.status = status_value
    live.progress = _progress(status_value, member is not None, payload.payment_ready)
    live.item_count = item_count
    live.unique_products = len(items)
    live.subtotal = total
    live.total = total
    live.payment_method = payload.payment_method.value if payload.payment_method else None
    live.payment_ready = payload.payment_ready
    live.member_name = member.full_name if member else None
    live.items_json = json.dumps(items, ensure_ascii=False, separators=(",", ":"))
    live.current_action = payload.current_action
    live.transaction_no = payload.transaction_no
    live.last_seen_at = now
    if status_value != "ready" and live.started_at is None:
        live.started_at = now
    if status_value in TERMINAL_STATUSES:
        live.completed_at = now
    session.commit()
    session.refresh(live)
    return _read_live(live, store, cashier, now)


def _read_live(
    live: LiveTransaction, store: Store, cashier: Cashier, now: datetime
) -> LiveTransactionRead:
    try:
        raw_items = json.loads(live.items_json)
        items = [LiveCartItemRead.model_validate(item) for item in raw_items]
    except (json.JSONDecodeError, TypeError, ValueError):
        items = []
    last_seen = live.last_seen_at.replace(tzinfo=None)
    online = (now - last_seen).total_seconds() <= ONLINE_SECONDS
    return LiveTransactionRead(
        id=live.id,
        store_code=store.code,
        store_name=store.name,
        cashier_code=cashier.employee_code,
        cashier_name=cashier.full_name,
        status=live.status,
        progress=live.progress,
        item_count=live.item_count,
        unique_products=live.unique_products,
        subtotal=live.subtotal,
        total=live.total,
        payment_method=live.payment_method,
        payment_ready=live.payment_ready,
        member_name=live.member_name,
        current_action=live.current_action,
        transaction_no=live.transaction_no,
        started_at=live.started_at.replace(tzinfo=UTC) if live.started_at else None,
        completed_at=live.completed_at.replace(tzinfo=UTC) if live.completed_at else None,
        last_seen_at=live.last_seen_at.replace(tzinfo=UTC),
        online=online,
        service_ready=online and live.status == "ready",
        items=items,
    )


def workflow_snapshot(session: Session) -> LiveWorkflowSnapshot:
    now = utc_now()
    rows = session.execute(
        select(LiveTransaction, Store, Cashier)
        .join(Store, Store.id == LiveTransaction.store_id)
        .join(Cashier, Cashier.id == LiveTransaction.cashier_id)
        .where(LiveTransaction.last_seen_at >= now - timedelta(hours=RECENT_HOURS))
        .order_by(LiveTransaction.last_seen_at.desc())
        .limit(100)
    ).all()
    terminal_cutoff = now - timedelta(minutes=TERMINAL_MINUTES)
    sessions = [
        _read_live(row.LiveTransaction, row.Store, row.Cashier, now)
        for row in rows
        if row.LiveTransaction.status not in TERMINAL_STATUSES
        or row.LiveTransaction.last_seen_at >= terminal_cutoff
    ]
    return LiveWorkflowSnapshot(generated_at=now.replace(tzinfo=UTC), sessions=sessions)
