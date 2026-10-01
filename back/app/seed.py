from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Cashier, Member, Product, Store, Supplier, Voucher

PRODUCTS = [
    ("8998866200224", "Indomie Goreng Original 85g", "Mi Instan", "Rak A-02", 3_500, 2_800, 64, 24),
    (
        "8886008101053",
        "Aqua Air Mineral 600 ml",
        "Minuman Ringan",
        "Chiller 01",
        4_000,
        3_000,
        48,
        20,
    ),
    (
        "8992753211118",
        "Ultra Milk UHT Full Cream 1000 ml",
        "Susu & Olahan",
        "Rak C-04",
        21_500,
        18_000,
        18,
        8,
    ),
    (
        "8991001101121",
        "SilverQueen Cokelat Almond 58g",
        "Cokelat & Snack",
        "Front Desk",
        18_900,
        15_000,
        12,
        6,
    ),
    (
        "8999999052028",
        "Sunlight Pencuci Piring Jeruk Nipis 755 ml",
        "Home Care",
        "Rak D-01",
        17_500,
        14_200,
        15,
        8,
    ),
    (
        "8993175112034",
        "Beras Premium Rojolele Super 5 Kg",
        "Sembako",
        "Pallet P-01",
        78_000,
        69_000,
        6,
        8,
    ),
    (
        "8991002101656",
        "Kopi Kapal Api Special Mix 10 sachet",
        "Kopi & Teh",
        "Rak B-03",
        16_800,
        13_500,
        9,
        10,
    ),
    ("8997008340512", "Gulaku Premium 1 Kg", "Sembako", "Rak A-06", 18_400, 15_500, 20, 10),
    (
        "8993053710505",
        "Paseo Smart Facial Tissue 250 sheets",
        "Personal Care",
        "Rak D-04",
        23_900,
        19_500,
        7,
        10,
    ),
]

SUPPLIERS = [
    ("SUP-001", "PT Nusantara Pangan", "Rina Kusuma", "0812-4400-1001", "order@nusantarapangan.id"),
    ("SUP-002", "CV Sumber Minuman", "Dimas Putra", "0812-4400-1002", "sales@sumberminuman.id"),
    ("SUP-003", "PT Mitra Retail Sejahtera", "Nadia Rahman", "0812-4400-1003", "po@mitraretail.id"),
]


def seed_database(session: Session) -> None:
    store = session.scalar(select(Store).where(Store.code == "MY-001"))
    if store is None:
        session.add(Store(code="MY-001", name="MYMARKET Samarinda Central"))

    cashier = session.scalar(select(Cashier).where(Cashier.employee_code == "KASIR03"))
    if cashier is None:
        session.add(Cashier(employee_code="KASIR03", full_name="Athasyahri"))

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

    for barcode, name, category, location, price, cost_price, stock, reorder_level in PRODUCTS:
        product = session.scalar(select(Product).where(Product.barcode == barcode))
        if product is None:
            session.add(
                Product(
                    barcode=barcode,
                    name=name,
                    category=category,
                    location=location,
                    price=price,
                    cost_price=cost_price,
                    stock=stock,
                    reorder_level=reorder_level,
                )
            )
        else:
            product.name = name
            product.category = category
            product.location = location
            product.price = price
            product.cost_price = cost_price
            product.reorder_level = reorder_level
            product.is_active = True
    session.commit()


def main() -> None:
    with SessionLocal() as session:
        seed_database(session)
    print("Seed MYMARKET selesai.")


if __name__ == "__main__":
    main()
