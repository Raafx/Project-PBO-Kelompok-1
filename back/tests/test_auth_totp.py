from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AccessRole, Cashier
from app.services.operations import TOTP_PERIOD_SECONDS, _totp_code, hash_secret


def _current_code(secret: str, offset: int = 0) -> str:
    counter = int(datetime.now(UTC).timestamp()) // TOTP_PERIOD_SECONDS
    return _totp_code(secret, counter + offset)


def _enroll_admin(client: TestClient) -> tuple[str, str]:
    setup = client.post(
        "/api/v1/auth/login",
        json={"identity": "admin@gmail.com", "password": "password"},
    ).json()
    confirmed = client.post(
        "/api/v1/auth/totp/setup/confirm",
        json={
            "challenge_token": setup["challenge_token"],
            "code": _current_code(setup["totp_secret"]),
        },
    )
    assert confirmed.status_code == 200
    return confirmed.json()["access_token"], setup["totp_secret"]


def test_cashier_login_never_requires_totp(
    client: TestClient,
    session: Session,
) -> None:
    cashier_role = session.scalar(select(AccessRole).where(AccessRole.code == "CASHIER"))
    assert cashier_role is not None
    session.add(
        Cashier(
            employee_code="CASH-TOTP",
            full_name="Kasir Tanpa TOTP",
            role="cashier",
            role_id=cashier_role.id,
            password_hash=hash_secret("kasir12345"),
            totp_required=True,
            is_active=True,
        )
    )
    session.commit()

    login = client.post(
        "/api/v1/auth/login",
        json={"identity": "CASH-TOTP", "password": "kasir12345"},
    )

    assert login.status_code == 200
    assert login.json()["status"] == "authenticated"
    assert login.json()["access_token"]
    assert login.json()["challenge_token"] is None


def test_seeded_role_accounts_use_requested_emails_and_password(client: TestClient) -> None:
    cashier = client.post(
        "/api/v1/auth/login",
        json={"identity": "kasir@gmail.com", "password": "password"},
    )
    assert cashier.status_code == 200
    assert cashier.json()["status"] == "authenticated"
    assert cashier.json()["employee_code"] == "KASIR"
    assert cashier.json()["role_name"] == "Kasir"
    assert "pos.access" in cashier.json()["permissions"]
    assert "admin.overview" not in cashier.json()["permissions"]

    warehouse = client.post(
        "/api/v1/auth/login",
        json={"identity": "gudang@gmail.com", "password": "password"},
    )
    assert warehouse.status_code == 200
    assert warehouse.json()["status"] == "totp_setup_required"
    assert warehouse.json()["employee_code"] == "GUDANG"
    assert warehouse.json()["role_name"] == "Staf Gudang"
    assert "admin.stock" in warehouse.json()["permissions"]
    assert "pos.access" not in warehouse.json()["permissions"]

    superadmin = client.post(
        "/api/v1/auth/login",
        json={"identity": "superadmin@gmail.com", "password": "password"},
    )
    assert superadmin.status_code == 200
    body = superadmin.json()
    assert body["status"] == "authenticated"
    assert body["access_token"]
    assert body["challenge_token"] is None
    assert body["employee_code"] == "SUPERADMIN"
    assert body["role_name"] == "Administrator"
    assert "admin.settings" in body["permissions"]
    assert "admin.ceo_chat" in body["permissions"]


def test_admin_enrolls_authenticator_before_first_session(client: TestClient) -> None:
    login = client.post(
        "/api/v1/auth/login",
        json={"identity": "admin@gmail.com", "password": "password"},
    )
    assert login.status_code == 200
    challenge = login.json()
    assert challenge["status"] == "totp_setup_required"
    assert challenge["access_token"] is None
    assert challenge["challenge_token"]
    assert challenge["totp_secret"]
    assert challenge["role_name"] == "Administrator"
    assert challenge["provisioning_uri"].startswith("otpauth://totp/MYMARKET:")

    valid_code = _current_code(challenge["totp_secret"])
    invalid_code = "000000" if valid_code != "000000" else "000001"
    invalid = client.post(
        "/api/v1/auth/totp/setup/confirm",
        json={"challenge_token": challenge["challenge_token"], "code": invalid_code},
    )
    assert invalid.status_code == 401

    confirmed = client.post(
        "/api/v1/auth/totp/setup/confirm",
        json={
            "challenge_token": challenge["challenge_token"],
            "code": valid_code,
        },
    )
    assert confirmed.status_code == 200
    session = confirmed.json()
    assert session["status"] == "authenticated"
    assert session["access_token"]
    profile = client.get(
        "/api/v1/auth/profile",
        headers={"Authorization": f"Bearer {session['access_token']}"},
    )
    assert profile.status_code == 200
    assert profile.json()["employee_code"] == "ADMIN"


def test_admin_login_requires_totp_after_enrollment(client: TestClient) -> None:
    first = client.post(
        "/api/v1/auth/login",
        json={"identity": "admin@gmail.com", "password": "password"},
    ).json()
    client.post(
        "/api/v1/auth/totp/setup/confirm",
        json={
            "challenge_token": first["challenge_token"],
            "code": _current_code(first["totp_secret"]),
        },
    )

    login = client.post(
        "/api/v1/auth/login",
        json={"identity": "admin@gmail.com", "password": "password"},
    )
    assert login.status_code == 200
    challenge = login.json()
    assert challenge["status"] == "totp_required"
    assert challenge["access_token"] is None
    assert challenge["provisioning_uri"] is None

    verified = client.post(
        "/api/v1/auth/totp/verify",
        json={
            "challenge_token": challenge["challenge_token"],
            "code": _current_code(first["totp_secret"], offset=1),
        },
    )
    assert verified.status_code == 200
    assert verified.json()["status"] == "authenticated"
    assert verified.json()["access_token"]


def test_admin_can_add_and_login_with_second_authenticator(client: TestClient) -> None:
    access_token, _first_secret = _enroll_admin(client)
    headers = {"Authorization": f"Bearer {access_token}"}

    missing_current_code = client.post(
        "/api/v1/auth/authenticator/devices",
        headers=headers,
        json={"name": "Tidak sah"},
    )
    assert missing_current_code.status_code == 422

    wrong_current_code = "000000"
    if wrong_current_code == _current_code(_first_secret):
        wrong_current_code = "000001"
    unauthorized = client.post(
        "/api/v1/auth/authenticator/devices",
        headers=headers,
        json={"name": "Tidak sah", "current_code": wrong_current_code},
    )
    assert unauthorized.status_code == 401

    created = client.post(
        "/api/v1/auth/authenticator/devices",
        headers=headers,
        json={"name": "HP kerja", "current_code": _current_code(_first_secret)},
    )
    assert created.status_code == 201
    setup = created.json()
    assert setup["name"] == "HP kerja"
    assert setup["is_active"] is False
    assert setup["totp_secret"]
    assert "HP%20kerja" in setup["provisioning_uri"]

    invalid_code = "000000"
    if invalid_code == _current_code(setup["totp_secret"]):
        invalid_code = "000001"
    invalid = client.post(
        f"/api/v1/auth/authenticator/devices/{setup['id']}/confirm",
        headers=headers,
        json={"code": invalid_code},
    )
    assert invalid.status_code == 401

    confirmed = client.post(
        f"/api/v1/auth/authenticator/devices/{setup['id']}/confirm",
        headers=headers,
        json={"code": _current_code(setup["totp_secret"])},
    )
    assert confirmed.status_code == 200
    assert confirmed.json()["is_active"] is True

    devices = client.get("/api/v1/auth/authenticator/devices", headers=headers)
    assert devices.status_code == 200
    assert len(devices.json()) == 2
    assert all(device["is_active"] for device in devices.json())

    challenge = client.post(
        "/api/v1/auth/login",
        json={"identity": "admin@gmail.com", "password": "password"},
    ).json()
    login = client.post(
        "/api/v1/auth/totp/verify",
        json={
            "challenge_token": challenge["challenge_token"],
            "code": _current_code(setup["totp_secret"], offset=1),
        },
    )
    assert login.status_code == 200
    assert login.json()["status"] == "authenticated"


def test_authenticator_has_no_device_limit_and_keeps_last_active_device(
    client: TestClient,
) -> None:
    access_token, _secret = _enroll_admin(client)
    headers = {"Authorization": f"Bearer {access_token}"}

    for number in range(1, 13):
        response = client.post(
            "/api/v1/auth/authenticator/devices",
            headers=headers,
            json={
                "name": f"Perangkat cadangan {number}",
                "current_code": _current_code(_secret),
            },
        )
        assert response.status_code == 201

    devices = client.get("/api/v1/auth/authenticator/devices", headers=headers).json()
    assert len(devices) == 13
    active_device = next(device for device in devices if device["is_active"])

    cannot_remove_last = client.delete(
        f"/api/v1/auth/authenticator/devices/{active_device['id']}",
        headers=headers,
    )
    assert cannot_remove_last.status_code == 409

    pending_device = next(device for device in devices if not device["is_active"])
    removed_pending = client.delete(
        f"/api/v1/auth/authenticator/devices/{pending_device['id']}",
        headers=headers,
    )
    assert removed_pending.status_code == 204
