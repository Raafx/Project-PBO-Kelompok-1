from __future__ import annotations

from datetime import UTC, date, datetime, time, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Cashier,
    Member,
    Payment,
    Product,
    PurchaseOrder,
    Sale,
    SaleItem,
    StockMovement,
    Supplier,
)
from app.schemas import (
    AdminDashboardRead,
    AdminSaleRead,
    AdminSalesReportRead,
    PurchaseOrderCreate,
    PurchaseOrderRead,
    ReceivePurchaseOrder,
    ReportBreakdown,
    ReportDailySale,
    ReportTopProduct,
    StockAdjustmentCreate,
    StockItemRead,
    StockMovementRead,
    SupplierCreate,
    SupplierRead,
)
from app.services.inventory import (
    adjust_stock,
    create_purchase_order,
    create_supplier,
    receive_purchase_order,
    stock_item,
    submit_purchase_order,
)

router = APIRouter(prefix="/admin", tags=["Admin inventory"])
DbSession = Annotated[Session, Depends(get_db)]


def _report_window(
    date_from: date | None, date_to: date | None
) -> tuple[date, date, datetime, datetime]:
    end_date = date_to or datetime.now(UTC).date()
    start_date = date_from or (end_date - timedelta(days=29))
    if start_date > end_date:
        raise HTTPException(
            status_code=422, detail="Tanggal awal tidak boleh melewati tanggal akhir"
        )
    if (end_date - start_date).days > 366:
        raise HTTPException(status_code=422, detail="Rentang laporan maksimal 366 hari")
    start_at = datetime.combine(start_date, time.min)
    end_at = datetime.combine(end_date + timedelta(days=1), time.min)
    return start_date, end_date, start_at, end_at


def _sale_list_statement():
    return (
        select(
            Sale,
            Cashier.full_name.label("cashier_name"),
            Member.full_name.label("member_name"),
            Payment.method.label("payment_method"),
        )
        .join(Cashier, Cashier.id == Sale.cashier_id)
        .outerjoin(Member, Member.id == Sale.member_id)
        .outerjoin(Payment, Payment.sale_id == Sale.id)
    )


def _sale_rows(rows: list[object]) -> list[AdminSaleRead]:
    return [
        AdminSaleRead(
            id=row.Sale.id,
            transaction_no=row.Sale.transaction_no,
            status=row.Sale.status,
            total=row.Sale.total,
            discount=row.Sale.discount,
            item_count=row.Sale.item_count,
            created_at=row.Sale.created_at,
            cashier_name=row.cashier_name,
            member_name=row.member_name,
            payment_method=row.payment_method,
        )
        for row in rows
    ]


@router.get("/dashboard", response_model=AdminDashboardRead)
def dashboard(session: DbSession) -> AdminDashboardRead:
    active_products = Product.is_active.is_(True)
    product_count = session.scalar(select(func.count(Product.id)).where(active_products)) or 0
    stock_units = (
        session.scalar(select(func.coalesce(func.sum(Product.stock), 0)).where(active_products))
        or 0
    )
    low_stock_count = (
        session.scalar(
            select(func.count(Product.id)).where(
                active_products, Product.stock <= Product.reorder_level
            )
        )
        or 0
    )
    supplier_count = (
        session.scalar(select(func.count(Supplier.id)).where(Supplier.is_active.is_(True))) or 0
    )
    open_po_count = (
        session.scalar(
            select(func.count(PurchaseOrder.id)).where(
                PurchaseOrder.status.in_(("draft", "ordered", "partially_received"))
            )
        )
        or 0
    )
    month_start = datetime.now(UTC).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=None
    )
    monthly_spend = (
        session.scalar(
            select(func.coalesce(func.sum(PurchaseOrder.subtotal), 0)).where(
                PurchaseOrder.status == "received", PurchaseOrder.received_at >= month_start
            )
        )
        or 0
    )
    inventory_value = (
        session.scalar(
            select(func.coalesce(func.sum(Product.stock * Product.cost_price), 0)).where(
                active_products
            )
        )
        or 0
    )
    low_products = session.scalars(
        select(Product)
        .where(active_products, Product.stock <= Product.reorder_level)
        .order_by(Product.stock, Product.name)
        .limit(8)
    ).all()
    recent_orders = session.scalars(
        select(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).limit(6)
    ).all()
    return AdminDashboardRead(
        product_count=product_count,
        stock_units=stock_units,
        low_stock_count=low_stock_count,
        active_supplier_count=supplier_count,
        open_purchase_order_count=open_po_count,
        purchase_spend_this_month=monthly_spend,
        inventory_value=inventory_value,
        low_stock_products=[stock_item(product) for product in low_products],
        recent_purchase_orders=list(recent_orders),
    )


@router.get("/sales", response_model=list[AdminSaleRead])
def list_sales(
    session: DbSession,
    date_from: date | None = None,
    date_to: date | None = None,
    sale_status: Annotated[str | None, Query(alias="status", max_length=16)] = None,
    search: Annotated[str | None, Query(max_length=80)] = None,
    limit: Annotated[int, Query(ge=1, le=500)] = 200,
) -> list[AdminSaleRead]:
    statement = _sale_list_statement()
    if date_from or date_to:
        _, _, start_at, end_at = _report_window(date_from, date_to)
        statement = statement.where(Sale.created_at >= start_at, Sale.created_at < end_at)
    if sale_status:
        statement = statement.where(Sale.status == sale_status)
    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Sale.transaction_no.like(term),
                Cashier.full_name.like(term),
                Member.full_name.like(term),
            )
        )
    rows = session.execute(statement.order_by(Sale.created_at.desc()).limit(limit)).all()
    return _sale_rows(rows)


@router.get("/reports/sales", response_model=AdminSalesReportRead)
def sales_report(
    session: DbSession,
    date_from: date | None = None,
    date_to: date | None = None,
) -> AdminSalesReportRead:
    start_date, end_date, start_at, end_at = _report_window(date_from, date_to)
    completed = (
        Sale.status == "completed",
        Sale.created_at >= start_at,
        Sale.created_at < end_at,
    )

    total_sales, transaction_count, item_count, total_discount = session.execute(
        select(
            func.coalesce(func.sum(Sale.total), 0),
            func.count(Sale.id),
            func.coalesce(func.sum(Sale.item_count), 0),
            func.coalesce(func.sum(Sale.discount), 0),
        ).where(*completed)
    ).one()

    estimated_profit = session.scalar(
        select(
            func.coalesce(
                func.sum(
                    ((SaleItem.unit_price - Product.cost_price) * SaleItem.quantity)
                    - SaleItem.discount
                ),
                0,
            )
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .join(Product, Product.id == SaleItem.product_id)
        .where(*completed)
    ) or 0

    day_column = func.date(Sale.created_at).label("day")
    daily_rows = session.execute(
        select(
            day_column,
            func.coalesce(func.sum(Sale.total), 0).label("total_sales"),
            func.count(Sale.id).label("transaction_count"),
        )
        .where(*completed)
        .group_by(day_column)
        .order_by(day_column)
    ).all()
    daily_by_date = {
        str(row.day): (int(row.total_sales), int(row.transaction_count)) for row in daily_rows
    }
    daily_sales: list[ReportDailySale] = []
    cursor = start_date
    while cursor <= end_date:
        sales_amount, transactions = daily_by_date.get(cursor.isoformat(), (0, 0))
        daily_sales.append(
            ReportDailySale(
                date=cursor,
                total_sales=sales_amount,
                transaction_count=transactions,
            )
        )
        cursor += timedelta(days=1)

    payment_rows = session.execute(
        select(
            Payment.method.label("label"),
            func.coalesce(func.sum(Payment.amount), 0).label("amount"),
            func.count(Payment.id).label("count"),
        )
        .join(Sale, Sale.id == Payment.sale_id)
        .where(*completed)
        .group_by(Payment.method)
        .order_by(func.sum(Payment.amount).desc())
    ).all()

    category_rows = session.execute(
        select(
            Product.category.label("label"),
            func.coalesce(func.sum(SaleItem.subtotal), 0).label("amount"),
            func.coalesce(func.sum(SaleItem.quantity), 0).label("count"),
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .join(Product, Product.id == SaleItem.product_id)
        .where(*completed)
        .group_by(Product.category)
        .order_by(func.sum(SaleItem.subtotal).desc())
    ).all()

    product_rows = session.execute(
        select(
            SaleItem.barcode,
            SaleItem.product_name,
            func.coalesce(func.sum(SaleItem.quantity), 0).label("quantity"),
            func.coalesce(func.sum(SaleItem.subtotal), 0).label("revenue"),
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .where(*completed)
        .group_by(SaleItem.barcode, SaleItem.product_name)
        .order_by(func.sum(SaleItem.quantity).desc(), func.sum(SaleItem.subtotal).desc())
        .limit(8)
    ).all()

    recent_rows = session.execute(
        _sale_list_statement()
        .where(Sale.created_at >= start_at, Sale.created_at < end_at)
        .order_by(Sale.created_at.desc())
        .limit(8)
    ).all()

    transaction_total = int(transaction_count)
    return AdminSalesReportRead(
        date_from=start_date,
        date_to=end_date,
        total_sales=int(total_sales),
        transaction_count=transaction_total,
        item_count=int(item_count),
        average_transaction=int(total_sales) // transaction_total if transaction_total else 0,
        total_discount=int(total_discount),
        estimated_gross_profit=int(estimated_profit),
        daily_sales=daily_sales,
        payment_methods=[
            ReportBreakdown(label=row.label, amount=int(row.amount), count=int(row.count))
            for row in payment_rows
        ],
        category_sales=[
            ReportBreakdown(label=row.label, amount=int(row.amount), count=int(row.count))
            for row in category_rows
        ],
        top_products=[
            ReportTopProduct(
                barcode=row.barcode,
                name=row.product_name,
                quantity=int(row.quantity),
                revenue=int(row.revenue),
            )
            for row in product_rows
        ],
        recent_sales=_sale_rows(recent_rows),
    )


@router.get("/stock", response_model=list[StockItemRead])
def list_stock(
    session: DbSession,
    search: Annotated[str | None, Query(max_length=120)] = None,
    low_only: bool = False,
) -> list[StockItemRead]:
    statement = select(Product).where(Product.is_active.is_(True)).order_by(Product.name)
    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(Product.name.like(term), Product.barcode.like(term), Product.category.like(term))
        )
    if low_only:
        statement = statement.where(Product.stock <= Product.reorder_level)
    return [stock_item(product) for product in session.scalars(statement).all()]


@router.post(
    "/stock/adjustments", response_model=StockMovementRead, status_code=status.HTTP_201_CREATED
)
def create_stock_adjustment(payload: StockAdjustmentCreate, session: DbSession) -> StockMovement:
    return adjust_stock(session, payload)


@router.get("/stock/movements", response_model=list[StockMovementRead])
def list_stock_movements(
    session: DbSession,
    product_id: str | None = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
) -> list[StockMovement]:
    statement = select(StockMovement).order_by(StockMovement.created_at.desc()).limit(limit)
    if product_id:
        statement = statement.where(StockMovement.product_id == product_id)
    return list(session.scalars(statement).all())


@router.get("/suppliers", response_model=list[SupplierRead])
def list_suppliers(session: DbSession) -> list[Supplier]:
    return list(session.scalars(select(Supplier).order_by(Supplier.name)).all())


@router.post("/suppliers", response_model=SupplierRead, status_code=status.HTTP_201_CREATED)
def add_supplier(payload: SupplierCreate, session: DbSession) -> Supplier:
    return create_supplier(session, payload)


@router.get("/purchase-orders", response_model=list[PurchaseOrderRead])
def list_purchase_orders(
    session: DbSession,
    order_status: Annotated[str | None, Query(alias="status", max_length=24)] = None,
) -> list[PurchaseOrder]:
    statement = select(PurchaseOrder).order_by(PurchaseOrder.created_at.desc())
    if order_status:
        statement = statement.where(PurchaseOrder.status == order_status)
    return list(session.scalars(statement).all())


@router.post(
    "/purchase-orders", response_model=PurchaseOrderRead, status_code=status.HTTP_201_CREATED
)
def add_purchase_order(payload: PurchaseOrderCreate, session: DbSession) -> PurchaseOrder:
    return create_purchase_order(session, payload)


@router.post("/purchase-orders/{purchase_order_id}/submit", response_model=PurchaseOrderRead)
def submit_order(purchase_order_id: str, session: DbSession) -> PurchaseOrder:
    return submit_purchase_order(session, purchase_order_id)


@router.post("/purchase-orders/{purchase_order_id}/receive", response_model=PurchaseOrderRead)
def receive_order(
    purchase_order_id: str,
    payload: ReceivePurchaseOrder,
    session: DbSession,
) -> PurchaseOrder:
    return receive_purchase_order(session, purchase_order_id, payload)
