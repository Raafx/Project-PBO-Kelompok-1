"""Adapter database untuk kebutuhan kecil aturan pembayaran voucher."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Voucher
from app.services.payment_rules import VoucherTerms


class SqlAlchemyVoucherFinder:
    def __init__(self, session: Session) -> None:
        self.session = session

    def find_active(self, code: str) -> VoucherTerms | None:
        voucher = self.session.scalar(
            select(Voucher).where(Voucher.code == code, Voucher.is_active.is_(True))
        )
        if voucher is None:
            return None
        return VoucherTerms(voucher.starts_at, voucher.ends_at, voucher.min_purchase)
