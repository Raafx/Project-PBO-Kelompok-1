from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AccessRole, Cashier
from app.services.operations import TOTP_PERIOD_SECONDS, _totp_code, hash_secret


def _current_code(secret: str, offset: int = 0) -> str:
    counter = int(datetime.now(UTC).timestamp()) // TOTP_PERIOD_SECONDS
    return _totp_code(secret, counter + offset)


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
