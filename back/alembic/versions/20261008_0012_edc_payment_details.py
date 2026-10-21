"""Add EDC payment details and method.

Revision ID: 20261008_0012
Revises: 20261008_0011
Create Date: 2026-10-08
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20261008_0012"
down_revision: str | None = "20261008_0011"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("ck_payments_method", "payments", type_="check")
    op.create_check_constraint(
        "ck_payments_method",
        "payments",
        "method IN ('cash', 'qris', 'edc', 'debit', 'credit', 'wallet', 'voucher')",
    )
    op.add_column("payments", sa.Column("card_type", sa.String(length=10), nullable=True))
    op.add_column("payments", sa.Column("card_last4", sa.String(length=4), nullable=True))


def downgrade() -> None:
    op.execute("UPDATE payments SET method = 'debit' WHERE method = 'edc'")
    op.drop_column("payments", "card_last4")
    op.drop_column("payments", "card_type")
    op.drop_constraint("ck_payments_method", "payments", type_="check")
    op.create_check_constraint(
        "ck_payments_method",
        "payments",
        "method IN ('cash', 'qris', 'debit', 'credit', 'wallet', 'voucher')",
    )
