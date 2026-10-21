"""Add product images and master-product permission.

Revision ID: 20261008_0007
Revises: 20261008_0006
Create Date: 2026-10-08
"""

from collections.abc import Sequence
from uuid import NAMESPACE_URL, uuid5

import sqlalchemy as sa

from alembic import op

revision: str = "20261008_0007"
down_revision: str | None = "20261008_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("products", sa.Column("image_url", sa.String(255)))
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
                "id": str(uuid5(NAMESPACE_URL, f"mymarket:{row.code}:admin.products")),
                "role_id": row.id,
                "permission": "admin.products",
            }
            for row in role_rows
        ],
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM role_permissions WHERE permission = 'admin.products'"))
    op.drop_column("products", "image_url")
