"""Add TOTP enrollment and login challenges for admin accounts.

Revision ID: 20261008_0011
Revises: 20261008_0010
Create Date: 2026-10-08
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20261008_0011"
down_revision: str | None = "20261008_0010"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "cashiers",
        sa.Column("totp_required", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("cashiers", sa.Column("totp_secret", sa.String(length=64), nullable=True))
    op.add_column(
        "cashiers",
        sa.Column("totp_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("cashiers", sa.Column("totp_enrolled_at", sa.DateTime(), nullable=True))
    op.add_column("cashiers", sa.Column("totp_last_counter", sa.BigInteger(), nullable=True))

    op.create_table(
        "totp_challenges",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("cashier_id", sa.String(length=36), nullable=False),
        sa.Column("purpose", sa.String(length=16), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "purpose IN ('setup', 'login')",
            name="ck_totp_challenges_purpose",
        ),
        sa.ForeignKeyConstraint(["cashier_id"], ["cashiers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(
        "ix_totp_challenges_cashier_id",
        "totp_challenges",
        ["cashier_id"],
        unique=False,
    )
    op.create_index(
        "ix_totp_challenges_cashier_expires",
        "totp_challenges",
        ["cashier_id", "expires_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_totp_challenges_cashier_expires", table_name="totp_challenges")
    op.drop_index("ix_totp_challenges_cashier_id", table_name="totp_challenges")
    op.drop_table("totp_challenges")
    op.drop_column("cashiers", "totp_last_counter")
    op.drop_column("cashiers", "totp_enrolled_at")
    op.drop_column("cashiers", "totp_enabled")
    op.drop_column("cashiers", "totp_secret")
    op.drop_column("cashiers", "totp_required")
