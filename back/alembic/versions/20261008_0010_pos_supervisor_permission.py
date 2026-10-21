"""Add dedicated POS supervisor permission.

Revision ID: 20261008_0010
Revises: 20261008_0009
Create Date: 2026-10-08
"""

from collections.abc import Sequence
from uuid import NAMESPACE_URL, uuid5

import sqlalchemy as sa

from alembic import op

revision: str = "20261008_0010"
down_revision: str | None = "20261008_0009"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    roles = sa.table("roles", sa.column("id", sa.String), sa.column("code", sa.String))
    permissions = sa.table(
        "role_permissions",
        sa.column("id", sa.String),
        sa.column("role_id", sa.String),
        sa.column("permission", sa.String),
    )
    rows = op.get_bind().execute(
        sa.select(roles.c.id, roles.c.code).where(roles.c.code.in_(("OWNER", "MANAGER")))
    )
    op.bulk_insert(
        permissions,
        [
            {
                "id": str(uuid5(NAMESPACE_URL, f"mymarket:{row.code}:pos.supervise")),
                "role_id": row.id,
                "permission": "pos.supervise",
            }
            for row in rows
        ],
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM role_permissions WHERE permission = 'pos.supervise'"))
