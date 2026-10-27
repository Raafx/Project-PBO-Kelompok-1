from __future__ import annotations

from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def new_id() -> str:
    return str(uuid4())


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class Store(TimestampMixin, Base):
    __tablename__ = "stores"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="Asia/Makassar")
    address: Mapped[str | None] = mapped_column(Text)
    logo_url: Mapped[str | None] = mapped_column(String(255))
    tax_id: Mapped[str | None] = mapped_column(String(40))


class AccessRole(TimestampMixin, Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    permissions: Mapped[list[RolePermission]] = relationship(
        back_populates="role", cascade="all, delete-orphan", lazy="selectin"
    )
    cashiers: Mapped[list[Cashier]] = relationship(back_populates="access_role")


class RolePermission(Base):
    __tablename__ = "role_permissions"
    __table_args__ = (
        UniqueConstraint("role_id", "permission", name="uq_role_permissions_role_permission"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    role_id: Mapped[str] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    permission: Mapped[str] = mapped_column(String(80), nullable=False)

    role: Mapped[AccessRole] = relationship(back_populates="permissions")


class Cashier(TimestampMixin, Base):
    __tablename__ = "cashiers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    employee_code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str | None] = mapped_column(String(160), unique=True)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="cashier")
    role_id: Mapped[str | None] = mapped_column(ForeignKey("roles.id"), index=True)
    pin_hash: Mapped[str | None] = mapped_column(String(255))
    password_hash: Mapped[str | None] = mapped_column(String(255))
    totp_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    totp_secret: Mapped[str | None] = mapped_column(String(64))
    totp_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    totp_enrolled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    totp_last_counter: Mapped[int | None] = mapped_column(BigInteger)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    access_role: Mapped[AccessRole | None] = relationship(
        back_populates="cashiers", lazy="selectin"
    )


class Product(TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
        CheckConstraint("stock >= 0", name="ck_products_stock_non_negative"),
        CheckConstraint("warehouse_stock >= 0", name="ck_products_warehouse_stock_non_negative"),
        CheckConstraint("cost_price >= 0", name="ck_products_cost_price_non_negative"),
        CheckConstraint("reorder_level >= 0", name="ck_products_reorder_level_non_negative"),
        Index("ix_products_name", "name"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    barcode: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    sku: Mapped[str | None] = mapped_column(String(40), unique=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(80))
    unit: Mapped[str] = mapped_column(String(30), nullable=False, default="pcs")
    unit_conversion: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    location: Mapped[str] = mapped_column(String(80), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(255))
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    cost_price: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    warehouse_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Supplier(TimestampMixin, Base):
    __tablename__ = "suppliers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    code: Mapped[str] = mapped_column(String(24), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(140), nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str | None] = mapped_column(String(160))
    address: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    purchase_orders: Mapped[list[PurchaseOrder]] = relationship(back_populates="supplier")


class PurchaseOrder(TimestampMixin, Base):
    __tablename__ = "purchase_orders"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'ordered', 'partially_received', 'received', 'cancelled')",
            name="ck_purchase_orders_status",
        ),
        CheckConstraint("subtotal >= 0", name="ck_purchase_orders_subtotal_non_negative"),
        UniqueConstraint("idempotency_key", name="uq_purchase_orders_idempotency_key"),
        Index("ix_purchase_orders_status_created", "status", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    po_number: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(128))
    supplier_id: Mapped[str] = mapped_column(ForeignKey("suppliers.id"), nullable=False, index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    created_by_id: Mapped[str | None] = mapped_column(ForeignKey("cashiers.id"), index=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="draft")
    expected_date: Mapped[date | None] = mapped_column(Date)
    subtotal: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    ordered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    received_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    supplier: Mapped[Supplier] = relationship(back_populates="purchase_orders", lazy="selectin")
    items: Mapped[list[PurchaseOrderItem]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan", lazy="selectin"
    )


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    __table_args__ = (
        CheckConstraint("quantity_ordered > 0", name="ck_po_items_quantity_ordered"),
        CheckConstraint(
            "quantity_received >= 0 AND quantity_received <= quantity_ordered",
            name="ck_po_items_quantity_received",
        ),
        CheckConstraint("unit_cost >= 0 AND subtotal >= 0", name="ck_po_items_amounts"),
        UniqueConstraint("purchase_order_id", "product_id", name="uq_po_items_order_product"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    purchase_order_id: Mapped[str] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    barcode: Mapped[str] = mapped_column(String(40), nullable=False)
    product_name: Mapped[str] = mapped_column(String(180), nullable=False)
    quantity_ordered: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity_received: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unit_cost: Mapped[int] = mapped_column(BigInteger, nullable=False)
    subtotal: Mapped[int] = mapped_column(BigInteger, nullable=False)

    purchase_order: Mapped[PurchaseOrder] = relationship(back_populates="items")


class StockMovement(Base):
    __tablename__ = "stock_movements"
    __table_args__ = (
        CheckConstraint("quantity_change != 0", name="ck_stock_movements_quantity_change"),
        CheckConstraint("balance_after >= 0", name="ck_stock_movements_balance_after"),
        CheckConstraint(
            "movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer')",
            name="ck_stock_movements_type",
        ),
        CheckConstraint("stock_area IN ('warehouse', 'sales')", name="ck_stock_movements_area"),
        Index("ix_stock_movements_product_created", "product_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    movement_type: Mapped[str] = mapped_column(String(20), nullable=False)
    stock_area: Mapped[str] = mapped_column(String(16), nullable=False, default="sales")
    quantity_change: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_cost: Mapped[int | None] = mapped_column(BigInteger)
    reference_type: Mapped[str | None] = mapped_column(String(30))
    reference_id: Mapped[str | None] = mapped_column(String(36), index=True)
    created_by_id: Mapped[str | None] = mapped_column(ForeignKey("cashiers.id"), index=True)
    note: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class StockTransfer(Base):
    __tablename__ = "stock_transfers"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_stock_transfers_quantity_positive"),
        CheckConstraint(
            "from_area IN ('warehouse', 'sales') AND to_area IN ('warehouse', 'sales')",
            name="ck_stock_transfers_areas",
        ),
        CheckConstraint("from_area <> to_area", name="ck_stock_transfers_distinct_areas"),
        Index("ix_stock_transfers_product_created", "product_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    transfer_no: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    from_area: Mapped[str] = mapped_column(String(16), nullable=False)
    to_area: Mapped[str] = mapped_column(String(16), nullable=False)
    note: Mapped[str | None] = mapped_column(String(255))
    created_by_id: Mapped[str | None] = mapped_column(ForeignKey("cashiers.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class Member(TimestampMixin, Base):
    __tablename__ = "members"
    __table_args__ = (CheckConstraint("points >= 0", name="ck_members_points_non_negative"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    phone: Mapped[str] = mapped_column(String(24), nullable=False, unique=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    tier: Mapped[str] = mapped_column(String(30), nullable=False, default="REGULAR")
    points: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Shift(TimestampMixin, Base):
    __tablename__ = "shifts"
    __table_args__ = (
        CheckConstraint("status IN ('open', 'closed')", name="ck_shifts_status"),
        CheckConstraint("opening_cash >= 0", name="ck_shifts_opening_cash"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    cashier_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False, index=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    opening_cash: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    closing_cash: Mapped[int | None] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String(12), nullable=False, default="open")


class CashMovement(Base):
    __tablename__ = "cash_movements"
    __table_args__ = (
        CheckConstraint("movement_type IN ('cash_in', 'cash_out')", name="ck_cash_movements_type"),
        CheckConstraint("amount > 0", name="ck_cash_movements_amount"),
        Index("ix_cash_movements_shift_created", "shift_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    shift_id: Mapped[str] = mapped_column(ForeignKey("shifts.id"), nullable=False, index=True)
    movement_type: Mapped[str] = mapped_column(String(16), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    note: Mapped[str | None] = mapped_column(String(255))
    created_by_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Voucher(TimestampMixin, Base):
    __tablename__ = "vouchers"
    __table_args__ = (
        CheckConstraint("value >= 0", name="ck_vouchers_value_non_negative"),
        CheckConstraint("min_purchase >= 0", name="ck_vouchers_min_purchase"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    code: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String(180), nullable=False)
    value: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    min_purchase: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Sale(TimestampMixin, Base):
    __tablename__ = "sales"
    __table_args__ = (
        CheckConstraint("status IN ('completed', 'held', 'cancelled')", name="ck_sales_status"),
        CheckConstraint("subtotal >= 0 AND total >= 0", name="ck_sales_totals_non_negative"),
        CheckConstraint("item_count >= 0", name="ck_sales_item_count_non_negative"),
        Index("ix_sales_created_at", "created_at"),
        Index("ix_sales_status_created", "status", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    transaction_no: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(128), unique=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    cashier_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False, index=True)
    shift_id: Mapped[str | None] = mapped_column(ForeignKey("shifts.id"), index=True)
    member_id: Mapped[str | None] = mapped_column(ForeignKey("members.id"), index=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    subtotal: Mapped[int] = mapped_column(BigInteger, nullable=False)
    discount: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    tax: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    rounding: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    total: Mapped[int] = mapped_column(BigInteger, nullable=False)
    item_count: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    items: Mapped[list[SaleItem]] = relationship(
        back_populates="sale", cascade="all, delete-orphan", lazy="selectin"
    )
    payment: Mapped[Payment | None] = relationship(
        back_populates="sale", cascade="all, delete-orphan", uselist=False, lazy="selectin"
    )


class SaleItem(Base):
    __tablename__ = "sale_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_sale_items_quantity_positive"),
        CheckConstraint("unit_price >= 0 AND subtotal >= 0", name="ck_sale_items_amounts"),
        UniqueConstraint("sale_id", "product_id", name="uq_sale_items_sale_product"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    sale_id: Mapped[str] = mapped_column(
        ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    barcode: Mapped[str] = mapped_column(String(40), nullable=False)
    product_name: Mapped[str] = mapped_column(String(180), nullable=False)
    unit_price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    unit_cost: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    discount: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    subtotal: Mapped[int] = mapped_column(BigInteger, nullable=False)

    sale: Mapped[Sale] = relationship(back_populates="items")

    @property
    def gross_profit(self) -> int:
        return self.subtotal - (self.unit_cost * self.quantity)


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint(
            "method IN ('cash', 'qris', 'edc', 'debit', 'credit', 'wallet', 'voucher')",
            name="ck_payments_method",
        ),
        CheckConstraint("status IN ('paid', 'pending', 'failed')", name="ck_payments_status"),
        CheckConstraint("amount >= 0", name="ck_payments_amount_non_negative"),
        CheckConstraint(
            "received_amount IS NULL OR received_amount >= 0",
            name="ck_payments_received_non_negative",
        ),
        CheckConstraint(
            "change_amount IS NULL OR change_amount >= 0",
            name="ck_payments_change_non_negative",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    sale_id: Mapped[str] = mapped_column(
        ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    method: Mapped[str] = mapped_column(String(16), nullable=False)
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    received_amount: Mapped[int | None] = mapped_column(BigInteger)
    change_amount: Mapped[int | None] = mapped_column(BigInteger)
    approval_code: Mapped[str | None] = mapped_column(String(80))
    card_type: Mapped[str | None] = mapped_column(String(10))
    card_last4: Mapped[str | None] = mapped_column(String(4))
    voucher_code: Mapped[str | None] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="paid")
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sale: Mapped[Sale] = relationship(back_populates="payment")


class LiveTransaction(TimestampMixin, Base):
    __tablename__ = "live_transactions"
    __table_args__ = (
        CheckConstraint(
            "status IN ('ready', 'shopping', 'payment', 'processing', "
            "'completed', 'held', 'cancelled')",
            name="ck_live_transactions_status",
        ),
        CheckConstraint("progress >= 0 AND progress <= 100", name="ck_live_transactions_progress"),
        CheckConstraint(
            "item_count >= 0 AND unique_products >= 0",
            name="ck_live_transactions_item_counts",
        ),
        CheckConstraint("subtotal >= 0 AND total >= 0", name="ck_live_transactions_totals"),
        Index("ix_live_transactions_store_updated", "store_id", "updated_at"),
        Index("ix_live_transactions_status_seen", "status", "last_seen_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    cashier_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="ready")
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    item_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unique_products: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    subtotal: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    total: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    payment_method: Mapped[str | None] = mapped_column(String(16))
    payment_ready: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    member_name: Mapped[str | None] = mapped_column(String(120))
    items_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    current_action: Mapped[str] = mapped_column(
        String(120), nullable=False, default="Siap melayani"
    )
    transaction_no: Mapped[str | None] = mapped_column(String(40), index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )


class CatalogOption(TimestampMixin, Base):
    __tablename__ = "catalog_options"
    __table_args__ = (
        CheckConstraint("kind IN ('category', 'unit', 'brand')", name="ck_catalog_options_kind"),
        UniqueConstraint("kind", "code", name="uq_catalog_options_kind_code"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    kind: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(40), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    conversion_factor: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Promotion(TimestampMixin, Base):
    __tablename__ = "promotions"
    __table_args__ = (
        CheckConstraint(
            "promotion_type IN ('percent', 'fixed', 'buy_x_get_y', 'wholesale')",
            name="ck_promotions_type",
        ),
        CheckConstraint("value >= 0 AND min_quantity > 0", name="ck_promotions_values"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    code: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(140), nullable=False)
    promotion_type: Mapped[str] = mapped_column(String(20), nullable=False)
    product_id: Mapped[str | None] = mapped_column(ForeignKey("products.id"), index=True)
    value: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    min_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    buy_quantity: Mapped[int | None] = mapped_column(Integer)
    free_quantity: Mapped[int | None] = mapped_column(Integer)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class ProductBatch(TimestampMixin, Base):
    __tablename__ = "product_batches"
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_product_batches_quantity"),
        UniqueConstraint("product_id", "batch_no", name="uq_product_batches_product_batch"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    batch_no: Mapped[str] = mapped_column(String(60), nullable=False)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)


class StockCount(Base):
    __tablename__ = "stock_counts"
    __table_args__ = (
        CheckConstraint("stock_area IN ('warehouse', 'sales')", name="ck_stock_counts_area"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    stock_area: Mapped[str] = mapped_column(String(16), nullable=False)
    system_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    physical_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    difference: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[str | None] = mapped_column(String(255))
    counted_by_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class SaleReturn(TimestampMixin, Base):
    __tablename__ = "sale_returns"
    __table_args__ = (CheckConstraint("amount >= 0", name="ck_sale_returns_amount"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    return_no: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    sale_id: Mapped[str] = mapped_column(ForeignKey("sales.id"), nullable=False, index=True)
    supervisor_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False)
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)


class FinanceEntry(TimestampMixin, Base):
    __tablename__ = "finance_entries"
    __table_args__ = (
        CheckConstraint(
            "entry_type IN ('expense', 'deposit', 'reconciliation', 'receivable', "
            "'payable', 'purchase_return')",
            name="ck_finance_entries_type",
        ),
        CheckConstraint("amount >= 0", name="ck_finance_entries_amount"),
        CheckConstraint(
            "status IN ('open', 'paid', 'settled', 'cancelled')",
            name="ck_finance_entries_status",
        ),
        Index("ix_finance_entries_type_created", "entry_type", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    entry_type: Mapped[str] = mapped_column(String(24), nullable=False)
    reference_no: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    counterparty: Mapped[str | None] = mapped_column(String(140))
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="open")
    due_date: Mapped[date | None] = mapped_column(Date)
    payment_method: Mapped[str | None] = mapped_column(String(30))
    note: Mapped[str | None] = mapped_column(String(500))
    created_by_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False)


class BusinessSetting(TimestampMixin, Base):
    __tablename__ = "business_settings"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    group_name: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (Index("ix_audit_logs_entity_created", "entity_type", "created_at"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    actor_id: Mapped[str | None] = mapped_column(ForeignKey("cashiers.id"), index=True)
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(60), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(80))
    details_json: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    cashier_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class TotpChallenge(Base):
    __tablename__ = "totp_challenges"
    __table_args__ = (
        CheckConstraint("purpose IN ('setup', 'login')", name="ck_totp_challenges_purpose"),
        Index("ix_totp_challenges_cashier_expires", "cashier_id", "expires_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    cashier_id: Mapped[str] = mapped_column(
        ForeignKey("cashiers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    purpose: Mapped[str] = mapped_column(String(16), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    cashier_id: Mapped[str] = mapped_column(ForeignKey("cashiers.id"), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class CeoChatSession(TimestampMixin, Base):
    __tablename__ = "ceo_chat_sessions"
    __table_args__ = (Index("ix_ceo_chat_sessions_actor_updated", "created_by_id", "updated_at"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    title: Mapped[str] = mapped_column(String(160), nullable=False, default="Percakapan baru")
    created_by_id: Mapped[str] = mapped_column(
        ForeignKey("cashiers.id", ondelete="CASCADE"), nullable=False, index=True
    )

    messages: Mapped[list[CeoChatMessage]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="CeoChatMessage.created_at",
    )


class CeoChatMessage(Base):
    __tablename__ = "ceo_chat_messages"
    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant')", name="ck_ceo_chat_messages_role"),
        Index("ix_ceo_chat_messages_session_created", "session_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    session_id: Mapped[str] = mapped_column(
        ForeignKey("ceo_chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    session: Mapped[CeoChatSession] = relationship(back_populates="messages")
