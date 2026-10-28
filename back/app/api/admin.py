"""API admin untuk ringkasan, penjualan, laporan, produk, stok, dan hak akses.

Setiap fungsi dengan `@router.get/post/...` adalah URL yang dipanggil frontend.
Perhitungan dan aturan bisnis yang dipakai bersama berada di `app/services/`.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import (
    AccessRole,
    Cashier,
    Product,
    PurchaseOrder,
    RolePermission,
    StockMovement,
    Supplier,
)
from app.schemas import (
    AccessProfileRead,
    AdminDashboardRead,
    DirectPurchaseCreate,
    ProductCreate,
    ProductRead,
    ProductUpdate,
    PurchaseOrderRead,
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
from app.services.periode_laporan import waktu_bisnis
from app.services.products import archive_product, create_product, update_product

router = APIRouter(prefix="/admin", tags=["Admin inventory"])
DbSession = Annotated[Session, Depends(get_db)]


# Dependency ini membaca token login pada header Authorization sebelum API diproses.
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


# Setiap route dapat meminta permission tertentu; pengguna tanpa akses mendapat 403.
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


def _product_or_404(session: Session, product_id: str) -> Product:
    product = session.get(Product, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produk tidak ditemukan")
    return product


# Profil akses dan angka ringkasan admin.
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
    month_start = waktu_bisnis().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
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


# Master Produk: cari, tambah, ubah, atau nonaktifkan produk.
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


# Persediaan: saldo stok, koreksi, dan perpindahan gudang ke kasir.
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


# Supplier dan pembelian untuk menambah stok gudang.
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


# Hak akses: role menentukan menu dan tindakan yang boleh digunakan petugas.
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
