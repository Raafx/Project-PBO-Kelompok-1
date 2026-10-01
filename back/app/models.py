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


class Cashier(TimestampMixin, Base):
    __tablename__ = "cashiers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    employee_code: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="cashier")
    pin_hash: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Product(TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
        CheckConstraint("stock >= 0", name="ck_products_stock_non_negative"),
        CheckConstraint("cost_price >= 0", name="ck_products_cost_price_non_negative"),
        CheckConstraint("reorder_level >= 0", name="ck_products_reorder_level_non_negative"),
        Index("ix_products_name", "name"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    barcode: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    sku: Mapped[str | None] = mapped_column(String(40), unique=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    location: Mapped[str] = mapped_column(String(80), nullable=False)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    cost_price: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
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
        Index("ix_purchase_orders_status_created", "status", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    po_number: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    supplier_id: Mapped[str] = mapped_column(ForeignKey("suppliers.id"), nullable=False, index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
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
            "movement_type IN ('purchase', 'sale', 'adjustment', 'return')",
            name="ck_stock_movements_type",
        ),
        Index("ix_stock_movements_product_created", "product_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    movement_type: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity_change: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_cost: Mapped[int | None] = mapped_column(BigInteger)
    reference_type: Mapped[str | None] = mapped_column(String(30))
    reference_id: Mapped[str | None] = mapped_column(String(36), index=True)
    note: Mapped[str | None] = mapped_column(String(255))
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
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    discount: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    subtotal: Mapped[int] = mapped_column(BigInteger, nullable=False)

    sale: Mapped[Sale] = relationship(back_populates="items")


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint(
            "method IN ('cash', 'qris', 'debit', 'credit', 'wallet', 'voucher')",
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
    voucher_code: Mapped[str | None] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="paid")
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sale: Mapped[Sale] = relationship(back_populates="payment")
