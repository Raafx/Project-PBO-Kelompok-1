"""Allow each account to use multiple Authenticator devices.

Revision ID: 20261028_0014
Revises: 20261027_0013
Create Date: 2026-10-28
"""

from collections.abc import Sequence
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision: str = "20261028_0014"
down_revision: str | None = "20261027_0013"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "totp_devices",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("cashier_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("secret", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("enrolled_at", sa.DateTime(), nullable=True),
        sa.Column("last_used_at", sa.DateTime(), nullable=True),
        sa.Column("last_counter", sa.BigInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["cashier_id"], ["cashiers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_totp_devices_cashier_id", "totp_devices", ["cashier_id"])
    op.create_index(
        "ix_totp_devices_cashier_active",
        "totp_devices",
        ["cashier_id", "is_active"],
    )

    # Pertahankan Authenticator yang sudah terhubung sebelum fitur multi-device.
    bind = op.get_bind()
    legacy_accounts = bind.execute(
        sa.text(
            """
            SELECT id, totp_secret, totp_enrolled_at, totp_last_counter
            FROM cashiers
            WHERE totp_enabled = :enabled AND totp_secret IS NOT NULL
            """
        ),
        {"enabled": True},
    ).mappings()
    for account in legacy_accounts:
        bind.execute(
            sa.text(
                """
                INSERT INTO totp_devices
                    (id, cashier_id, name, secret, is_active, enrolled_at,
                     last_used_at, last_counter, created_at)
                VALUES
                    (:id, :cashier_id, :name, :secret, :is_active, :enrolled_at,
                     NULL, :last_counter, CURRENT_TIMESTAMP)
                """
            ),
            {
                "id": str(uuid4()),
                "cashier_id": account["id"],
                "name": "Perangkat utama",
                "secret": account["totp_secret"],
                "is_active": True,
                "enrolled_at": account["totp_enrolled_at"],
                "last_counter": account["totp_last_counter"],
            },
        )

    op.add_column(
        "totp_challenges",
        sa.Column("device_id", sa.String(length=36), nullable=True),
    )
    op.create_index(
        "ix_totp_challenges_device_id", "totp_challenges", ["device_id"]
    )
    op.create_foreign_key(
        "fk_totp_challenges_device_id",
        "totp_challenges",
        "totp_devices",
        ["device_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_totp_challenges_device_id", "totp_challenges", type_="foreignkey"
    )
    op.drop_index("ix_totp_challenges_device_id", table_name="totp_challenges")
    op.drop_column("totp_challenges", "device_id")
    op.drop_index("ix_totp_devices_cashier_active", table_name="totp_devices")
    op.drop_index("ix_totp_devices_cashier_id", table_name="totp_devices")
    op.drop_table("totp_devices")
