"""Add warehouse stock, transfers, roles, and page permissions.

Revision ID: 20261004_0003
Revises: 20260930_0002
Create Date: 2026-10-04
"""

from collections.abc import Sequence
from uuid import NAMESPACE_URL, uuid5

import sqlalchemy as sa

from alembic import op

revision: str = "20261004_0003"
down_revision: str | None = "20260930_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLE_OPTIONS = {
    "mysql_engine": "InnoDB",
    "mysql_charset": "utf8mb4",
    "mysql_collate": "utf8mb4_unicode_ci",
}

ROLE_IDS = {
    "OWNER": "00000000-0000-0000-0000-000000000001",
    "MANAGER": "00000000-0000-0000-0000-000000000002",
    "WAREHOUSE": "00000000-0000-0000-0000-000000000003",
    "CASHIER": "00000000-0000-0000-0000-000000000004",
}

ROLE_PERMISSIONS = {
    "OWNER": {
        "pos.access",
        "admin.overview",
        "admin.sales",
        "admin.reports",
        "admin.stock",
        "admin.purchasing",
        "admin.suppliers",
        "admin.roles",
    },
    "MANAGER": {
        "pos.access",
        "admin.overview",
        "admin.sales",
        "admin.reports",
        "admin.stock",
        "admin.purchasing",
        "admin.suppliers",
    },
    "WAREHOUSE": {
        "admin.overview",
        "admin.stock",
        "admin.purchasing",
        "admin.suppliers",
    },
    "CASHIER": {"pos.access", "admin.sales"},
}


def timestamps() -> list[sa.Column]:
    return [
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    ]


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("code", sa.String(30), nullable=False, unique=True),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default=sa.true()),
        *timestamps(),
        **TABLE_OPTIONS,
    )
    op.create_table(
        "role_permissions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "role_id",
            sa.String(36),
            sa.ForeignKey("roles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("permission", sa.String(80), nullable=False),
        sa.UniqueConstraint("role_id", "permission", name="uq_role_permissions_role_permission"),
        **TABLE_OPTIONS,
    )
    op.create_index("ix_role_permissions_role_id", "role_permissions", ["role_id"])

    roles_table = sa.table(
        "roles",
        sa.column("id", sa.String),
        sa.column("code", sa.String),
        sa.column("name", sa.String),
        sa.column("is_system", sa.Boolean),
    )
    op.bulk_insert(
        roles_table,
        [
            {"id": ROLE_IDS["OWNER"], "code": "OWNER", "name": "Pemilik", "is_system": True},
            {
                "id": ROLE_IDS["MANAGER"],
                "code": "MANAGER",
                "name": "Manajer",
                "is_system": True,
            },
            {
                "id": ROLE_IDS["WAREHOUSE"],
                "code": "WAREHOUSE",
                "name": "Staf Gudang",
                "is_system": True,
            },
            {"id": ROLE_IDS["CASHIER"], "code": "CASHIER", "name": "Kasir", "is_system": True},
        ],
    )
    permissions_table = sa.table(
        "role_permissions",
        sa.column("id", sa.String),
        sa.column("role_id", sa.String),
        sa.column("permission", sa.String),
    )
    op.bulk_insert(
        permissions_table,
        [
            {
                "id": str(uuid5(NAMESPACE_URL, f"mymarket:{code}:{permission}")),
                "role_id": ROLE_IDS[code],
                "permission": permission,
            }
            for code, permissions in ROLE_PERMISSIONS.items()
            for permission in sorted(permissions)
        ],
    )

    op.add_column("cashiers", sa.Column("role_id", sa.String(36), nullable=True))
    op.create_index("ix_cashiers_role_id", "cashiers", ["role_id"])
    op.create_foreign_key("fk_cashiers_role_id_roles", "cashiers", "roles", ["role_id"], ["id"])
    op.execute(
        sa.text(
            "UPDATE cashiers SET role_id = :role_id, role = 'owner' WHERE employee_code = 'KASIR03'"
        ).bindparams(role_id=ROLE_IDS["OWNER"])
    )
    op.execute(
        sa.text(
            "UPDATE cashiers SET role_id = :role_id, role = 'cashier' WHERE role_id IS NULL"
        ).bindparams(role_id=ROLE_IDS["CASHIER"])
    )

    op.add_column(
        "products",
        sa.Column("warehouse_stock", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_check_constraint(
        "ck_products_warehouse_stock_non_negative", "products", "warehouse_stock >= 0"
    )

    op.add_column(
        "stock_movements",
        sa.Column("stock_area", sa.String(16), nullable=False, server_default="sales"),
    )
    op.drop_constraint("ck_stock_movements_type", "stock_movements", type_="check")
    op.create_check_constraint(
        "ck_stock_movements_type",
        "stock_movements",
        "movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer')",
    )
    op.create_check_constraint(
        "ck_stock_movements_area",
        "stock_movements",
        "stock_area IN ('warehouse', 'sales')",
    )

    op.create_table(
        "stock_transfers",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("transfer_no", sa.String(40), nullable=False, unique=True),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("store_id", sa.String(36), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("from_area", sa.String(16), nullable=False),
        sa.Column("to_area", sa.String(16), nullable=False),
        sa.Column("note", sa.String(255)),
        sa.Column("created_by_id", sa.String(36), sa.ForeignKey("cashiers.id")),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint("quantity > 0", name="ck_stock_transfers_quantity_positive"),
        sa.CheckConstraint(
            "from_area IN ('warehouse', 'sales') AND to_area IN ('warehouse', 'sales')",
            name="ck_stock_transfers_areas",
        ),
        sa.CheckConstraint("from_area <> to_area", name="ck_stock_transfers_distinct_areas"),
        **TABLE_OPTIONS,
    )
    op.create_index("ix_stock_transfers_product_id", "stock_transfers", ["product_id"])
    op.create_index("ix_stock_transfers_store_id", "stock_transfers", ["store_id"])
    op.create_index("ix_stock_transfers_created_by_id", "stock_transfers", ["created_by_id"])
    op.create_index("ix_stock_transfers_created_at", "stock_transfers", ["created_at"])
    op.create_index(
        "ix_stock_transfers_product_created", "stock_transfers", ["product_id", "created_at"]
    )

    op.execute(
        "UPDATE purchase_orders SET status = 'cancelled' "
        "WHERE status IN ('draft', 'ordered', 'partially_received')"
    )


def downgrade() -> None:
    op.drop_index("ix_stock_transfers_product_created", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_created_at", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_created_by_id", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_store_id", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_product_id", table_name="stock_transfers")
    op.drop_table("stock_transfers")

    op.drop_constraint("ck_stock_movements_area", "stock_movements", type_="check")
    op.drop_constraint("ck_stock_movements_type", "stock_movements", type_="check")
    op.create_check_constraint(
        "ck_stock_movements_type",
        "stock_movements",
        "movement_type IN ('purchase', 'sale', 'adjustment', 'return')",
    )
    op.drop_column("stock_movements", "stock_area")
    op.drop_constraint("ck_products_warehouse_stock_non_negative", "products", type_="check")
    op.drop_column("products", "warehouse_stock")

    op.drop_constraint("fk_cashiers_role_id_roles", "cashiers", type_="foreignkey")
    op.drop_index("ix_cashiers_role_id", table_name="cashiers")
    op.drop_column("cashiers", "role_id")
    op.drop_index("ix_role_permissions_role_id", table_name="role_permissions")
    op.drop_table("role_permissions")
    op.drop_table("roles")
