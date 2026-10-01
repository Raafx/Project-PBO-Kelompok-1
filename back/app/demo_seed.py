from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from math import ceil
from random import Random

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import (
    Cashier,
    Member,
    Payment,
    Product,
    PurchaseOrder,
    PurchaseOrderItem,
    Sale,
    SaleItem,
    StockMovement,
    Store,
    Supplier,
    new_id,
)
from app.seed import seed_database

DEMO_RANDOM_SEED = 20_261_001
DEMO_NOTE = "Data demo historis MYMARKET"
LOCAL_TIMEZONE = timezone(timedelta(hours=8), name="Asia/Makassar")

DEMO_CASHIERS = [
    ("KASIR01", "Siti Rahmawati"),
    ("KASIR02", "Andi Pratama"),
    ("KASIR04", "Nurul Hidayah"),
]

DEMO_MEMBERS = [
    ("081255449012", "Dewi Lestari", "GOLD", 8_420),
    ("081255449013", "Muhammad Rizky", "SILVER", 2_780),
    ("081255449014", "Citra Maharani", "REGULAR", 780),
    ("081255449015", "Ahmad Fauzan", "SILVER", 3_120),
    ("081255449016", "Putri Ananda", "GOLD", 9_850),
    ("081255449017", "Bambang Irawan", "REGULAR", 430),
    ("081255449018", "Nabila Putri", "SILVER", 2_240),
    ("081255449019", "Hendra Gunawan", "REGULAR", 960),
    ("081255449020", "Rina Oktaviani", "GOLD", 7_640),
    ("081255449021", "Agus Setiawan", "SILVER", 4_110),
    ("081255449022", "Maya Sari", "REGULAR", 1_040),
    ("081255449023", "Fajar Nugroho", "SILVER", 2_990),
    ("081255449024", "Lina Marlina", "GOLD", 11_250),
    ("081255449025", "Rudi Hartono", "REGULAR", 670),
    ("081255449026", "Salsabila Aulia", "SILVER", 3_760),
    ("081255449027", "Yusuf Maulana", "REGULAR", 520),
    ("081255449028", "Intan Permata", "GOLD", 8_930),
    ("081255449029", "Dedi Kurniawan", "SILVER", 2_610),
    ("081255449030", "Rahma Wati", "REGULAR", 1_180),
    ("081255449031", "Arif Hidayat", "SILVER", 4_430),
]

DEMO_SUPPLIERS = [
    (
        "SUP-004",
        "PT Bersih Sehat Indonesia",
        "Ratih Anggraini",
        "0812-4400-1004",
        "distribusi@bersihsehat.id",
        "Jl. P. Antasari No. 88, Samarinda",
    ),
    (
        "SUP-005",
        "UD Sembako Makmur",
        "Heri Susanto",
        "0812-4400-1005",
        "order@sembakomakmur.id",
        "Jl. Lambung Mangkurat No. 31, Samarinda",
    ),
    (
        "SUP-006",
        "PT Camilan Nusantara",
        "Kevin Wijaya",
        "0812-4400-1006",
        "sales@camilannusantara.id",
        "Jl. DI Panjaitan No. 120, Samarinda",
    ),
]

DEMO_PRODUCTS = [
    (
        "8996001600260",
        "Teh Pucuk Harum 350 ml",
        "Minuman Ringan",
        "Chiller 02",
        5_000,
        3_800,
        52,
        18,
    ),
    ("8992752123009", "Le Minerale 600 ml", "Minuman Ringan", "Chiller 01", 4_000, 2_900, 56, 20),
    (
        "8999999192250",
        "Coca-Cola Original 390 ml",
        "Minuman Ringan",
        "Chiller 02",
        7_500,
        5_900,
        34,
        14,
    ),
    (
        "8991001780883",
        "Good Day Cappuccino 5 sachet",
        "Kopi & Teh",
        "Rak B-03",
        11_500,
        8_700,
        22,
        10,
    ),
    (
        "089686010399",
        "Chitato Sapi Panggang 68g",
        "Cokelat & Snack",
        "Rak B-01",
        12_500,
        9_800,
        28,
        12,
    ),
    ("8996001302027", "Roma Kelapa 300g", "Cokelat & Snack", "Rak B-02", 10_900, 8_400, 31, 12),
    ("8998866200415", "Indomie Soto Mie 70g", "Mi Instan", "Rak A-02", 3_500, 2_750, 58, 24),
    ("8997004300077", "Mie Sedaap Goreng 90g", "Mi Instan", "Rak A-03", 3_500, 2_700, 47, 20),
    ("8992628020020", "Bimoli Minyak Goreng 2 L", "Sembako", "Rak A-05", 39_500, 35_500, 14, 8),
    ("8993296101232", "Tepung Segitiga Biru 1 Kg", "Sembako", "Rak A-06", 14_000, 11_700, 24, 10),
    ("8999999501014", "Telur Ayam Negeri 10 Butir", "Sembako", "Chiller 03", 28_000, 24_500, 18, 8),
    ("8999999400010", "Rinso Molto Deterjen 770g", "Home Care", "Rak D-02", 24_500, 20_000, 17, 8),
    ("8999999400027", "Molto Pewangi Blue 820 ml", "Home Care", "Rak D-02", 19_900, 16_000, 19, 8),
    (
        "8999999400034",
        "Lifebuoy Sabun Cair 450 ml",
        "Personal Care",
        "Rak D-03",
        31_500,
        26_000,
        13,
        7,
    ),
    (
        "8999999400041",
        "Pepsodent Pencegah Gigi Berlubang 190g",
        "Personal Care",
        "Rak D-03",
        16_500,
        13_200,
        21,
        9,
    ),
    ("8999999400058", "Kecap Manis ABC 520 ml", "Bumbu & Saus", "Rak A-08", 22_500, 18_500, 16, 8),
    (
        "8999999400065",
        "Saus Sambal Indofood 335 ml",
        "Bumbu & Saus",
        "Rak A-08",
        13_900,
        10_900,
        20,
        8,
    ),
    (
        "8999999400072",
        "Bear Brand Susu Steril 189 ml",
        "Susu & Olahan",
        "Chiller 03",
        12_000,
        9_800,
        26,
        12,
    ),
]

SUPPLIER_ADDRESSES = {
    "SUP-001": "Jl. Soekarno Hatta KM 5, Samarinda",
    "SUP-002": "Jl. Cendana No. 42, Samarinda",
    "SUP-003": "Jl. Juanda No. 17, Samarinda",
}

SUPPLIER_BY_CATEGORY = {
    "Minuman Ringan": "SUP-002",
    "Susu & Olahan": "SUP-002",
    "Home Care": "SUP-004",
    "Personal Care": "SUP-004",
    "Sembako": "SUP-005",
    "Bumbu & Saus": "SUP-005",
    "Cokelat & Snack": "SUP-006",
}


@dataclass(frozen=True)
class StockEvent:
    occurred_at: datetime
    product_id: str
    quantity_change: int
    movement_type: str
    unit_cost: int
    reference_type: str
    reference_id: str
    note: str


def _month_starts(start_date: date, end_date: date) -> list[date]:
    cursor = start_date.replace(day=1)
    months: list[date] = []
    while cursor <= end_date:
        months.append(cursor)
        cursor = (cursor.replace(day=28) + timedelta(days=4)).replace(day=1)
    return months


def _weighted_products(rng: Random, products: list[Product], count: int) -> list[Product]:
    remaining = list(products)
    selected: list[Product] = []
    while remaining and len(selected) < count:
        weights = [
            3.0
            if product.category in {"Minuman Ringan", "Mi Instan", "Cokelat & Snack"}
            else 2.0
            if product.category in {"Sembako", "Kopi & Teh"}
            else 1.0
            for product in remaining
        ]
        chosen = rng.choices(remaining, weights=weights, k=1)[0]
        selected.append(chosen)
        remaining.remove(chosen)
    return selected


def _payment_for_sale(rng: Random, sale_id: str, total: int, paid_at: datetime) -> Payment:
    method = rng.choices(
        ["cash", "qris", "debit", "credit", "wallet", "voucher"],
        weights=[46, 28, 9, 4, 11, 2],
        k=1,
    )[0]
    received_amount = None
    change_amount = None
    approval_code = None
    voucher_code = None
    if method == "cash":
        if rng.random() < 0.42:
            received_amount = total
        else:
            denomination = rng.choice((10_000, 20_000, 50_000, 100_000))
            received_amount = ceil(total / denomination) * denomination
        change_amount = received_amount - total
    elif method in {"debit", "credit"}:
        approval_code = f"EDC{rng.randint(100_000, 999_999)}"
    elif method in {"qris", "wallet"}:
        approval_code = f"DIG{rng.randint(1_000_000, 9_999_999)}"
    else:
        voucher_code = "MYMARKET10"
    return Payment(
        id=new_id(),
        sale_id=sale_id,
        method=method,
        amount=total,
        received_amount=received_amount,
        change_amount=change_amount,
        approval_code=approval_code,
        voucher_code=voucher_code,
        status="paid",
        paid_at=paid_at,
    )


def _seed_master_data(
    session: Session, foundation_date: datetime
) -> tuple[Store, list[Cashier], list[Member], list[Product], dict[str, Supplier]]:
    store = session.scalar(select(Store).where(Store.code == "MY-001"))
    if store is None:
        raise RuntimeError("Store MY-001 tidak tersedia")
    store.created_at = foundation_date

    for employee_code, full_name in DEMO_CASHIERS:
        if session.scalar(select(Cashier).where(Cashier.employee_code == employee_code)) is None:
            session.add(
                Cashier(
                    employee_code=employee_code,
                    full_name=full_name,
                    role="cashier",
                    is_active=True,
                    created_at=foundation_date,
                    updated_at=foundation_date,
                )
            )

    for phone, full_name, tier, points in DEMO_MEMBERS:
        if session.scalar(select(Member).where(Member.phone == phone)) is None:
            session.add(
                Member(
                    phone=phone,
                    full_name=full_name,
                    tier=tier,
                    points=points,
                    is_active=True,
                    created_at=foundation_date,
                    updated_at=foundation_date,
                )
            )

    for code, name, contact, phone, email, address in DEMO_SUPPLIERS:
        if session.scalar(select(Supplier).where(Supplier.code == code)) is None:
            session.add(
                Supplier(
                    code=code,
                    name=name,
                    contact_person=contact,
                    phone=phone,
                    email=email,
                    address=address,
                    is_active=True,
                    created_at=foundation_date,
                    updated_at=foundation_date,
                )
            )

    for barcode, name, category, location, price, cost, stock, reorder in DEMO_PRODUCTS:
        if session.scalar(select(Product).where(Product.barcode == barcode)) is None:
            session.add(
                Product(
                    barcode=barcode,
                    sku=f"SKU-{barcode[-6:]}",
                    name=name,
                    category=category,
                    location=location,
                    price=price,
                    cost_price=cost,
                    stock=stock,
                    reorder_level=reorder,
                    is_active=True,
                    created_at=foundation_date,
                    updated_at=foundation_date,
                )
            )

    session.flush()
    suppliers = {item.code: item for item in session.scalars(select(Supplier)).all()}
    for code, address in SUPPLIER_ADDRESSES.items():
        if code in suppliers:
            suppliers[code].address = address
            suppliers[code].created_at = foundation_date
    cashiers = list(
        session.scalars(
            select(Cashier).where(Cashier.is_active.is_(True)).order_by(Cashier.employee_code)
        )
    )
    members = list(
        session.scalars(select(Member).where(Member.is_active.is_(True)).order_by(Member.phone))
    )
    products = list(
        session.scalars(
            select(Product).where(Product.is_active.is_(True)).order_by(Product.barcode)
        )
    )
    for product in products:
        product.created_at = foundation_date
    return store, cashiers, members, products, suppliers


def _seed_sales(
    session: Session,
    rng: Random,
    store: Store,
    cashiers: list[Cashier],
    members: list[Member],
    products: list[Product],
    history_start: date,
    history_end: date,
) -> tuple[list[StockEvent], dict[tuple[date, str], int], int]:
    stock_events: list[StockEvent] = []
    monthly_sales: dict[tuple[date, str], int] = defaultdict(int)
    sale_count = 0
    current_date = history_start

    while current_date <= history_end:
        weekend = current_date.weekday() >= 5
        transaction_count = rng.randint(10, 15) if weekend else rng.randint(6, 11)
        minute_slots = sorted(rng.sample(range(8 * 60, 21 * 60 + 30), transaction_count))
        for daily_number, minute_slot in enumerate(minute_slots, start=1):
            created_at = datetime.combine(current_date, time.min) + timedelta(
                minutes=minute_slot, seconds=rng.randint(0, 59)
            )
            transaction_no = f"DMY-{current_date:%Y%m%d}-{daily_number:04d}"
            sale_id = new_id()
            line_count = rng.choices([1, 2, 3, 4, 5], weights=[16, 34, 29, 16, 5], k=1)[0]
            selected_products = _weighted_products(rng, products, line_count)
            quantities = [
                rng.choices([1, 2, 3], weights=[72, 23, 5], k=1)[0] for _ in selected_products
            ]
            subtotal = sum(
                product.price * quantity
                for product, quantity in zip(selected_products, quantities, strict=True)
            )
            discount = 0
            if subtotal >= 30_000 and rng.random() < 0.09:
                discount = rng.choice([1_000, 2_000, 5_000])
                discount = min(discount, subtotal // 10)
            total = subtotal - discount
            status = "cancelled" if rng.random() < 0.018 else "completed"
            member = rng.choice(members) if rng.random() < 0.38 else None
            cashier = rng.choice(cashiers)
            items: list[SaleItem] = []
            remaining_discount = discount

            for product, quantity in zip(selected_products, quantities, strict=True):
                line_subtotal = product.price * quantity
                line_discount = min(remaining_discount, line_subtotal)
                remaining_discount -= line_discount
                items.append(
                    SaleItem(
                        id=new_id(),
                        sale_id=sale_id,
                        product_id=product.id,
                        barcode=product.barcode,
                        product_name=product.name,
                        unit_price=product.price,
                        quantity=quantity,
                        discount=line_discount,
                        subtotal=line_subtotal,
                    )
                )
                if status == "completed":
                    month = current_date.replace(day=1)
                    monthly_sales[(month, product.id)] += quantity
                    stock_events.append(
                        StockEvent(
                            occurred_at=created_at,
                            product_id=product.id,
                            quantity_change=-quantity,
                            movement_type="sale",
                            unit_cost=product.cost_price,
                            reference_type="sale",
                            reference_id=sale_id,
                            note=f"Penjualan {transaction_no}",
                        )
                    )

            payment = (
                _payment_for_sale(rng, sale_id, total, created_at + timedelta(minutes=1))
                if status == "completed"
                else None
            )
            session.add(
                Sale(
                    id=sale_id,
                    transaction_no=transaction_no,
                    idempotency_key=f"demo-history-{current_date:%Y%m%d}-{daily_number:04d}",
                    store_id=store.id,
                    cashier_id=cashier.id,
                    member_id=member.id if member else None,
                    status=status,
                    subtotal=subtotal,
                    discount=discount,
                    tax=0,
                    rounding=0,
                    total=total,
                    item_count=sum(quantities),
                    notes=DEMO_NOTE,
                    items=items,
                    payment=payment,
                    created_at=created_at,
                    updated_at=created_at,
                )
            )
            sale_count += 1
        current_date += timedelta(days=1)
    return stock_events, monthly_sales, sale_count


def _seed_purchase_orders(
    session: Session,
    rng: Random,
    store: Store,
    products: list[Product],
    suppliers: dict[str, Supplier],
    monthly_sales: dict[tuple[date, str], int],
    history_start: date,
    history_end: date,
) -> tuple[list[StockEvent], dict[str, int], int]:
    stock_events: list[StockEvent] = []
    initial_balances = {product.id: rng.randint(80, 140) for product in products}
    balances = dict(initial_balances)
    months = _month_starts(history_start, history_end)
    order_count = 0

    for month in months:
        is_final_month = month == months[-1]
        lines_by_supplier: dict[str, list[tuple[Product, int]]] = defaultdict(list)
        for product in products:
            sold = monthly_sales[(month, product.id)]
            desired_balance = (
                product.stock
                if is_final_month
                else rng.randint(
                    max(product.reorder_level * 2, 35), max(product.reorder_level * 4, 90)
                )
            )
            purchase_quantity = max(0, sold + desired_balance - balances[product.id])
            if purchase_quantity:
                supplier_code = SUPPLIER_BY_CATEGORY.get(product.category, "SUP-001")
                lines_by_supplier[supplier_code].append((product, purchase_quantity))
            balances[product.id] += purchase_quantity - sold

        for supplier_code, lines in sorted(lines_by_supplier.items()):
            supplier = suppliers[supplier_code]
            received_at = datetime.combine(month, time(hour=7, minute=15))
            created_at = received_at - timedelta(days=4, hours=2)
            ordered_at = received_at - timedelta(days=3)
            po_id = new_id()
            po_number = f"PO-DMY-{month:%Y%m}-{supplier_code[-3:]}"
            order_items = [
                PurchaseOrderItem(
                    id=new_id(),
                    purchase_order_id=po_id,
                    product_id=product.id,
                    barcode=product.barcode,
                    product_name=product.name,
                    quantity_ordered=quantity,
                    quantity_received=quantity,
                    unit_cost=product.cost_price,
                    subtotal=product.cost_price * quantity,
                )
                for product, quantity in lines
            ]
            subtotal = sum(item.subtotal for item in order_items)
            session.add(
                PurchaseOrder(
                    id=po_id,
                    po_number=po_number,
                    supplier_id=supplier.id,
                    store_id=store.id,
                    status="received",
                    expected_date=month,
                    subtotal=subtotal,
                    notes="Restock rutin bulanan",
                    ordered_at=ordered_at,
                    received_at=received_at,
                    items=order_items,
                    created_at=created_at,
                    updated_at=received_at,
                )
            )
            for product, quantity in lines:
                stock_events.append(
                    StockEvent(
                        occurred_at=received_at,
                        product_id=product.id,
                        quantity_change=quantity,
                        movement_type="purchase",
                        unit_cost=product.cost_price,
                        reference_type="purchase_order",
                        reference_id=po_id,
                        note=f"Penerimaan {po_number}",
                    )
                )
            order_count += 1
    return stock_events, initial_balances, order_count


def _seed_open_orders(
    session: Session,
    store: Store,
    products: list[Product],
    suppliers: dict[str, Supplier],
    now: datetime,
) -> int:
    plans = [
        ("PO-DMY-OPEN-001", "SUP-005", "ordered", 3, products[:4]),
        ("PO-DMY-OPEN-002", "SUP-004", "draft", 5, products[-4:]),
    ]
    for index, (number, supplier_code, status, due_days, selected_products) in enumerate(plans):
        po_id = new_id()
        created_at = now - timedelta(hours=6 - index)
        items = [
            PurchaseOrderItem(
                id=new_id(),
                purchase_order_id=po_id,
                product_id=product.id,
                barcode=product.barcode,
                product_name=product.name,
                quantity_ordered=max(product.reorder_level * 3, 24),
                quantity_received=0,
                unit_cost=product.cost_price,
                subtotal=product.cost_price * max(product.reorder_level * 3, 24),
            )
            for product in selected_products
        ]
        session.add(
            PurchaseOrder(
                id=po_id,
                po_number=number,
                supplier_id=suppliers[supplier_code].id,
                store_id=store.id,
                status=status,
                expected_date=(now + timedelta(days=due_days)).date(),
                subtotal=sum(item.subtotal for item in items),
                notes="Pengadaan aktif untuk kebutuhan minggu berjalan",
                ordered_at=created_at + timedelta(minutes=30) if status == "ordered" else None,
                items=items,
                created_at=created_at,
                updated_at=created_at,
            )
        )
    return len(plans)


def _seed_recent_holds(
    session: Session,
    rng: Random,
    store: Store,
    cashier: Cashier,
    members: list[Member],
    products: list[Product],
    now: datetime,
) -> int:
    for index in range(2):
        created_at = now - timedelta(minutes=25 - index * 11)
        sale_id = new_id()
        selected = _weighted_products(rng, products, 2 + index)
        items = [
            SaleItem(
                id=new_id(),
                sale_id=sale_id,
                product_id=product.id,
                barcode=product.barcode,
                product_name=product.name,
                unit_price=product.price,
                quantity=1,
                discount=0,
                subtotal=product.price,
            )
            for product in selected
        ]
        subtotal = sum(item.subtotal for item in items)
        session.add(
            Sale(
                id=sale_id,
                transaction_no=f"HOLD-DMY-{now:%Y%m%d}-{index + 1:02d}",
                store_id=store.id,
                cashier_id=cashier.id,
                member_id=members[index].id,
                status="held",
                subtotal=subtotal,
                discount=0,
                tax=0,
                rounding=0,
                total=subtotal,
                item_count=len(items),
                notes="Titipan pelanggan, akan dilanjutkan",
                items=items,
                created_at=created_at,
                updated_at=created_at,
            )
        )
    return 2


def _write_stock_ledger(
    session: Session,
    store: Store,
    products: list[Product],
    events: list[StockEvent],
    initial_balances: dict[str, int],
    foundation_date: datetime,
    closed_at: datetime,
) -> int:
    events_by_product: dict[str, list[StockEvent]] = defaultdict(list)
    for event in events:
        events_by_product[event.product_id].append(event)
    movement_count = 0

    for product in products:
        balance = initial_balances[product.id]
        session.add(
            StockMovement(
                id=new_id(),
                product_id=product.id,
                store_id=store.id,
                movement_type="adjustment",
                quantity_change=balance,
                balance_after=balance,
                unit_cost=product.cost_price,
                reference_type="opening_balance",
                note="Saldo awal operasional demo",
                created_at=foundation_date,
            )
        )
        movement_count += 1
        for event in sorted(events_by_product[product.id], key=lambda item: item.occurred_at):
            balance += event.quantity_change
            if balance < 0:
                raise RuntimeError(f"Saldo historis {product.name} menjadi negatif")
            session.add(
                StockMovement(
                    id=new_id(),
                    product_id=product.id,
                    store_id=store.id,
                    movement_type=event.movement_type,
                    quantity_change=event.quantity_change,
                    balance_after=balance,
                    unit_cost=event.unit_cost,
                    reference_type=event.reference_type,
                    reference_id=event.reference_id,
                    note=event.note,
                    created_at=event.occurred_at,
                )
            )
            movement_count += 1
        adjustment = product.stock - balance
        if adjustment:
            balance += adjustment
            session.add(
                StockMovement(
                    id=new_id(),
                    product_id=product.id,
                    store_id=store.id,
                    movement_type="adjustment",
                    quantity_change=adjustment,
                    balance_after=balance,
                    unit_cost=product.cost_price,
                    reference_type="stock_opname",
                    note="Penyesuaian stok opname penutupan periode",
                    created_at=closed_at,
                )
            )
            movement_count += 1
    return movement_count


def seed_demo_history(session: Session) -> dict[str, int | str]:
    now = datetime.now(LOCAL_TIMEZONE).replace(tzinfo=None, microsecond=0)
    history_end = now.date() - timedelta(days=1)
    history_start = history_end - timedelta(days=364)
    sentinel = f"DMY-{history_start:%Y%m%d}-0001"
    existing = session.scalar(select(Sale.id).where(Sale.transaction_no == sentinel))
    if existing is not None:
        return {
            "status": "sudah_ada",
            "sales": int(session.scalar(select(func.count(Sale.id))) or 0),
            "purchase_orders": int(session.scalar(select(func.count(PurchaseOrder.id))) or 0),
            "stock_movements": int(session.scalar(select(func.count(StockMovement.id))) or 0),
        }

    rng = Random(DEMO_RANDOM_SEED)
    foundation_date = datetime.combine(history_start - timedelta(days=45), time(hour=9))
    store, cashiers, members, products, suppliers = _seed_master_data(session, foundation_date)
    sale_events, monthly_sales, sale_count = _seed_sales(
        session,
        rng,
        store,
        cashiers,
        members,
        products,
        history_start,
        history_end,
    )
    purchase_events, initial_balances, order_count = _seed_purchase_orders(
        session,
        rng,
        store,
        products,
        suppliers,
        monthly_sales,
        history_start,
        history_end,
    )
    open_order_count = _seed_open_orders(session, store, products, suppliers, now)
    hold_count = _seed_recent_holds(session, rng, store, cashiers[0], members, products, now)
    movement_count = _write_stock_ledger(
        session,
        store,
        products,
        sale_events + purchase_events,
        initial_balances,
        foundation_date,
        datetime.combine(history_end, time(hour=22, minute=30)),
    )
    session.commit()
    return {
        "status": "dibuat",
        "period": f"{history_start.isoformat()} s.d. {history_end.isoformat()}",
        "sales": sale_count + hold_count,
        "purchase_orders": order_count + open_order_count,
        "stock_movements": movement_count,
        "products": len(products),
        "cashiers": len(cashiers),
        "members": len(members),
        "suppliers": len(suppliers),
    }


def main() -> None:
    with SessionLocal() as session:
        seed_database(session)
        result = seed_demo_history(session)
    print("Seed demo MYMARKET selesai:")
    for key, value in result.items():
        print(f"- {key}: {value}")


if __name__ == "__main__":
    main()
