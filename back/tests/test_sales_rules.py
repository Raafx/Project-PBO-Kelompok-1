from __future__ import annotations

from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest
from sqlalchemy.orm import Session

from app.models import Product
from app.schemas import PaymentCreate, ProductCreate
from app.services.payment_rules import (
    PaymentFields,
    PaymentRejected,
    VoucherTerms,
    payment_rules,
    validate_payment,
)
from app.services.pricing import best_discount
from app.services.products import create_product


class FakeVoucherFinder:
    def __init__(self, terms: VoucherTerms | None = None) -> None:
        self.terms = terms

    def find_active(self, _code: str) -> VoucherTerms | None:
        return self.terms


@pytest.mark.parametrize(
    ("kind", "value", "expected"),
    [
        ("percent", 10, 3_000),
        ("fixed", 2_000, 6_000),
        ("wholesale", 8_000, 6_000),
        ("buy_x_get_y", 0, 10_000),
    ],
)
def test_existing_discount_rules(kind: str, value: int, expected: int) -> None:
    promotion = SimpleNamespace(
        product_id=None,
        promotion_type=kind,
        min_quantity=1,
        value=value,
        buy_quantity=2,
        free_quantity=1,
    )
    assert best_discount([promotion], "product-1", 10_000, 3) == expected


def test_discount_rule_can_be_extended_without_changing_checkout() -> None:
    promotion = SimpleNamespace(
        product_id=None,
        promotion_type="new_rule",
        min_quantity=1,
        value=0,
    )
    rules = {"new_rule": lambda _promotion, _price, quantity: quantity * 500}
    assert best_discount([promotion], "product-1", 10_000, 3, rules) == 1_500


def test_payment_rule_can_be_substituted() -> None:
    fields = validate_payment(
        PaymentCreate(method="cash"),
        12_000,
        {"cash": lambda _payment, total: PaymentFields(received_amount=total + 1_000)},
    )
    assert fields.received_amount == 13_000


def test_voucher_rule_uses_only_voucher_lookup() -> None:
    now = datetime.now(UTC).replace(tzinfo=None)
    finder = FakeVoucherFinder(VoucherTerms(now - timedelta(days=1), None, 10_000))
    payment = PaymentCreate(method="voucher", voucher_code=" hemat ")
    assert validate_payment(payment, 10_000, payment_rules(finder)).voucher_code == "HEMAT"
    with pytest.raises(PaymentRejected, match="Voucher tidak valid"):
        validate_payment(payment, 9_999, payment_rules(finder))


def test_product_write_can_roll_back_with_audit(session: Session) -> None:
    product = create_product(
        session,
        ProductCreate(
            barcode="SOLID-ROLLBACK-001",
            name="Produk Uji",
            category="Uji",
            location="Gudang",
            price=10_000,
            cost_price=7_000,
        ),
    )
    product_id = product.id
    session.rollback()
    assert session.get(Product, product_id) is None
