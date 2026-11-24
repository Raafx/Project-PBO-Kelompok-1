"""Validasi metode pembayaran tanpa ketergantungan pada database atau HTTP."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Protocol

from app.schemas import PaymentCreate


class PaymentRejected(ValueError):
    """Data pembayaran tidak memenuhi aturan metode yang dipilih."""


@dataclass(frozen=True)
class VoucherTerms:
    starts_at: datetime | None
    ends_at: datetime | None
    min_purchase: int


class VoucherFinder(Protocol):
    def find_active(self, code: str) -> VoucherTerms | None: ...


@dataclass(frozen=True)
class PaymentFields:
    received_amount: int | None = None
    change_amount: int | None = None
    approval_code: str | None = None
    card_type: str | None = None
    card_last4: str | None = None
    voucher_code: str | None = None


class PaymentRule(Protocol):
    def __call__(self, payment: PaymentCreate, total: int) -> PaymentFields: ...


def cash(payment: PaymentCreate, total: int) -> PaymentFields:
    received = total if payment.received_amount is None else payment.received_amount
    if received < total:
        raise PaymentRejected("Uang diterima kurang")
    return PaymentFields(received_amount=received, change_amount=received - total)


def qris(payment: PaymentCreate, _total: int) -> PaymentFields:
    approval = (payment.approval_code or "").strip()
    if not payment.confirmed:
        raise PaymentRejected("Pembayaran QRIS belum dikonfirmasi")
    if len(approval) < 4:
        raise PaymentRejected("Nomor approval QRIS wajib diisi")
    return PaymentFields(approval_code=approval)


def edc(payment: PaymentCreate, _total: int) -> PaymentFields:
    approval = (payment.approval_code or "").strip()
    card_digits = "".join(char for char in (payment.card_number or "") if char.isdigit())
    if payment.card_type not in {"debit", "credit"}:
        raise PaymentRejected("Pilih jenis kartu Debit atau Kredit")
    if not 12 <= len(card_digits) <= 19:
        raise PaymentRejected("Nomor kartu EDC harus 12 sampai 19 digit")
    if len(approval) < 4:
        raise PaymentRejected("Nomor approval EDC wajib diisi")
    if not payment.confirmed:
        raise PaymentRejected("Pembayaran EDC belum dikonfirmasi")
    return PaymentFields(
        approval_code=approval,
        card_type=payment.card_type,
        card_last4=card_digits[-4:],
    )


def non_cash(payment: PaymentCreate, _total: int) -> PaymentFields:
    if not payment.confirmed:
        raise PaymentRejected("Pembayaran non-tunai belum dikonfirmasi")
    return PaymentFields()


class VoucherRule:
    def __init__(self, finder: VoucherFinder) -> None:
        self.finder = finder

    def __call__(self, payment: PaymentCreate, total: int) -> PaymentFields:
        code = (payment.voucher_code or "").strip().upper()
        voucher = self.finder.find_active(code)
        now = datetime.now(UTC).replace(tzinfo=None)
        if (
            voucher is None
            or (voucher.starts_at is not None and voucher.starts_at > now)
            or (voucher.ends_at is not None and voucher.ends_at < now)
            or total < voucher.min_purchase
        ):
            raise PaymentRejected("Voucher tidak valid")
        return PaymentFields(voucher_code=code)


PAYMENT_RULES: Mapping[str, PaymentRule] = {
    "cash": cash,
    "qris": qris,
    "edc": edc,
    "debit": non_cash,
    "credit": non_cash,
    "wallet": non_cash,
}


def payment_rules(voucher_finder: VoucherFinder) -> Mapping[str, PaymentRule]:
    return {**PAYMENT_RULES, "voucher": VoucherRule(voucher_finder)}


def validate_payment(
    payment: PaymentCreate, total: int, rules: Mapping[str, PaymentRule]
) -> PaymentFields:
    rule = rules.get(payment.method.value)
    if rule is None:
        raise PaymentRejected("Metode pembayaran tidak didukung")
    fields = rule(payment, total)
    # Pertahankan metadata yang dikirim pada metode pembayaran lainnya.
    return PaymentFields(
        received_amount=fields.received_amount,
        change_amount=fields.change_amount,
        approval_code=fields.approval_code or (payment.approval_code or "").strip() or None,
        card_type=fields.card_type,
        card_last4=fields.card_last4,
        voucher_code=fields.voucher_code or (payment.voucher_code or "").strip().upper() or None,
    )
