"""Store the cost snapshot used by each sale item.

Revision ID: 20261027_0013
Revises: 20261008_0012
Create Date: 2026-10-27
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20261027_0013"
down_revision: str | None = "20261008_0012"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("sale_items", sa.Column("unit_cost", sa.BigInteger(), nullable=True))
    op.execute(
        """
        UPDATE sale_items
        SET subtotal = subtotal - discount
        WHERE discount > 0 AND subtotal = unit_price * quantity
        """
    )
    op.execute(
        """
        UPDATE sale_items
        SET unit_cost = (
            SELECT products.cost_price
            FROM products
            WHERE products.id = sale_items.product_id
        )
        """
    )
    op.execute("UPDATE sale_items SET unit_cost = 0 WHERE unit_cost IS NULL")
    op.alter_column(
        "sale_items",
        "unit_cost",
        existing_type=sa.BigInteger(),
        nullable=False,
        server_default="0",
    )


def downgrade() -> None:
    op.drop_column("sale_items", "unit_cost")
