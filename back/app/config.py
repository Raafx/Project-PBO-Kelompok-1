from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MYMARKET POS API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = (
        "mysql+pymysql://mymarket_app:ganti_password@127.0.0.1:3306/kasir-pbo?charset=utf8mb4"
    )
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
