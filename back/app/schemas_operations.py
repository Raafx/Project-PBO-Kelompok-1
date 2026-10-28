from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas import PaymentMethod, PurchaseOrderItemCreate, StockArea


class ShiftOpenCreate(BaseModel):
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    cashier_code: str = Field(min_length=1, max_length=30)
    opening_cash: int = Field(ge=0, le=9_999_999_999_999)


class ShiftCloseCreate(BaseModel):
    cashier_code: str = Field(min_length=1, max_length=30)
    closing_cash: int = Field(ge=0, le=9_999_999_999_999)


class CashMovementType(StrEnum):
    cash_in = "cash_in"
    cash_out = "cash_out"


class CashMovementCreate(BaseModel):
    cashier_code: str = Field(min_length=1, max_length=30)
    movement_type: CashMovementType
    category: str = Field(min_length=2, max_length=80)
    amount: int = Field(gt=0, le=9_999_999_999_999)
    note: str | None = Field(default=None, max_length=255)


class CashMovementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    movement_type: str
    category: str
    amount: int
    note: str | None
    created_at: datetime


class ShiftRead(BaseModel):
    id: str
    store_code: str
    cashier_code: str
    cashier_name: str
    opened_at: datetime
    closed_at: datetime | None
    opening_cash: int
    cash_sales: int
    cash_in: int
    cash_out: int
    expected_cash: int
    closing_cash: int | None
    difference: int | None
    status: str
    movements: list[CashMovementRead]


class VoidSaleCreate(BaseModel):
    supervisor_code: str = Field(min_length=1, max_length=30)
    supervisor_pin: str = Field(min_length=4, max_length=12)
    reason: str = Field(min_length=4, max_length=255)


class CatalogKind(StrEnum):
    category = "category"
    unit = "unit"
    brand = "brand"


class CatalogOptionCreate(BaseModel):
    kind: CatalogKind
    code: str = Field(min_length=1, max_length=40)
    name: str = Field(min_length=1, max_length=100)
    conversion_factor: int = Field(default=1, ge=1, le=1_000_000)
    is_active: bool = True

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip().upper().replace(" ", "-")


class CatalogOptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    code: str
    name: str
    conversion_factor: int
    is_active: bool


class PromotionType(StrEnum):
    percent = "percent"
    fixed = "fixed"
    buy_x_get_y = "buy_x_get_y"
    wholesale = "wholesale"


class PromotionCreate(BaseModel):
    code: str = Field(min_length=2, max_length=40)
    name: str = Field(min_length=2, max_length=140)
    promotion_type: PromotionType
    product_id: str | None = Field(default=None, min_length=36, max_length=36)
    value: int = Field(default=0, ge=0, le=9_999_999_999_999)
    min_quantity: int = Field(default=1, ge=1, le=999)
    buy_quantity: int | None = Field(default=None, ge=1, le=999)
    free_quantity: int | None = Field(default=None, ge=1, le=999)
    starts_at: datetime
    ends_at: datetime
    is_active: bool = True

    @model_validator(mode="after")
    def validate_period_and_type(self):
        if self.ends_at <= self.starts_at:
            raise ValueError("Waktu promo berakhir harus setelah waktu mulai")
        if self.promotion_type == PromotionType.buy_x_get_y and (
            not self.buy_quantity or not self.free_quantity
        ):
            raise ValueError("Promo beli X gratis Y membutuhkan jumlah beli dan gratis")
        if self.promotion_type == PromotionType.percent and self.value > 100:
            raise ValueError("Diskon persen maksimal 100")
        return self


class PromotionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    promotion_type: str
    product_id: str | None
    value: int
    min_quantity: int
    buy_quantity: int | None
    free_quantity: int | None
    starts_at: datetime
    ends_at: datetime
    is_active: bool


class ProductBatchCreate(BaseModel):
    product_id: str = Field(min_length=36, max_length=36)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    batch_no: str = Field(min_length=1, max_length=60)
    expiry_date: date
    quantity: int = Field(ge=0, le=1_000_000)


class ProductBatchRead(BaseModel):
    id: str
    product_id: str
    product_name: str
    barcode: str
    batch_no: str
    expiry_date: date
    quantity: int
    days_until_expiry: int
    status: str


class StockCountCreate(BaseModel):
    product_id: str = Field(min_length=36, max_length=36)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    stock_area: StockArea
    physical_quantity: int = Field(ge=0, le=1_000_000)
    note: str | None = Field(default=None, max_length=255)


class StockCountRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    stock_area: str
    system_quantity: int
    physical_quantity: int
    difference: int
    note: str | None
    counted_by_id: str
    created_at: datetime


class MemberCreate(BaseModel):
    phone: str = Field(min_length=8, max_length=24)
    full_name: str = Field(min_length=2, max_length=120)
    tier: str = Field(default="REGULAR", min_length=2, max_length=30)
    points: int = Field(default=0, ge=0, le=9_999_999_999)

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str) -> str:
        normalized = "".join(character for character in value if character.isdigit())
        if len(normalized) < 8:
            raise ValueError("Nomor telepon tidak valid")
        return normalized


class MemberUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    tier: str | None = Field(default=None, min_length=2, max_length=30)
    points: int | None = Field(default=None, ge=0, le=9_999_999_999)
    is_active: bool | None = None


class MemberAdminRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone: str
    full_name: str
    tier: str
    points: int
    is_active: bool
    created_at: datetime


class FinanceEntryType(StrEnum):
    expense = "expense"
    deposit = "deposit"
    reconciliation = "reconciliation"
    receivable = "receivable"
    payable = "payable"
    purchase_return = "purchase_return"


class FinanceEntryCreate(BaseModel):
    entry_type: FinanceEntryType
    counterparty: str | None = Field(default=None, max_length=140)
    amount: int = Field(ge=0, le=9_999_999_999_999)
    status: str = Field(default="open", pattern=r"^(open|paid|settled|cancelled)$")
    due_date: date | None = None
    payment_method: PaymentMethod | None = None
    note: str | None = Field(default=None, max_length=500)


class FinanceEntryUpdate(BaseModel):
    status: str = Field(pattern=r"^(open|paid|settled|cancelled)$")


class FinanceEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entry_type: str
    reference_no: str
    counterparty: str | None
    amount: int
    status: str
    due_date: date | None
    payment_method: str | None
    note: str | None
    created_by_id: str
    created_at: datetime


class SettingUpdate(BaseModel):
    group_name: str = Field(min_length=2, max_length=40)
    label: str = Field(min_length=2, max_length=120)
    value: str = Field(max_length=4_000)


class SettingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    group_name: str
    label: str
    value: str


class StoreProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    address: str | None = Field(default=None, max_length=2_000)
    logo_url: str | None = Field(default=None, max_length=255)
    tax_id: str | None = Field(default=None, max_length=40)
    timezone: str = Field(default="Asia/Makassar", min_length=3, max_length=64)


class StoreCreate(StoreProfileUpdate):
    code: str = Field(min_length=2, max_length=20, pattern=r"^[A-Za-z0-9-]+$")


class AuditLogRead(BaseModel):
    id: str
    actor_name: str | None
    action: str
    entity_type: str
    entity_id: str | None
    details: dict[str, object]
    created_at: datetime


class PurchaseOrderDraftCreate(BaseModel):
    supplier_id: str = Field(min_length=36, max_length=36)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    expected_date: date | None = None
    notes: str | None = Field(default=None, max_length=500)
    items: list[PurchaseOrderItemCreate] = Field(min_length=1, max_length=200)


class AutoPurchaseOrderCreate(BaseModel):
    supplier_id: str = Field(min_length=36, max_length=36)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)


class PurchaseReceiveLine(BaseModel):
    item_id: str = Field(min_length=36, max_length=36)
    quantity_received: int = Field(gt=0, le=100_000)
    batch_no: str | None = Field(default=None, max_length=60)
    expiry_date: date | None = None


class PurchaseReceiveCreate(BaseModel):
    items: list[PurchaseReceiveLine] = Field(min_length=1, max_length=200)


class PurchaseReturnCreate(BaseModel):
    product_id: str = Field(min_length=36, max_length=36)
    supplier_id: str = Field(min_length=36, max_length=36)
    store_code: str = Field(default="MY-001", min_length=1, max_length=20)
    quantity: int = Field(gt=0, le=100_000)
    note: str = Field(min_length=3, max_length=255)


class LoginCreate(BaseModel):
    identity: str = Field(min_length=2, max_length=160)
    password: str = Field(min_length=6, max_length=128)


class LoginStatus(StrEnum):
    authenticated = "authenticated"
    totp_setup_required = "totp_setup_required"
    totp_required = "totp_required"


class LoginRead(BaseModel):
    status: LoginStatus
    access_token: str | None = None
    challenge_token: str | None = None
    provisioning_uri: str | None = None
    totp_secret: str | None = None
    expires_at: datetime | None = None
    employee_code: str
    full_name: str
    role_name: str
    permissions: list[str]


class TotpVerifyCreate(BaseModel):
    challenge_token: str = Field(min_length=20, max_length=200)
    code: str = Field(pattern=r"^\d{6}$")


class TotpDeviceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    current_code: str | None = Field(default=None, pattern=r"^\d{6}$")

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if len(normalized) < 2:
            raise ValueError("Nama perangkat minimal 2 karakter")
        return normalized


class TotpDeviceConfirm(BaseModel):
    code: str = Field(pattern=r"^\d{6}$")


class TotpDeviceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    is_active: bool
    created_at: datetime
    enrolled_at: datetime | None = None
    last_used_at: datetime | None = None


class TotpDeviceSetupRead(TotpDeviceRead):
    provisioning_uri: str
    totp_secret: str


class ForgotPasswordCreate(BaseModel):
    email: str = Field(min_length=5, max_length=160, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ForgotPasswordRead(BaseModel):
    message: str
    reset_token: str | None = None


class ResetPasswordCreate(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    new_password: str = Field(min_length=8, max_length=128)


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=160, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ChangePinCreate(BaseModel):
    current_pin: str = Field(min_length=4, max_length=12)
    new_pin: str = Field(min_length=4, max_length=12, pattern=r"^\d+$")


class StaffCreate(BaseModel):
    employee_code: str = Field(min_length=2, max_length=30)
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=160, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, max_length=128)
    pin: str = Field(min_length=4, max_length=12, pattern=r"^\d+$")
    role_id: str = Field(min_length=36, max_length=36)
