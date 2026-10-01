from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PaymentMethod(StrEnum):
    cash = "cash"
    qris = "qris"
    debit = "debit"
    credit = "credit"
    wallet = "wallet"
    voucher = "voucher"


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    barcode: str
    sku: str | None
    name: str
    category: str
    location: str
    price: int
    cost_price: int
    stock: int
    reorder_level: int
    is_active: bool


class MemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone: str
    full_name: str
    tier: str
    points: int


class SaleLineCreate(BaseModel):
    barcode: str = Field(min_length=1, max_length=40)
    quantity: int = Field(ge=1, le=999)

    @field_validator("barcode")
    @classmethod
    def strip_barcode(cls, value: str) -> str:
        return value.strip()


class PaymentCreate(BaseModel):
    method: PaymentMethod
    received_amount: int | None = Field(default=None, ge=0, le=9_999_999_999_999)
    approval_code: str | None = Field(default=None, max_length=80)
    voucher_code: str | None = Field(default=None, max_length=40)
    confirmed: bool = False


class SaleBaseCreate(BaseModel):
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    cashier_code: str = Field(default="KASIR03", min_length=1, max_length=30)
    member_phone: str | None = Field(default=None, max_length=24)
    items: list[SaleLineCreate] = Field(min_length=1, max_length=200)


class CheckoutCreate(SaleBaseCreate):
    payment: PaymentCreate


class HoldCreate(SaleBaseCreate):
    notes: str | None = Field(default=None, max_length=500)


class SaleItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    barcode: str
    product_name: str
    unit_price: int
    quantity: int
    discount: int
    subtotal: int


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    method: str
    amount: int
    received_amount: int | None
    change_amount: int | None
    approval_code: str | None
    voucher_code: str | None
    status: str


class SaleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transaction_no: str
    status: str
    subtotal: int
    discount: int
    tax: int
    rounding: int
    total: int
    item_count: int
    created_at: datetime
    items: list[SaleItemRead]
    payment: PaymentRead | None


class VoucherValidate(BaseModel):
    code: str = Field(min_length=1, max_length=40)
    total: int = Field(ge=0)


class VoucherResult(BaseModel):
    valid: bool
    code: str
    message: str


class SupplierCreate(BaseModel):
    code: str = Field(min_length=2, max_length=24, pattern=r"^[A-Za-z0-9-]+$")
    name: str = Field(min_length=2, max_length=140)
    contact_person: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    email: str | None = Field(default=None, max_length=160)
    address: str | None = Field(default=None, max_length=500)

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip().upper()


class SupplierRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    contact_person: str | None
    phone: str | None
    email: str | None
    address: str | None
    is_active: bool
    created_at: datetime


class PurchaseOrderItemCreate(BaseModel):
    barcode: str = Field(min_length=1, max_length=40)
    quantity: int = Field(ge=1, le=100_000)
    unit_cost: int | None = Field(default=None, ge=0, le=9_999_999_999_999)


class PurchaseOrderCreate(BaseModel):
    supplier_id: str = Field(min_length=36, max_length=36)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    expected_date: date | None = None
    notes: str | None = Field(default=None, max_length=500)
    items: list[PurchaseOrderItemCreate] = Field(min_length=1, max_length=200)


class PurchaseOrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    barcode: str
    product_name: str
    quantity_ordered: int
    quantity_received: int
    unit_cost: int
    subtotal: int


class PurchaseOrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    po_number: str
    status: str
    expected_date: date | None
    subtotal: int
    notes: str | None
    ordered_at: datetime | None
    received_at: datetime | None
    created_at: datetime
    supplier: SupplierRead
    items: list[PurchaseOrderItemRead]


class ReceiveLine(BaseModel):
    item_id: str = Field(min_length=36, max_length=36)
    quantity: int = Field(ge=1, le=100_000)


class ReceivePurchaseOrder(BaseModel):
    items: list[ReceiveLine] = Field(default_factory=list, max_length=200)


class StockAdjustmentCreate(BaseModel):
    product_id: str = Field(min_length=36, max_length=36)
    quantity_change: int = Field(ge=-100_000, le=100_000)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    note: str = Field(min_length=3, max_length=255)

    @field_validator("quantity_change")
    @classmethod
    def quantity_must_not_be_zero(cls, value: int) -> int:
        if value == 0:
            raise ValueError("Perubahan stok tidak boleh nol")
        return value


class StockItemRead(BaseModel):
    id: str
    barcode: str
    name: str
    category: str
    location: str
    price: int
    cost_price: int
    stock: int
    reorder_level: int
    stock_status: str


class StockMovementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    movement_type: str
    quantity_change: int
    balance_after: int
    unit_cost: int | None
    reference_type: str | None
    reference_id: str | None
    note: str | None
    created_at: datetime


class AdminDashboardRead(BaseModel):
    product_count: int
    stock_units: int
    low_stock_count: int
    active_supplier_count: int
    open_purchase_order_count: int
    purchase_spend_this_month: int
    inventory_value: int
    low_stock_products: list[StockItemRead]
    recent_purchase_orders: list[PurchaseOrderRead]


class AdminSaleRead(BaseModel):
    id: str
    transaction_no: str
    status: str
    total: int
    discount: int
    item_count: int
    created_at: datetime
    cashier_name: str
    member_name: str | None
    payment_method: str | None


class ReportDailySale(BaseModel):
    date: date
    total_sales: int
    transaction_count: int


class ReportBreakdown(BaseModel):
    label: str
    amount: int
    count: int


class ReportTopProduct(BaseModel):
    barcode: str
    name: str
    quantity: int
    revenue: int


class AdminSalesReportRead(BaseModel):
    date_from: date
    date_to: date
    total_sales: int
    transaction_count: int
    item_count: int
    average_transaction: int
    total_discount: int
    estimated_gross_profit: int
    daily_sales: list[ReportDailySale]
    payment_methods: list[ReportBreakdown]
    category_sales: list[ReportBreakdown]
    top_products: list[ReportTopProduct]
    recent_sales: list[AdminSaleRead]
