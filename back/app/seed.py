from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.ekomart_catalog import sync_ekomart_catalog
from app.models import (
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

    admin = session.scalar(select(Cashier).where(Cashier.employee_code == "ADMIN"))
    if admin is None:
        admin = session.scalar(select(Cashier).where(Cashier.email == "admin@gmail.com"))
    if admin is None:
        session.add(
            Cashier(
                employee_code="ADMIN",
                full_name="Administrator",
                email="admin@gmail.com",
                password_hash=hash_secret("password"),
                pin_hash=hash_secret("123456"),
                role="owner",
                role_id=roles["OWNER"].id,
                totp_required=True,
                is_active=True,
            )
        )
    else:
        admin.full_name = admin.full_name or "Administrator"
        admin.email = "admin@gmail.com"
        admin.password_hash = admin.password_hash or hash_secret("password")
        admin.pin_hash = admin.pin_hash or hash_secret("123456")
        admin.role = "owner"
        admin.role_id = roles["OWNER"].id
        admin.totp_required = True
        admin.is_active = True

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

    sync_ekomart_catalog(session)

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
