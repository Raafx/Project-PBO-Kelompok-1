from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import Annotated
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import (
    AccessRole,
    Cashier,
    Member,
    Payment,
    Product,
    PurchaseOrder,
    RolePermission,
    Sale,
    SaleItem,
    StockMovement,
    Supplier,
)
from app.schemas import (
    AccessProfileRead,
    AdminDashboardRead,
    AdminSaleRead,
    AdminSalesReportRead,
    DirectPurchaseCreate,
    ProductCreate,
    ProductRead,
    ProductUpdate,
    PurchaseOrderRead,
    ReportBreakdown,
    ReportDailySale,
    ReportMonthlySale,
    ReportProductPerformance,
    ReportTopProduct,
    RolePermissionsUpdate,
    RoleRead,
    StaffRead,
    StaffRoleUpdate,
    StockAdjustmentCreate,
    StockItemRead,
    StockMovementRead,
    StockTransferCreate,
    StockTransferRead,
    SupplierCreate,
    SupplierRead,
)
from app.services.access import (
    PERMISSION_CATALOG,
    access_profile,
    actor_by_code,
    ensure_permission,
    permission_values,
    role_read,
    staff_read,
)
from app.services.inventory import (
    adjust_stock,
    create_supplier,
    record_direct_purchase,
    stock_item,
    transfer_stock,
)
from app.services.operations import actor_from_token, write_audit
from app.services.products import archive_product, create_product, update_product
from app.services.reporting import period_summary, product_performance

router = APIRouter(prefix="/admin", tags=["Admin inventory"])
DbSession = Annotated[Session, Depends(get_db)]


def current_actor(
    session: DbSession,
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
    actor_code: Annotated[
        str | None, Header(alias="X-Actor-Code", min_length=1, max_length=30)
    ] = None,
) -> Cashier:
    if authorization and authorization.lower().startswith("bearer "):
        actor = actor_from_token(session, authorization[7:].strip())
        if actor is not None:
            return actor
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesi login tidak valid atau kedaluwarsa")
    if actor_code and get_settings().allow_dev_actor_header:
        return actor_by_code(session, actor_code.strip().upper())
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Silakan login terlebih dahulu")


Actor = Annotated[Cashier, Depends(current_actor)]


def require_permission(permission: str):
    def dependency(actor: Actor) -> Cashier:
        return ensure_permission(actor, permission)

    return dependency


def require_any_permission(*permissions: str):
    def dependency(actor: Actor) -> Cashier:
        granted = permission_values(actor.access_role)
        if not granted.intersection(permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses tidak diizinkan untuk role ini",
            )
        return actor

    return dependency


def _report_window(
    date_from: date | None, date_to: date | None
) -> tuple[date, date, datetime, datetime]:
    end_date = date_to or _business_now().date()
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


def _business_now() -> datetime:
    return datetime.now(ZoneInfo(get_settings().business_timezone)).replace(tzinfo=None)


def _product_or_404(session: Session, product_id: str) -> Product:
    product = session.get(Product, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    return product


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
            gross_profit=sum(item.gross_profit for item in row.Sale.items),
            created_at=row.Sale.created_at,
            cashier_name=row.cashier_name,
            member_name=row.member_name,
            payment_method=row.payment_method,
            items=list(row.Sale.items),
        )
        for row in rows
    ]


@router.get("/access/me", response_model=AccessProfileRead)
def my_access(actor: Actor) -> AccessProfileRead:
    return access_profile(actor)


@router.get(
    "/dashboard",
    response_model=AdminDashboardRead,
    dependencies=[Depends(require_permission("admin.overview"))],
)
def dashboard(session: DbSession) -> AdminDashboardRead:
    active_products = Product.is_active.is_(True)
    product_count = session.scalar(select(func.count(Product.id)).where(active_products)) or 0
    sales_stock_units = (
        session.scalar(select(func.coalesce(func.sum(Product.stock), 0)).where(active_products))
        or 0
    )
    warehouse_stock_units = (
        session.scalar(
            select(func.coalesce(func.sum(Product.warehouse_stock), 0)).where(active_products)
        )
        or 0
    )
    stock_units = sales_stock_units + warehouse_stock_units
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
    month_start = _business_now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
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
            select(
                func.coalesce(
                    func.sum((Product.stock + Product.warehouse_stock) * Product.cost_price), 0
                )
            ).where(active_products)
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
        warehouse_stock_units=warehouse_stock_units,
        sales_stock_units=sales_stock_units,
        low_stock_count=low_stock_count,
        active_supplier_count=supplier_count,
        open_purchase_order_count=open_po_count,
        purchase_spend_this_month=monthly_spend,
        inventory_value=inventory_value,
        low_stock_products=[stock_item(product) for product in low_products],
        recent_purchase_orders=list(recent_orders),
    )


@router.get(
    "/sales",
    response_model=list[AdminSaleRead],
    dependencies=[Depends(require_permission("admin.sales"))],
)
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
        matching_sale_ids = select(SaleItem.sale_id).where(
            or_(
                SaleItem.product_name.like(term),
                SaleItem.barcode.like(term),
            )
        )
        statement = statement.where(
            or_(
                Sale.transaction_no.like(term),
                Cashier.full_name.like(term),
                Member.full_name.like(term),
                Sale.id.in_(matching_sale_ids),
            )
        )
    rows = session.execute(statement.order_by(Sale.created_at.desc()).limit(limit)).all()
    return _sale_rows(rows)


@router.get(
    "/reports/sales",
    response_model=AdminSalesReportRead,
    dependencies=[Depends(require_any_permission("admin.reports", "admin.overview"))],
)
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

    summary = period_summary(session, start_at, end_at)

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
    profit_day_column = func.date(Sale.created_at).label("day")
    daily_profit_rows = session.execute(
        select(
            profit_day_column,
            func.coalesce(
                func.sum(SaleItem.subtotal - (SaleItem.unit_cost * SaleItem.quantity)),
                0,
            ).label("gross_profit"),
        )
        .join(SaleItem, SaleItem.sale_id == Sale.id)
        .where(*completed)
        .group_by(profit_day_column)
    ).all()
    daily_profit_by_date = {
        str(row.day): int(row.gross_profit) for row in daily_profit_rows
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
                gross_profit=daily_profit_by_date.get(cursor.isoformat(), 0),
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

    performance = product_performance(session, start_at, end_at)
    top_products = sorted(
        performance,
        key=lambda item: (int(item["quantity"]), int(item["net_revenue"])),
        reverse=True,
    )[:8]

    transaction_rows = session.execute(
        _sale_list_statement()
        .where(*completed)
        .order_by(Sale.created_at.desc())
        .limit(500)
    ).all()
    transactions = _sale_rows(transaction_rows)

    monthly_totals: dict[str, dict[str, int]] = {}
    for daily in daily_sales:
        month = daily.date.strftime("%Y-%m")
        values = monthly_totals.setdefault(
            month,
            {"total_sales": 0, "transaction_count": 0, "gross_profit": 0},
        )
        values["total_sales"] += daily.total_sales
        values["transaction_count"] += daily.transaction_count
        values["gross_profit"] += daily.gross_profit
    monthly_sales = [
        ReportMonthlySale(month=month, **values)
        for month, values in sorted(monthly_totals.items())
    ]

    transaction_total = summary["transaksi"]
    return AdminSalesReportRead(
        date_from=start_date,
        date_to=end_date,
        total_sales=summary["omzet"],
        transaction_count=transaction_total,
        item_count=summary["item_terjual"],
        average_transaction=summary["rata_rata_transaksi"],
        total_discount=summary["diskon"],
        estimated_gross_profit=summary["laba_kotor"],
        daily_sales=daily_sales,
        monthly_sales=monthly_sales,
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
                barcode=str(item["barcode"]),
                name=str(item["name"]),
                quantity=int(item["quantity"]),
                revenue=int(item["net_revenue"]),
                transaction_count=int(item["transaction_count"]),
                gross_profit=int(item["gross_profit"]),
                margin_percentage=float(item["margin_percentage"]),
            )
            for item in top_products
        ],
        product_performance=[ReportProductPerformance(**item) for item in performance],
        recent_sales=transactions[:8],
        transactions=transactions,
    )


@router.get(
    "/products",
    response_model=list[ProductRead],
    dependencies=[Depends(require_permission("admin.products"))],
)
def list_master_products(
    session: DbSession,
    search: Annotated[str | None, Query(max_length=120)] = None,
    active: bool | None = True,
) -> list[Product]:
    statement = select(Product).order_by(Product.name)
    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Product.name.like(term),
                Product.barcode.like(term),
                Product.sku.like(term),
                Product.category.like(term),
            )
        )
    if active is not None:
        statement = statement.where(Product.is_active.is_(active))
    return list(session.scalars(statement).all())


@router.post(
    "/products",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("admin.products"))],
)
def add_master_product(payload: ProductCreate, session: DbSession, actor: Actor) -> Product:
    product = create_product(session, payload)
    write_audit(session, actor, "product.create", "product", product.id, {"name": product.name})
    session.commit()
    return product


@router.put(
    "/products/{product_id}",
    response_model=ProductRead,
    dependencies=[Depends(require_permission("admin.products"))],
)
def edit_master_product(
    product_id: str, payload: ProductUpdate, session: DbSession, actor: Actor
) -> Product:
    product = _product_or_404(session, product_id)
    changes = payload.model_dump(exclude_unset=True)
    updated = update_product(session, product, payload)
    write_audit(session, actor, "product.update", "product", product.id, changes)
    session.commit()
    return updated


@router.delete(
    "/products/{product_id}",
    response_model=ProductRead,
    dependencies=[Depends(require_permission("admin.products"))],
)
def remove_master_product(product_id: str, session: DbSession, actor: Actor) -> Product:
    product = archive_product(session, _product_or_404(session, product_id))
    write_audit(session, actor, "product.archive", "product", product.id, {"name": product.name})
    session.commit()
    return product


@router.get(
    "/stock",
    response_model=list[StockItemRead],
    dependencies=[Depends(require_any_permission("admin.stock", "admin.purchasing"))],
)
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
    "/stock/adjustments",
    response_model=StockMovementRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("admin.stock"))],
)
def create_stock_adjustment(
    payload: StockAdjustmentCreate, session: DbSession, actor: Actor
) -> StockMovement:
    return adjust_stock(session, payload, actor)


@router.get(
    "/stock/movements",
    response_model=list[StockMovementRead],
    dependencies=[Depends(require_permission("admin.stock"))],
)
def list_stock_movements(
    session: DbSession,
    product_id: str | None = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
) -> list[StockMovement]:
    statement = select(StockMovement).order_by(StockMovement.created_at.desc()).limit(limit)
    if product_id:
        statement = statement.where(StockMovement.product_id == product_id)
    return list(session.scalars(statement).all())


@router.get(
    "/suppliers",
    response_model=list[SupplierRead],
    dependencies=[Depends(require_any_permission("admin.suppliers", "admin.purchasing"))],
)
def list_suppliers(session: DbSession) -> list[Supplier]:
    return list(session.scalars(select(Supplier).order_by(Supplier.name)).all())


@router.post(
    "/suppliers",
    response_model=SupplierRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("admin.suppliers"))],
)
def add_supplier(payload: SupplierCreate, session: DbSession) -> Supplier:
    return create_supplier(session, payload)


@router.get(
    "/purchases",
    response_model=list[PurchaseOrderRead],
    dependencies=[Depends(require_permission("admin.purchasing"))],
)
def list_purchase_orders(
    session: DbSession,
    order_status: Annotated[str | None, Query(alias="status", max_length=24)] = None,
) -> list[PurchaseOrder]:
    statement = select(PurchaseOrder).order_by(PurchaseOrder.created_at.desc())
    if order_status:
        statement = statement.where(PurchaseOrder.status == order_status)
    return list(session.scalars(statement).all())


@router.post(
    "/purchases",
    response_model=PurchaseOrderRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("admin.purchasing"))],
)
def add_direct_purchase(
    payload: DirectPurchaseCreate,
    session: DbSession,
    actor: Actor,
    idempotency_key: Annotated[
        str | None, Header(alias="X-Idempotency-Key", max_length=128)
    ] = None,
) -> PurchaseOrder:
    normalized_key = idempotency_key.strip() if idempotency_key else None
    return record_direct_purchase(session, payload, actor, normalized_key or None)


@router.post(
    "/stock/transfers",
    response_model=StockTransferRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("admin.stock"))],
)
def add_stock_transfer(
    payload: StockTransferCreate, session: DbSession, actor: Actor
) -> StockTransferRead:
    return transfer_stock(session, payload, actor)


@router.get(
    "/roles",
    response_model=list[RoleRead],
    dependencies=[Depends(require_permission("admin.roles"))],
)
def list_roles(session: DbSession) -> list[RoleRead]:
    roles = session.scalars(select(AccessRole).order_by(AccessRole.name)).all()
    return [role_read(role) for role in roles]


@router.put(
    "/roles/{role_id}",
    response_model=RoleRead,
    dependencies=[Depends(require_permission("admin.roles"))],
)
def update_role_permissions(
    role_id: str, payload: RolePermissionsUpdate, session: DbSession
) -> RoleRead:
    role = session.scalar(select(AccessRole).where(AccessRole.id == role_id))
    if role is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Role tidak ditemukan")
    if role.code == "OWNER":
        raise HTTPException(status.HTTP_409_CONFLICT, "Akses role Pemilik tidak dapat dikurangi")
    requested = set(payload.permissions)
    unknown = requested - set(PERMISSION_CATALOG)
    if unknown:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Permission tidak dikenal: {', '.join(sorted(unknown))}",
        )
    if payload.name:
        role.name = payload.name.strip()
    current = {item.permission: item for item in role.permissions}
    for permission in set(current) - requested:
        role.permissions.remove(current[permission])
    role.permissions.extend(
        RolePermission(permission=permission) for permission in sorted(requested - set(current))
    )
    session.commit()
    session.refresh(role)
    return role_read(role)


@router.get(
    "/staff",
    response_model=list[StaffRead],
    dependencies=[Depends(require_permission("admin.roles"))],
)
def list_staff(session: DbSession) -> list[StaffRead]:
    staff = session.scalars(select(Cashier).order_by(Cashier.full_name)).all()
    return [staff_read(cashier) for cashier in staff]


@router.put(
    "/staff/{cashier_id}/role",
    response_model=StaffRead,
    dependencies=[Depends(require_permission("admin.roles"))],
)
def assign_staff_role(cashier_id: str, payload: StaffRoleUpdate, session: DbSession) -> StaffRead:
    cashier = session.scalar(select(Cashier).where(Cashier.id == cashier_id))
    if cashier is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Petugas tidak ditemukan")
    role = session.scalar(select(AccessRole).where(AccessRole.id == payload.role_id))
    if role is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Role tidak ditemukan")
    if cashier.access_role and cashier.access_role.code == "OWNER" and role.code != "OWNER":
        owner_count = (
            session.scalar(select(func.count(Cashier.id)).where(Cashier.role_id == cashier.role_id))
            or 0
        )
        if owner_count <= 1:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Minimal satu petugas harus tetap memiliki role Pemilik",
            )
    cashier.role_id = role.id
    cashier.role = role.code.lower()
    session.commit()
    session.refresh(cashier)
    return staff_read(cashier)
