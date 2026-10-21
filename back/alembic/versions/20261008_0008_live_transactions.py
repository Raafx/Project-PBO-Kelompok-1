"""Add live transaction workflow.

Revision ID: 20261008_0008
Revises: 20261008_0007
Create Date: 2026-10-08
"""

from collections.abc import Sequence
from uuid import NAMESPACE_URL, uuid5

import sqlalchemy as sa

from alembic import op

revision: str = "20261008_0008"
down_revision: str | None = "20261008_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "live_transactions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("store_id", sa.String(36), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("cashier_id", sa.String(36), sa.ForeignKey("cashiers.id"), nullable=False),
        sa.Column("status", sa.String(16), nullable=False, server_default="ready"),
        sa.Column("progress", sa.Integer, nullable=False, server_default="0"),
        sa.Column("item_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("unique_products", sa.Integer, nullable=False, server_default="0"),
        sa.Column("subtotal", sa.BigInteger, nullable=False, server_default="0"),
        sa.Column("total", sa.BigInteger, nullable=False, server_default="0"),
        sa.Column("payment_method", sa.String(16)),
        sa.Column("payment_ready", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("member_name", sa.String(120)),
        sa.Column("items_json", sa.Text, nullable=False),
        sa.Column("current_action", sa.String(120), nullable=False, server_default="Siap melayani"),
        sa.Column("transaction_no", sa.String(40)),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "status IN ('ready', 'shopping', 'payment', 'processing', "
            "'completed', 'held', 'cancelled')",
            name="ck_live_transactions_status",
        ),
        sa.CheckConstraint(
            "progress >= 0 AND progress <= 100", name="ck_live_transactions_progress"
        ),
        sa.CheckConstraint(
            "item_count >= 0 AND unique_products >= 0", name="ck_live_transactions_item_counts"
        ),
        sa.CheckConstraint("subtotal >= 0 AND total >= 0", name="ck_live_transactions_totals"),
    )
    op.create_index("ix_live_transactions_store_id", "live_transactions", ["store_id"])
    op.create_index("ix_live_transactions_cashier_id", "live_transactions", ["cashier_id"])
    op.create_index("ix_live_transactions_transaction_no", "live_transactions", ["transaction_no"])
    op.create_index("ix_live_transactions_last_seen_at", "live_transactions", ["last_seen_at"])
    op.create_index(
        "ix_live_transactions_store_updated", "live_transactions", ["store_id", "updated_at"]
    )
    op.create_index(
        "ix_live_transactions_status_seen", "live_transactions", ["status", "last_seen_at"]
    )

    roles = sa.table("roles", sa.column("id", sa.String), sa.column("code", sa.String))
    permissions = sa.table(
        "role_permissions",
        sa.column("id", sa.String),
        sa.column("role_id", sa.String),
        sa.column("permission", sa.String),
    )
    connection = op.get_bind()
    role_rows = connection.execute(
        sa.select(roles.c.id, roles.c.code).where(roles.c.code.in_(("OWNER", "MANAGER")))
    )
    op.bulk_insert(
        permissions,
        [
            {
                "id": str(uuid5(NAMESPACE_URL, f"mymarket:{row.code}:admin.live_transactions")),
                "role_id": row.id,
                "permission": "admin.live_transactions",
            }
            for row in role_rows
        ],
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM role_permissions WHERE permission = 'admin.live_transactions'"))
    op.drop_table("live_transactions")
