"""Add complete retail business operations.

Revision ID: 20261008_0009
Revises: 20261008_0008
Create Date: 2026-10-08
"""

from collections.abc import Sequence
from uuid import NAMESPACE_URL, uuid5

import sqlalchemy as sa

from alembic import op

revision: str = "20261008_0009"
down_revision: str | None = "20261008_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("stores", sa.Column("address", sa.Text()))
    op.add_column("stores", sa.Column("logo_url", sa.String(255)))
    op.add_column("stores", sa.Column("tax_id", sa.String(40)))
    op.add_column("cashiers", sa.Column("email", sa.String(160)))
    op.add_column("cashiers", sa.Column("password_hash", sa.String(255)))
    op.create_unique_constraint("uq_cashiers_email", "cashiers", ["email"])
    op.add_column("products", sa.Column("brand", sa.String(80)))
    op.add_column(
        "products", sa.Column("unit", sa.String(30), nullable=False, server_default="pcs")
    )
    op.add_column(
        "products",
        sa.Column("unit_conversion", sa.Integer(), nullable=False, server_default="1"),
    )

    op.create_table(
        "cash_movements",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("shift_id", sa.String(36), sa.ForeignKey("shifts.id"), nullable=False),
        sa.Column("movement_type", sa.String(16), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("amount", sa.BigInteger(), nullable=False),
        sa.Column("note", sa.String(255)),
        sa.Column("created_by_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "movement_type IN ('cash_in', 'cash_out')", name="ck_cash_movements_type"
        ),
        sa.CheckConstraint("amount > 0", name="ck_cash_movements_amount"),
    )
    op.create_index("ix_cash_movements_shift_id", "cash_movements", ["shift_id"])
    op.create_index("ix_cash_movements_shift_created", "cash_movements", ["shift_id", "created_at"])

    op.create_table(
        "catalog_options",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("kind", sa.String(16), nullable=False),
        sa.Column("code", sa.String(40), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("conversion_factor", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("kind IN ('category', 'unit', 'brand')", name="ck_catalog_options_kind"),
        sa.UniqueConstraint("kind", "code", name="uq_catalog_options_kind_code"),
    )
    op.create_index("ix_catalog_options_kind", "catalog_options", ["kind"])

    op.create_table(
        "promotions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("code", sa.String(40), nullable=False, unique=True),
        sa.Column("name", sa.String(140), nullable=False),
        sa.Column("promotion_type", sa.String(20), nullable=False),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id")),
        sa.Column("value", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("min_quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("buy_quantity", sa.Integer()),
        sa.Column("free_quantity", sa.Integer()),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "promotion_type IN ('percent', 'fixed', 'buy_x_get_y', 'wholesale')",
            name="ck_promotions_type",
        ),
        sa.CheckConstraint("value >= 0 AND min_quantity > 0", name="ck_promotions_values"),
    )
    op.create_index("ix_promotions_product_id", "promotions", ["product_id"])

    op.create_table(
        "product_batches",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("store_id", sa.String(36), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("batch_no", sa.String(60), nullable=False),
        sa.Column("expiry_date", sa.Date(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("quantity >= 0", name="ck_product_batches_quantity"),
        sa.UniqueConstraint("product_id", "batch_no", name="uq_product_batches_product_batch"),
    )
    op.create_index("ix_product_batches_product_id", "product_batches", ["product_id"])
    op.create_index("ix_product_batches_store_id", "product_batches", ["store_id"])
    op.create_index("ix_product_batches_expiry_date", "product_batches", ["expiry_date"])

    op.create_table(
        "stock_counts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("store_id", sa.String(36), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("stock_area", sa.String(16), nullable=False),
        sa.Column("system_quantity", sa.Integer(), nullable=False),
        sa.Column("physical_quantity", sa.Integer(), nullable=False),
        sa.Column("difference", sa.Integer(), nullable=False),
        sa.Column("note", sa.String(255)),
        sa.Column("counted_by_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("stock_area IN ('warehouse', 'sales')", name="ck_stock_counts_area"),
    )
    op.create_index("ix_stock_counts_product_id", "stock_counts", ["product_id"])
    op.create_index("ix_stock_counts_store_id", "stock_counts", ["store_id"])
    op.create_index("ix_stock_counts_created_at", "stock_counts", ["created_at"])

    op.create_table(
        "sale_returns",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("return_no", sa.String(40), nullable=False, unique=True),
        sa.Column("sale_id", sa.String(36), sa.ForeignKey("sales.id"), nullable=False),
        sa.Column("supervisor_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column("amount", sa.BigInteger(), nullable=False),
        sa.Column("reason", sa.String(255), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("amount >= 0", name="ck_sale_returns_amount"),
    )
    op.create_index("ix_sale_returns_sale_id", "sale_returns", ["sale_id"])

    op.create_table(
        "finance_entries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("entry_type", sa.String(24), nullable=False),
        sa.Column("reference_no", sa.String(50), nullable=False, unique=True),
        sa.Column("counterparty", sa.String(140)),
        sa.Column("amount", sa.BigInteger(), nullable=False),
        sa.Column("status", sa.String(16), nullable=False, server_default="open"),
        sa.Column("due_date", sa.Date()),
        sa.Column("payment_method", sa.String(30)),
        sa.Column("note", sa.String(500)),
        sa.Column("created_by_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "entry_type IN ('expense', 'deposit', 'reconciliation', 'receivable', "
            "'payable', 'purchase_return')",
            name="ck_finance_entries_type",
        ),
        sa.CheckConstraint("amount >= 0", name="ck_finance_entries_amount"),
        sa.CheckConstraint(
            "status IN ('open', 'paid', 'settled', 'cancelled')",
            name="ck_finance_entries_status",
        ),
    )
    op.create_index(
        "ix_finance_entries_type_created", "finance_entries", ["entry_type", "created_at"]
    )

    op.create_table(
        "business_settings",
        sa.Column("key", sa.String(80), primary_key=True),
        sa.Column("group_name", sa.String(40), nullable=False),
        sa.Column("label", sa.String(120), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_business_settings_group_name", "business_settings", ["group_name"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("actor_id", sa.String(36), sa.ForeignKey("cashiers.id")),
        sa.Column("action", sa.String(80), nullable=False),
        sa.Column("entity_type", sa.String(60), nullable=False),
        sa.Column("entity_id", sa.String(80)),
        sa.Column("details_json", sa.Text(), nullable=False, server_default="{}"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_audit_logs_actor_id", "audit_logs", ["actor_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])
    op.create_index("ix_audit_logs_entity_created", "audit_logs", ["entity_type", "created_at"])

    op.create_table(
        "auth_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("cashier_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_auth_sessions_cashier_id", "auth_sessions", ["cashier_id"])
    op.create_index("ix_auth_sessions_expires_at", "auth_sessions", ["expires_at"])

    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("cashier_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    op.create_index("ix_password_reset_tokens_cashier_id", "password_reset_tokens", ["cashier_id"])

    roles = sa.table("roles", sa.column("id", sa.String), sa.column("code", sa.String))
    permissions = sa.table(
        "role_permissions",
        sa.column("id", sa.String),
        sa.column("role_id", sa.String),
        sa.column("permission", sa.String),
    )
    connection = op.get_bind()
    role_rows = list(connection.execute(sa.select(roles.c.id, roles.c.code)))
    permission_roles = {
        "admin.operations": {"OWNER", "MANAGER", "WAREHOUSE"},
        "admin.finance": {"OWNER", "MANAGER"},
        "admin.settings": {"OWNER"},
    }
    rows = []
    for permission, allowed_roles in permission_roles.items():
        rows.extend(
            {
                "id": str(uuid5(NAMESPACE_URL, f"mymarket:{role.code}:{permission}")),
                "role_id": role.id,
                "permission": permission,
            }
            for role in role_rows
            if role.code in allowed_roles
        )
    if rows:
        op.bulk_insert(permissions, rows)


def downgrade() -> None:
    op.execute(
        sa.text(
            "DELETE FROM role_permissions WHERE permission IN "
            "('admin.operations', 'admin.finance', 'admin.settings')"
        )
    )
    for table in (
        "password_reset_tokens",
        "auth_sessions",
        "audit_logs",
        "business_settings",
        "finance_entries",
        "sale_returns",
        "stock_counts",
        "product_batches",
        "promotions",
        "catalog_options",
        "cash_movements",
    ):
        op.drop_table(table)
    op.drop_column("products", "unit_conversion")
    op.drop_column("products", "unit")
    op.drop_column("products", "brand")
    op.drop_constraint("uq_cashiers_email", "cashiers", type_="unique")
    op.drop_column("cashiers", "password_hash")
    op.drop_column("cashiers", "email")
    op.drop_column("stores", "tax_id")
    op.drop_column("stores", "logo_url")
    op.drop_column("stores", "address")
