"""Add inventory actor audit and purchase idempotency.

Revision ID: 20261004_0004
Revises: 20261004_0003
Create Date: 2026-10-04
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20261004_0004"
down_revision: str | None = "20261004_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("purchase_orders", sa.Column("idempotency_key", sa.String(128)))
    op.create_unique_constraint(
        "uq_purchase_orders_idempotency_key", "purchase_orders", ["idempotency_key"]
    )
    op.add_column("purchase_orders", sa.Column("created_by_id", sa.String(36)))
    op.create_index("ix_purchase_orders_created_by_id", "purchase_orders", ["created_by_id"])
    op.create_foreign_key(
        "fk_purchase_orders_created_by_id_cashiers",
        "purchase_orders",
        "cashiers",
        ["created_by_id"],
        ["id"],
    )

    op.add_column("stock_movements", sa.Column("created_by_id", sa.String(36)))
    op.create_index("ix_stock_movements_created_by_id", "stock_movements", ["created_by_id"])
    op.create_foreign_key(
        "fk_stock_movements_created_by_id_cashiers",
        "stock_movements",
        "cashiers",
        ["created_by_id"],
        ["id"],
    )

    op.execute(
        "UPDATE purchase_orders po "
        "JOIN cashiers c ON c.employee_code = 'KASIR03' "
        "SET po.created_by_id = c.id WHERE po.created_by_id IS NULL"
    )
    op.execute(
        "UPDATE stock_movements sm "
        "JOIN cashiers c ON c.employee_code = 'KASIR03' "
        "SET sm.created_by_id = c.id WHERE sm.created_by_id IS NULL"
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_stock_movements_created_by_id_cashiers", "stock_movements", type_="foreignkey"
    )
    op.drop_index("ix_stock_movements_created_by_id", table_name="stock_movements")
    op.drop_column("stock_movements", "created_by_id")

    op.drop_constraint(
        "fk_purchase_orders_created_by_id_cashiers", "purchase_orders", type_="foreignkey"
    )
    op.drop_index("ix_purchase_orders_created_by_id", table_name="purchase_orders")
    op.drop_constraint(
        "uq_purchase_orders_idempotency_key", "purchase_orders", type_="unique"
    )
    op.drop_column("purchase_orders", "created_by_id")
    op.drop_column("purchase_orders", "idempotency_key")
