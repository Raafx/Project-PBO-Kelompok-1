from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AccessRole, Cashier, RolePermission
from app.schemas import AccessProfileRead, RoleRead, StaffRead

PERMISSION_CATALOG: dict[str, str] = {
    "pos.access": "Kasir POS",
    "pos.supervise": "Persetujuan supervisor POS",
    "admin.overview": "Ringkasan",
    "admin.sales": "Penjualan",
    "admin.reports": "Laporan",
    "admin.stock": "Persediaan",
    "admin.purchasing": "Pembelian",
    "admin.suppliers": "Supplier",
    "admin.roles": "Role & akses",
    "admin.ceo_chat": "CEO Copilot",
    "admin.products": "Master produk",
    "admin.live_transactions": "Transaksi live",
    "admin.operations": "Operasional",
    "admin.finance": "Keuangan",
    "admin.settings": "Pengaturan",
}

DEFAULT_ROLE_PERMISSIONS: dict[str, tuple[str, str, set[str]]] = {
    "OWNER": ("Administrator", "owner", set(PERMISSION_CATALOG)),
    "MANAGER": (
        "Manajer",
        "manager",
        {
            "pos.access",
            "pos.supervise",
            "admin.overview",
            "admin.sales",
            "admin.reports",
            "admin.stock",
            "admin.purchasing",
            "admin.suppliers",
            "admin.products",
            "admin.live_transactions",
            "admin.operations",
            "admin.finance",
        },
    ),
    "WAREHOUSE": (
        "Staf Gudang",
        "warehouse",
        {
            "admin.overview",
            "admin.stock",
            "admin.purchasing",
            "admin.suppliers",
            "admin.operations",
        },
    ),
    "CASHIER": ("Kasir", "cashier", {"pos.access", "admin.sales"}),
}


def permission_values(role: AccessRole | None) -> set[str]:
    if role is None:
        return set()
    return {item.permission for item in role.permissions}


def ensure_default_roles(session: Session) -> dict[str, AccessRole]:
    roles = {role.code: role for role in session.scalars(select(AccessRole)).all()}
    for code, (name, _legacy_name, permissions) in DEFAULT_ROLE_PERMISSIONS.items():
        role = roles.get(code)
        if role is None:
            role = AccessRole(code=code, name=name, is_system=True)
            role.permissions = [RolePermission(permission=value) for value in sorted(permissions)]
            session.add(role)
            roles[code] = role
        elif code == "OWNER":
            role.name = name
            existing = permission_values(role)
            role.permissions.extend(
                RolePermission(permission=value) for value in sorted(permissions - existing)
            )
    session.flush()
    return roles


def actor_by_code(session: Session, employee_code: str) -> Cashier:
    actor = session.scalar(
        select(Cashier).where(
            Cashier.employee_code == employee_code,
            Cashier.is_active.is_(True),
        )
    )
    if actor is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Petugas tidak ditemukan atau nonaktif")
    if actor.access_role is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Petugas belum memiliki role akses")
    return actor


def ensure_permission(actor: Cashier, permission: str) -> Cashier:
    if permission not in permission_values(actor.access_role):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"Role {actor.access_role.name} tidak memiliki akses {PERMISSION_CATALOG[permission]}",
        )
    return actor


def access_profile(actor: Cashier) -> AccessProfileRead:
    role = actor.access_role
    if role is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Petugas belum memiliki role akses")
    return AccessProfileRead(
        employee_code=actor.employee_code,
        full_name=actor.full_name,
        role_code=role.code,
        role_name=role.name,
        permissions=sorted(permission_values(role)),
    )


def role_read(role: AccessRole) -> RoleRead:
    return RoleRead(
        id=role.id,
        code=role.code,
        name=role.name,
        is_system=role.is_system,
        permissions=sorted(permission_values(role)),
    )


def staff_read(cashier: Cashier) -> StaffRead:
    role = cashier.access_role
    return StaffRead(
        id=cashier.id,
        employee_code=cashier.employee_code,
        full_name=cashier.full_name,
        is_active=cashier.is_active,
        role_id=role.id if role else None,
        role_code=role.code if role else None,
        role_name=role.name if role else None,
    )
