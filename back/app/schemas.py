from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PaymentMethod(StrEnum):
    cash = "cash"
    qris = "qris"
    edc = "edc"
    debit = "debit"
    credit = "credit"
    wallet = "wallet"
    voucher = "voucher"


class StockArea(StrEnum):
    warehouse = "warehouse"
    sales = "sales"


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    barcode: str
    sku: str | None
    name: str
    category: str
    brand: str | None
    unit: str
    unit_conversion: int
    location: str
    image_url: str | None
    price: int
    cost_price: int
    stock: int
    warehouse_stock: int
    reorder_level: int
    is_active: bool


class ProductCreate(BaseModel):
    barcode: str = Field(min_length=3, max_length=40)
    sku: str | None = Field(default=None, max_length=40)
    name: str = Field(min_length=2, max_length=180)
    category: str = Field(min_length=2, max_length=80)
    brand: str | None = Field(default=None, max_length=80)
    unit: str = Field(default="pcs", min_length=1, max_length=30)
    unit_conversion: int = Field(default=1, ge=1, le=1_000_000)
    location: str = Field(min_length=2, max_length=80)
    image_url: str | None = Field(default=None, max_length=255)
    price: int = Field(ge=0, le=9_999_999_999_999)
    cost_price: int = Field(ge=0, le=9_999_999_999_999)
    reorder_level: int = Field(default=10, ge=0, le=1_000_000)
    is_active: bool = True

    @field_validator("barcode", "name", "category", "location")
    @classmethod
    def strip_required_product_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Data produk tidak boleh kosong")
        return cleaned

    @field_validator("sku", "image_url", "brand")
    @classmethod
    def strip_optional_product_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class ProductUpdate(BaseModel):
    barcode: str | None = Field(default=None, min_length=3, max_length=40)
    sku: str | None = Field(default=None, max_length=40)
    name: str | None = Field(default=None, min_length=2, max_length=180)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    brand: str | None = Field(default=None, max_length=80)
    unit: str | None = Field(default=None, min_length=1, max_length=30)
    unit_conversion: int | None = Field(default=None, ge=1, le=1_000_000)
    location: str | None = Field(default=None, min_length=2, max_length=80)
    image_url: str | None = Field(default=None, max_length=255)
    price: int | None = Field(default=None, ge=0, le=9_999_999_999_999)
    cost_price: int | None = Field(default=None, ge=0, le=9_999_999_999_999)
    reorder_level: int | None = Field(default=None, ge=0, le=1_000_000)
    is_active: bool | None = None

    @field_validator("barcode", "name", "category", "location")
    @classmethod
    def strip_product_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Data produk tidak boleh kosong")
        return cleaned

    @field_validator("sku", "image_url", "brand")
    @classmethod
    def strip_optional_update_text(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


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
    card_type: str | None = Field(default=None, pattern="^(debit|credit)$")
    card_number: str | None = Field(default=None, min_length=12, max_length=23)
    voucher_code: str | None = Field(default=None, max_length=40)
    confirmed: bool = False


class SaleBaseCreate(BaseModel):
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    cashier_code: str = Field(min_length=1, max_length=30)
    member_phone: str | None = Field(default=None, max_length=24)
    items: list[SaleLineCreate] = Field(min_length=1, max_length=200)


class CheckoutCreate(SaleBaseCreate):
    payment: PaymentCreate


class HoldCreate(SaleBaseCreate):
    notes: str | None = Field(default=None, max_length=500)


class SaleItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: str
    barcode: str
    product_name: str
    unit_price: int
    unit_cost: int
    quantity: int
    discount: int
    subtotal: int
    gross_profit: int


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    method: str
    amount: int
    received_amount: int | None
    change_amount: int | None
    approval_code: str | None
    card_type: str | None
    card_last4: str | None
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


class LiveTransactionStatus(StrEnum):
    ready = "ready"
    shopping = "shopping"
    payment = "payment"
    processing = "processing"
    completed = "completed"
    held = "held"
    cancelled = "cancelled"


class LiveTransactionHeartbeat(BaseModel):
    session_id: str = Field(min_length=36, max_length=36)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    cashier_code: str = Field(min_length=1, max_length=30)
    status: LiveTransactionStatus
    items: list[SaleLineCreate] = Field(default_factory=list, max_length=200)
    payment_method: PaymentMethod | None = None
    payment_ready: bool = False
    member_phone: str | None = Field(default=None, max_length=24)
    current_action: str = Field(default="Siap melayani", min_length=1, max_length=120)
    transaction_no: str | None = Field(default=None, max_length=40)

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if len(cleaned.split("-")) != 5:
            raise ValueError("Session ID tidak valid")
        return cleaned

    @field_validator("store_code", "cashier_code", "current_action")
    @classmethod
    def strip_live_text(cls, value: str) -> str:
        return value.strip()


class LiveCartItemRead(BaseModel):
    barcode: str
    name: str
    quantity: int
    unit_price: int
    subtotal: int
    image_url: str | None


class LiveTransactionRead(BaseModel):
    id: str
    store_code: str
    store_name: str
    cashier_code: str
    cashier_name: str
    status: str
    progress: int
    item_count: int
    unique_products: int
    subtotal: int
    total: int
    payment_method: str | None
    payment_ready: bool
    member_name: str | None
    current_action: str
    transaction_no: str | None
    started_at: datetime | None
    completed_at: datetime | None
    last_seen_at: datetime
    online: bool
    service_ready: bool
    items: list[LiveCartItemRead]


class LiveWorkflowSnapshot(BaseModel):
    generated_at: datetime
    sessions: list[LiveTransactionRead]


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


class DirectPurchaseCreate(BaseModel):
    supplier_id: str = Field(min_length=36, max_length=36)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    purchase_date: date | None = None
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
    created_by_id: str | None
    status: str
    expected_date: date | None
    subtotal: int
    notes: str | None
    ordered_at: datetime | None
    received_at: datetime | None
    created_at: datetime
    supplier: SupplierRead
    items: list[PurchaseOrderItemRead]


class StockAdjustmentCreate(BaseModel):
    product_id: str = Field(min_length=36, max_length=36)
    quantity_change: int = Field(ge=-100_000, le=100_000)
    area: StockArea = StockArea.sales
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
    sales_stock: int
    warehouse_stock: int
    total_stock: int
    reorder_level: int
    stock_status: str


class StockMovementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    movement_type: str
    stock_area: str
    quantity_change: int
    balance_after: int
    unit_cost: int | None
    reference_type: str | None
    reference_id: str | None
    created_by_id: str | None
    note: str | None
    created_at: datetime


class StockTransferCreate(BaseModel):
    product_id: str = Field(min_length=36, max_length=36)
    quantity: int = Field(ge=1, le=100_000)
    from_area: StockArea = StockArea.warehouse
    to_area: StockArea = StockArea.sales
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    note: str | None = Field(default=None, max_length=255)


class StockTransferRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transfer_no: str
    product_id: str
    quantity: int
    from_area: str
    to_area: str
    note: str | None
    created_by_id: str | None
    created_at: datetime


class AdminDashboardRead(BaseModel):
    product_count: int
    stock_units: int
    warehouse_stock_units: int
    sales_stock_units: int
    low_stock_count: int
    active_supplier_count: int
    open_purchase_order_count: int
    purchase_spend_this_month: int
    inventory_value: int
    low_stock_products: list[StockItemRead]
    recent_purchase_orders: list[PurchaseOrderRead]


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    is_system: bool
    permissions: list[str]


class RolePermissionsUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    permissions: list[str] = Field(max_length=20)


class StaffRead(BaseModel):
    id: str
    employee_code: str
    full_name: str
    is_active: bool
    role_id: str | None
    role_code: str | None
    role_name: str | None


class StaffRoleUpdate(BaseModel):
    role_id: str = Field(min_length=36, max_length=36)


class AccessProfileRead(BaseModel):
    employee_code: str
    full_name: str
    role_code: str
    role_name: str
    permissions: list[str]


class AdminSaleRead(BaseModel):
    id: str
    transaction_no: str
    status: str
    total: int
    discount: int
    item_count: int
    gross_profit: int
    created_at: datetime
    cashier_name: str
    member_name: str | None
    payment_method: str | None
    items: list[SaleItemRead]


class ReportDailySale(BaseModel):
    date: date
    total_sales: int
    transaction_count: int
    gross_profit: int
    expenses: int
    net_profit: int


class ReportMonthlySale(BaseModel):
    month: str
    total_sales: int
    transaction_count: int
    gross_profit: int
    expenses: int
    net_profit: int


class ReportBreakdown(BaseModel):
    label: str
    amount: int
    count: int


class ReportTopProduct(BaseModel):
    barcode: str
    name: str
    quantity: int
    revenue: int
    transaction_count: int
    gross_profit: int
    margin_percentage: float


class ReportProductPerformance(BaseModel):
    product_id: str
    barcode: str
    name: str
    category: str
    image_url: str | None
    transaction_count: int
    quantity: int
    gross_revenue: int
    discount: int
    net_revenue: int
    cost_of_goods: int
    gross_profit: int
    margin_percentage: float
    average_unit_price: int


class ReportProductOption(BaseModel):
    id: str
    barcode: str
    name: str
    category: str


class ReportProductDaily(BaseModel):
    date: date
    transaction_count: int
    quantity: int
    net_revenue: int
    cost_of_goods: int
    gross_profit: int


class ReportProductMonthly(BaseModel):
    month: date
    transaction_count: int
    quantity: int
    gross_revenue: int
    discount: int
    net_revenue: int
    cost_of_goods: int
    gross_profit: int
    margin_percentage: float
    average_unit_price: int


class ReportProductAnalysisRead(BaseModel):
    date_from: date
    date_to: date
    product: ReportProductPerformance
    daily_sales: list[ReportProductDaily]
    monthly_comparison: list[ReportProductMonthly]


class AdminSalesReportRead(BaseModel):
    date_from: date
    date_to: date
    total_sales: int
    transaction_count: int
    item_count: int
    average_transaction: int
    total_discount: int
    estimated_gross_profit: int
    cost_of_goods: int
    expenses: int
    net_profit: int
    daily_sales: list[ReportDailySale]
    monthly_sales: list[ReportMonthlySale]
    payment_methods: list[ReportBreakdown]
    category_sales: list[ReportBreakdown]
    top_products: list[ReportTopProduct]
    product_performance: list[ReportProductPerformance]
    recent_sales: list[AdminSaleRead]
    transactions: list[AdminSaleRead]


class CeoChatStatusRead(BaseModel):
    configured: bool
    model: str
    project_name: str
    project_number: str
    context_source: str


class CeoChatMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    content: str
    created_at: datetime


class CeoChatConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    updated_at: datetime
    messages: list[CeoChatMessageRead]


class CeoChatConversationSummaryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    updated_at: datetime


class CeoChatCreate(BaseModel):
    title: str = Field(default="Percakapan baru", min_length=1, max_length=160)


class CeoChatPrompt(BaseModel):
    message: str = Field(min_length=1, max_length=2_000)

    @field_validator("message")
    @classmethod
    def clean_message(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Pesan tidak boleh kosong")
        return cleaned
