from __future__ import annotations

from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.admin import router as admin_router
from app.api.routes import router
from app.config import get_settings
from app.database import get_db

settings = get_settings()
DbSession = Annotated[Session, Depends(get_db)]

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs" if settings.app_env != "production" else None,
    redoc_url=None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Idempotency-Key"],
)
app.include_router(router, prefix=settings.api_prefix)
app.include_router(admin_router, prefix=settings.api_prefix)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": settings.app_name, "docs": "/docs"}


@app.get("/health")
def health(session: DbSession) -> dict[str, str]:
    session.execute(text("SELECT 1"))
    return {"status": "ok", "database": "mysql"}
