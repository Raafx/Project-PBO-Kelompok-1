"""Add persistent CEO Copilot conversations.

Revision ID: 20261008_0005
Revises: 20261004_0004
Create Date: 2026-10-08
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20261008_0005"
down_revision: str | None = "20261004_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ceo_chat_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(160), nullable=False),
        sa.Column("created_by_id", sa.String(36), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["created_by_id"], ["cashiers.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_ceo_chat_sessions_created_by_id", "ceo_chat_sessions", ["created_by_id"])
    op.create_index(
        "ix_ceo_chat_sessions_actor_updated",
        "ceo_chat_sessions",
        ["created_by_id", "updated_at"],
    )
    op.create_table(
        "ceo_chat_messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("session_id", sa.String(36), nullable=False),
        sa.Column("role", sa.String(16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("role IN ('user', 'assistant')", name="ck_ceo_chat_messages_role"),
        sa.ForeignKeyConstraint(["session_id"], ["ceo_chat_sessions.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_ceo_chat_messages_session_id", "ceo_chat_messages", ["session_id"])
    op.create_index(
        "ix_ceo_chat_messages_session_created",
        "ceo_chat_messages",
        ["session_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_table("ceo_chat_messages")
    op.drop_table("ceo_chat_sessions")
