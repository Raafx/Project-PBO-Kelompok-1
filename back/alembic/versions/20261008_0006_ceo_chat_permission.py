"""Restrict CEO Copilot to its own permission.

Revision ID: 20261008_0006
Revises: 20261008_0005
Create Date: 2026-10-08
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20261008_0006"
down_revision: str | None = "20261008_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

PERMISSION_ID = "b556ff11-d851-52bd-a8e6-38c677d14671"


def upgrade() -> None:
    op.execute(
        sa.text(
            "INSERT INTO role_permissions (id, role_id, permission) "
            "SELECT :permission_id, r.id, 'admin.ceo_chat' FROM roles r "
            "WHERE r.code = 'OWNER' AND NOT EXISTS ("
            "SELECT 1 FROM role_permissions rp "
            "WHERE rp.role_id = r.id AND rp.permission = 'admin.ceo_chat')"
        ).bindparams(permission_id=PERMISSION_ID)
    )


def downgrade() -> None:
    op.execute(
        sa.text("DELETE FROM role_permissions WHERE permission = 'admin.ceo_chat'")
    )
