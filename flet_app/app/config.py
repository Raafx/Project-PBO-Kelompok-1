from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent


def _as_bool(value: str | None, *, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True, slots=True)
class Settings:
    """Konfigurasi aplikasi yang dapat dioverride melalui environment variable."""

    database_path: Path
    host: str
    port: int
    reload: bool
    show_browser: bool

    @classmethod
    def from_env(cls) -> "Settings":
        database_value = os.getenv("APP_DATABASE_PATH")
        database_path = Path(database_value) if database_value else BASE_DIR / "data" / "app.db"
        return cls(
            database_path=database_path,
            host=os.getenv("APP_HOST", "0.0.0.0"),
            port=int(os.getenv("APP_PORT", "8080")),
            reload=_as_bool(os.getenv("APP_RELOAD"), default=True),
            show_browser=_as_bool(os.getenv("APP_SHOW_BROWSER"), default=True),
        )

