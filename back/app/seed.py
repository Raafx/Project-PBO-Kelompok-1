from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.indonesia_catalog import sync_indonesian_catalog
from app.models import (
    AccessRole,
    BusinessSetting,
    Cashier,
    Member,
    Store,
    Supplier,
    Voucher,
)
from app.services.access import ensure_default_roles
from app.services.operations import hash_secret

SUPPLIERS = [
    ("SUP-001", "PT Nusantara Pangan", "Rina Kusuma", "0812-4400-1001", "order@nusantarapangan.id"),
    ("SUP-002", "CV Sumber Minuman", "Dimas Putra", "0812-4400-1002", "sales@sumberminuman.id"),
    ("SUP-003", "PT Mitra Retail Sejahtera", "Nadia Rahman", "0812-4400-1003", "po@mitraretail.id"),
]


def _upsert_access_account(
    session: Session,
    *,
    employee_code: str,
    full_name: str,
    email: str,
    role_code: str,
    roles: dict[str, AccessRole],
    totp_required: bool,
) -> Cashier:
    """Create or normalize a stable login account without duplicating existing staff."""

    account = session.scalar(select(Cashier).where(Cashier.email == email))
    if account is None:
        account = session.scalar(
            select(Cashier).where(Cashier.employee_code == employee_code)
        )
    if account is None:
        account = Cashier(employee_code=employee_code, full_name=full_name)
        session.add(account)

    role = roles[role_code]
    account.employee_code = employee_code
    account.full_name = full_name
    account.email = email
    account.password_hash = hash_secret("password")
    account.pin_hash = account.pin_hash or hash_secret("123456")
    account.role = role_code.casefold()
    account.role_id = role.id
    account.totp_required = totp_required
    account.is_active = True
    if not totp_required:
        account.totp_secret = None
        account.totp_enabled = False
        account.totp_enrolled_at = None
        account.totp_last_counter = None
    return account


def seed_database(session: Session) -> None:
    roles = ensure_default_roles(session)
    store = session.scalar(select(Store).where(Store.code == "MY-001"))
    if store is None:
        session.add(
            Store(
                code="MY-001",
                name="MYMARKET Samarinda Central",
                address="Samarinda, Kalimantan Timur",
                logo_url="/logo-app.png",
            )
        )
    else:
        store.address = store.address or "Samarinda, Kalimantan Timur"
        store.logo_url = "/logo-app.png"

    cashier = session.scalar(select(Cashier).where(Cashier.employee_code == "KASIR03"))
    if cashier is None:
        session.add(
            Cashier(
                employee_code="KASIR03",
                full_name="Athasyahri",
                email="athasyahri@mymarket.local",
                password_hash=hash_secret("admin12345"),
                pin_hash=hash_secret("123456"),
                role="owner",
                role_id=roles["OWNER"].id,
            )
        )
    elif cashier.role_id is None:
        cashier.role = "owner"
        cashier.role_id = roles["OWNER"].id
    if cashier is not None:
        cashier.email = cashier.email or "athasyahri@mymarket.local"
        cashier.password_hash = cashier.password_hash or hash_secret("admin12345")
        cashier.pin_hash = cashier.pin_hash or hash_secret("123456")

    _upsert_access_account(
        session,
        employee_code="KASIR",
        full_name="Kasir MYMARKET",
        email="kasir@gmail.com",
        role_code="CASHIER",
        roles=roles,
        totp_required=False,
    )
    _upsert_access_account(
        session,
        employee_code="ADMIN",
        full_name="Administrator",
        email="admin@gmail.com",
        role_code="OWNER",
        roles=roles,
        totp_required=True,
    )
    _upsert_access_account(
        session,
        employee_code="GUDANG",
        full_name="Staf Gudang MYMARKET",
        email="gudang@gmail.com",
        role_code="WAREHOUSE",
        roles=roles,
        totp_required=True,
    )
    _upsert_access_account(
        session,
        employee_code="SUPERADMIN",
        full_name="Super Administrator",
        email="superadmin@gmail.com",
        role_code="OWNER",
        roles=roles,
        totp_required=False,
    )

    member = session.scalar(select(Member).where(Member.phone == "081255449011"))
    if member is None:
        session.add(
            Member(phone="081255449011", full_name="Budi Santoso", tier="SILVER", points=1_250)
        )

    voucher = session.scalar(select(Voucher).where(Voucher.code == "MYMARKET10"))
    if voucher is None:
        session.add(
            Voucher(
                code="MYMARKET10",
                description="Voucher pembayaran demo MYMARKET",
                value=10_000,
                min_purchase=50_000,
            )
        )

    for code, name, contact_person, phone, email in SUPPLIERS:
        supplier = session.scalar(select(Supplier).where(Supplier.code == code))
        if supplier is None:
            session.add(
                Supplier(
                    code=code,
                    name=name,
                    contact_person=contact_person,
                    phone=phone,
                    email=email,
                    is_active=True,
                )
            )

    sync_indonesian_catalog(session)

    default_settings = {
        "payment.methods": ("payment", "Metode pembayaran", "cash,qris,edc"),
        "tax.rate": ("tax", "PPN (%)", "0"),
        "tax.included": ("tax", "Harga termasuk pajak", "true"),
        "receipt.paper": ("receipt", "Ukuran kertas", "80"),
        "receipt.footer": ("receipt", "Footer struk", "Terima kasih sudah belanja di MYMARKET"),
        "branch.primary": ("branch", "Cabang utama", "MY-001"),
    }
    for key, (group_name, label, value) in default_settings.items():
        setting = session.get(BusinessSetting, key)
        if setting is None:
            session.add(
                BusinessSetting(
                    key=key,
                    group_name=group_name,
                    label=label,
                    value=value,
                )
            )
        elif key == "payment.methods":
            setting.value = value
    session.commit()


def main() -> None:
    with SessionLocal() as session:
        seed_database(session)
    print("Seed MYMARKET selesai.")


if __name__ == "__main__":
    main()
