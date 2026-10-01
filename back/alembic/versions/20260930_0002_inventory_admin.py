"""Add suppliers, purchasing, and stock management.

Revision ID: 20260930_0002
Revises: 20260930_0001
Create Date: 2026-09-30
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260930_0002"
down_revision: str | None = "20260930_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLE_OPTIONS = {
    "mysql_engine": "InnoDB",
    "mysql_charset": "utf8mb4",
    "mysql_collate": "utf8mb4_unicode_ci",
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
    op.add_column(
        "products",
        sa.Column("cost_price", sa.BigInteger(), server_default=sa.text("0"), nullable=False),
    )
    op.add_column(
        "products",
        sa.Column("reorder_level", sa.Integer(), server_default=sa.text("10"), nullable=False),
    )
    op.execute("UPDATE products SET stock = 0 WHERE stock IS NULL")
    op.alter_column(
        "products",
        "stock",
        existing_type=sa.Integer(),
        nullable=False,
        server_default=sa.text("0"),
    )
    op.create_check_constraint("ck_products_cost_price_non_negative", "products", "cost_price >= 0")
    op.create_check_constraint(
        "ck_products_reorder_level_non_negative", "products", "reorder_level >= 0"
    )

    initial_inventory = {
        "8998866200224": (2_800, 64, 24),
        "8886008101053": (3_000, 48, 20),
        "8992753211118": (18_000, 18, 8),
        "8991001101121": (15_000, 12, 6),
        "8999999052028": (14_200, 15, 8),
        "8993175112034": (69_000, 6, 8),
        "8991002101656": (13_500, 9, 10),
        "8997008340512": (15_500, 20, 10),
        "8993053710505": (19_500, 7, 10),
    }
    products = sa.table(
        "products",
        sa.column("barcode", sa.String()),
        sa.column("cost_price", sa.BigInteger()),
        sa.column("stock", sa.Integer()),
        sa.column("reorder_level", sa.Integer()),
    )
    for barcode, (cost_price, stock, reorder_level) in initial_inventory.items():
        op.execute(
            products.update()
            .where(products.c.barcode == barcode)
            .values(cost_price=cost_price, stock=stock, reorder_level=reorder_level)
        )

    op.create_table(
        "suppliers",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("code", sa.String(24), nullable=False, unique=True),
        sa.Column("name", sa.String(140), nullable=False),
        sa.Column("contact_person", sa.String(120)),
        sa.Column("phone", sa.String(30)),
        sa.Column("email", sa.String(160)),
        sa.Column("address", sa.Text()),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        *timestamps(),
        **TABLE_OPTIONS,
    )
    op.create_table(
        "purchase_orders",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("po_number", sa.String(40), nullable=False, unique=True),
        sa.Column("supplier_id", sa.String(36), sa.ForeignKey("suppliers.id"), nullable=False),
        sa.Column("store_id", sa.String(36), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("status", sa.String(24), nullable=False),
        sa.Column("expected_date", sa.Date()),
        sa.Column("subtotal", sa.BigInteger(), nullable=False),
        sa.Column("notes", sa.Text()),
        sa.Column("ordered_at", sa.DateTime()),
        sa.Column("received_at", sa.DateTime()),
        *timestamps(),
        sa.CheckConstraint(
            "status IN ('draft', 'ordered', 'partially_received', 'received', 'cancelled')",
            name="ck_purchase_orders_status",
        ),
        sa.CheckConstraint("subtotal >= 0", name="ck_purchase_orders_subtotal_non_negative"),
        **TABLE_OPTIONS,
    )
    op.create_index("ix_purchase_orders_supplier_id", "purchase_orders", ["supplier_id"])
    op.create_index("ix_purchase_orders_store_id", "purchase_orders", ["store_id"])
    op.create_index(
        "ix_purchase_orders_status_created", "purchase_orders", ["status", "created_at"]
    )
    op.create_table(
        "purchase_order_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "purchase_order_id",
            sa.String(36),
            sa.ForeignKey("purchase_orders.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("barcode", sa.String(40), nullable=False),
        sa.Column("product_name", sa.String(180), nullable=False),
        sa.Column("quantity_ordered", sa.Integer(), nullable=False),
        sa.Column("quantity_received", sa.Integer(), nullable=False),
        sa.Column("unit_cost", sa.BigInteger(), nullable=False),
        sa.Column("subtotal", sa.BigInteger(), nullable=False),
        sa.CheckConstraint("quantity_ordered > 0", name="ck_po_items_quantity_ordered"),
        sa.CheckConstraint(
            "quantity_received >= 0 AND quantity_received <= quantity_ordered",
            name="ck_po_items_quantity_received",
        ),
        sa.CheckConstraint("unit_cost >= 0 AND subtotal >= 0", name="ck_po_items_amounts"),
        sa.UniqueConstraint("purchase_order_id", "product_id", name="uq_po_items_order_product"),
        **TABLE_OPTIONS,
    )
    op.create_index(
        "ix_purchase_order_items_purchase_order_id",
        "purchase_order_items",
        ["purchase_order_id"],
    )
    op.create_index("ix_purchase_order_items_product_id", "purchase_order_items", ["product_id"])
    op.create_table(
        "stock_movements",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("store_id", sa.String(36), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("movement_type", sa.String(20), nullable=False),
        sa.Column("quantity_change", sa.Integer(), nullable=False),
        sa.Column("balance_after", sa.Integer(), nullable=False),
        sa.Column("unit_cost", sa.BigInteger()),
        sa.Column("reference_type", sa.String(30)),
        sa.Column("reference_id", sa.String(36)),
        sa.Column("note", sa.String(255)),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint("quantity_change != 0", name="ck_stock_movements_quantity_change"),
        sa.CheckConstraint("balance_after >= 0", name="ck_stock_movements_balance_after"),
        sa.CheckConstraint(
            "movement_type IN ('purchase', 'sale', 'adjustment', 'return')",
            name="ck_stock_movements_type",
        ),
        **TABLE_OPTIONS,
    )
    op.create_index("ix_stock_movements_product_id", "stock_movements", ["product_id"])
    op.create_index("ix_stock_movements_store_id", "stock_movements", ["store_id"])
    op.create_index("ix_stock_movements_reference_id", "stock_movements", ["reference_id"])
    op.create_index("ix_stock_movements_created_at", "stock_movements", ["created_at"])
    op.create_index(
        "ix_stock_movements_product_created",
        "stock_movements",
        ["product_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_stock_movements_product_created", table_name="stock_movements")
    op.drop_index("ix_stock_movements_created_at", table_name="stock_movements")
    op.drop_index("ix_stock_movements_reference_id", table_name="stock_movements")
    op.drop_index("ix_stock_movements_store_id", table_name="stock_movements")
    op.drop_index("ix_stock_movements_product_id", table_name="stock_movements")
    op.drop_table("stock_movements")
    op.drop_index("ix_purchase_order_items_product_id", table_name="purchase_order_items")
    op.drop_index("ix_purchase_order_items_purchase_order_id", table_name="purchase_order_items")
    op.drop_table("purchase_order_items")
    op.drop_index("ix_purchase_orders_status_created", table_name="purchase_orders")
    op.drop_index("ix_purchase_orders_store_id", table_name="purchase_orders")
    op.drop_index("ix_purchase_orders_supplier_id", table_name="purchase_orders")
    op.drop_table("purchase_orders")
    op.drop_table("suppliers")
    op.drop_constraint("ck_products_reorder_level_non_negative", "products", type_="check")
    op.drop_constraint("ck_products_cost_price_non_negative", "products", type_="check")
    op.alter_column(
        "products",
        "stock",
        existing_type=sa.Integer(),
        nullable=True,
        server_default=None,
    )
    op.drop_column("products", "reorder_level")
    op.drop_column("products", "cost_price")
