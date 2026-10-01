"""Initial MYMARKET POS schema.

Revision ID: 20260930_0001
Revises:
Create Date: 2026-09-30
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260930_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLE_OPTIONS = {
    "mysql_engine": "InnoDB",
    "mysql_charset": "utf8mb4",
    "mysql_collate": "utf8mb4_unicode_ci",
}


def timestamps() -> list[sa.Column]:
    return [
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False
        ),
    ]


def upgrade() -> None:
    op.create_table(
        "stores",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("code", sa.String(20), nullable=False, unique=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("timezone", sa.String(64), nullable=False),
        *timestamps(),
        **TABLE_OPTIONS,
    )
    op.create_table(
        "cashiers",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("employee_code", sa.String(30), nullable=False, unique=True),
        sa.Column("full_name", sa.String(120), nullable=False),
        sa.Column("role", sa.String(30), nullable=False),
        sa.Column("pin_hash", sa.String(255)),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        *timestamps(),
        **TABLE_OPTIONS,
    )
    op.create_table(
        "products",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("barcode", sa.String(40), nullable=False, unique=True),
        sa.Column("sku", sa.String(40), unique=True),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("location", sa.String(80), nullable=False),
        sa.Column("price", sa.BigInteger(), nullable=False),
        sa.Column("stock", sa.Integer()),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        *timestamps(),
        sa.CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
        sa.CheckConstraint("stock IS NULL OR stock >= 0", name="ck_products_stock_non_negative"),
        **TABLE_OPTIONS,
    )
    op.create_index("ix_products_name", "products", ["name"])
    op.create_table(
        "members",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("phone", sa.String(24), nullable=False, unique=True),
        sa.Column("full_name", sa.String(120), nullable=False),
        sa.Column("tier", sa.String(30), nullable=False),
        sa.Column("points", sa.BigInteger(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        *timestamps(),
        sa.CheckConstraint("points >= 0", name="ck_members_points_non_negative"),
        **TABLE_OPTIONS,
    )
    op.create_table(
        "vouchers",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("code", sa.String(40), nullable=False, unique=True),
        sa.Column("description", sa.String(180), nullable=False),
        sa.Column("value", sa.BigInteger(), nullable=False),
        sa.Column("min_purchase", sa.BigInteger(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("starts_at", sa.DateTime()),
        sa.Column("ends_at", sa.DateTime()),
        *timestamps(),
        sa.CheckConstraint("value >= 0", name="ck_vouchers_value_non_negative"),
        sa.CheckConstraint("min_purchase >= 0", name="ck_vouchers_min_purchase"),
        **TABLE_OPTIONS,
    )
    op.create_table(
        "shifts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("store_id", sa.String(36), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("cashier_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column(
            "opened_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False
        ),
        sa.Column("closed_at", sa.DateTime()),
        sa.Column("opening_cash", sa.BigInteger(), nullable=False),
        sa.Column("closing_cash", sa.BigInteger()),
        sa.Column("status", sa.String(12), nullable=False),
        *timestamps(),
        sa.CheckConstraint("status IN ('open', 'closed')", name="ck_shifts_status"),
        sa.CheckConstraint("opening_cash >= 0", name="ck_shifts_opening_cash"),
        **TABLE_OPTIONS,
    )
    op.create_index("ix_shifts_store_id", "shifts", ["store_id"])
    op.create_index("ix_shifts_cashier_id", "shifts", ["cashier_id"])
    op.create_table(
        "sales",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("transaction_no", sa.String(40), nullable=False, unique=True),
        sa.Column("idempotency_key", sa.String(128), unique=True),
        sa.Column("store_id", sa.String(36), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("cashier_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column("shift_id", sa.String(36), sa.ForeignKey("shifts.id")),
        sa.Column("member_id", sa.String(36), sa.ForeignKey("members.id")),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("subtotal", sa.BigInteger(), nullable=False),
        sa.Column("discount", sa.BigInteger(), nullable=False),
        sa.Column("tax", sa.BigInteger(), nullable=False),
        sa.Column("rounding", sa.BigInteger(), nullable=False),
        sa.Column("total", sa.BigInteger(), nullable=False),
        sa.Column("item_count", sa.Integer(), nullable=False),
        sa.Column("notes", sa.Text()),
        *timestamps(),
        sa.CheckConstraint("status IN ('completed', 'held', 'cancelled')", name="ck_sales_status"),
        sa.CheckConstraint("subtotal >= 0 AND total >= 0", name="ck_sales_totals_non_negative"),
        sa.CheckConstraint("item_count >= 0", name="ck_sales_item_count_non_negative"),
        **TABLE_OPTIONS,
    )
    for column in ("store_id", "cashier_id", "shift_id", "member_id", "created_at"):
        op.create_index(f"ix_sales_{column}", "sales", [column])
    op.create_index("ix_sales_status_created", "sales", ["status", "created_at"])
    op.create_table(
        "sale_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "sale_id", sa.String(36), sa.ForeignKey("sales.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("barcode", sa.String(40), nullable=False),
        sa.Column("product_name", sa.String(180), nullable=False),
        sa.Column("unit_price", sa.BigInteger(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("discount", sa.BigInteger(), nullable=False),
        sa.Column("subtotal", sa.BigInteger(), nullable=False),
        sa.CheckConstraint("quantity > 0", name="ck_sale_items_quantity_positive"),
        sa.CheckConstraint("unit_price >= 0 AND subtotal >= 0", name="ck_sale_items_amounts"),
        sa.UniqueConstraint("sale_id", "product_id", name="uq_sale_items_sale_product"),
        **TABLE_OPTIONS,
    )
    op.create_index("ix_sale_items_sale_id", "sale_items", ["sale_id"])
    op.create_index("ix_sale_items_product_id", "sale_items", ["product_id"])
    op.create_table(
        "payments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "sale_id",
            sa.String(36),
            sa.ForeignKey("sales.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("method", sa.String(16), nullable=False),
        sa.Column("amount", sa.BigInteger(), nullable=False),
        sa.Column("received_amount", sa.BigInteger()),
        sa.Column("change_amount", sa.BigInteger()),
        sa.Column("approval_code", sa.String(80)),
        sa.Column("voucher_code", sa.String(40)),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column(
            "paid_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False
        ),
        sa.CheckConstraint(
            "method IN ('cash', 'qris', 'debit', 'credit', 'wallet', 'voucher')",
            name="ck_payments_method",
        ),
        sa.CheckConstraint("status IN ('paid', 'pending', 'failed')", name="ck_payments_status"),
        sa.CheckConstraint("amount >= 0", name="ck_payments_amount_non_negative"),
        sa.CheckConstraint(
            "received_amount IS NULL OR received_amount >= 0",
            name="ck_payments_received_non_negative",
        ),
        sa.CheckConstraint(
            "change_amount IS NULL OR change_amount >= 0", name="ck_payments_change_non_negative"
        ),
        **TABLE_OPTIONS,
    )


def downgrade() -> None:
    op.drop_table("payments")
    op.drop_index("ix_sale_items_product_id", table_name="sale_items")
    op.drop_index("ix_sale_items_sale_id", table_name="sale_items")
    op.drop_table("sale_items")
    op.drop_index("ix_sales_status_created", table_name="sales")
    for column in ("created_at", "member_id", "shift_id", "cashier_id", "store_id"):
        op.drop_index(f"ix_sales_{column}", table_name="sales")
    op.drop_table("sales")
    op.drop_index("ix_shifts_cashier_id", table_name="shifts")
    op.drop_index("ix_shifts_store_id", table_name="shifts")
    op.drop_table("shifts")
    op.drop_table("vouchers")
    op.drop_table("members")
    op.drop_index("ix_products_name", table_name="products")
    op.drop_table("products")
    op.drop_table("cashiers")
    op.drop_table("stores")
