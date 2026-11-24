"""Aturan diskon untuk satu baris penjualan.

Setiap jenis promosi cukup menyediakan fungsi dengan kontrak DiscountRule.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Protocol


class PromotionLike(Protocol):
    product_id: str | None
    promotion_type: str
    min_quantity: int
    value: int
    buy_quantity: int | None
    free_quantity: int | None


class DiscountRule(Protocol):
    def __call__(self, promotion: PromotionLike, unit_price: int, quantity: int) -> int: ...


def percent(promotion: PromotionLike, unit_price: int, quantity: int) -> int:
    return unit_price * quantity * promotion.value // 100


def fixed(promotion: PromotionLike, unit_price: int, quantity: int) -> int:
    return min(unit_price * quantity, promotion.value * quantity)


def wholesale(promotion: PromotionLike, unit_price: int, quantity: int) -> int:
    return max(0, unit_price - promotion.value) * quantity


def buy_x_get_y(promotion: PromotionLike, unit_price: int, quantity: int) -> int:
    if not promotion.buy_quantity or not promotion.free_quantity:
        return 0
    group_size = promotion.buy_quantity + promotion.free_quantity
    return quantity // group_size * promotion.free_quantity * unit_price


DISCOUNT_RULES: Mapping[str, DiscountRule] = {
    "percent": percent,
    "fixed": fixed,
    "wholesale": wholesale,
    "buy_x_get_y": buy_x_get_y,
}


def best_discount(
    promotions: Iterable[PromotionLike],
    product_id: str,
    unit_price: int,
    quantity: int,
    rules: Mapping[str, DiscountRule] = DISCOUNT_RULES,
) -> int:
    line_total = unit_price * quantity
    discounts = [0]
    for promotion in promotions:
        if promotion.product_id not in {None, product_id} or quantity < promotion.min_quantity:
            continue
        rule = rules.get(promotion.promotion_type)
        if rule is not None:
            discounts.append(rule(promotion, unit_price, quantity))
    return min(line_total, max(discounts))
