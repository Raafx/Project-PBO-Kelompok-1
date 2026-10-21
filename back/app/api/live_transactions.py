from __future__ import annotations

import asyncio
import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, sessionmaker

from app.api.admin import Actor, require_permission
from app.database import get_db
from app.schemas import LiveTransactionHeartbeat, LiveTransactionRead, LiveWorkflowSnapshot
from app.services.live_transactions import record_heartbeat, workflow_snapshot

router = APIRouter(tags=["Live transaction workflow"])
DbSession = Annotated[Session, Depends(get_db)]


@router.post("/live-transactions/heartbeat", response_model=LiveTransactionRead)
def heartbeat(
    payload: LiveTransactionHeartbeat,
    session: DbSession,
    actor: Actor,
) -> LiveTransactionRead:
    require_permission("pos.access")(actor)
    if payload.cashier_code.strip().upper() != actor.employee_code:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Identitas kasir tidak sesuai dengan sesi login",
        )
    return record_heartbeat(session, payload)


@router.get(
    "/admin/live-transactions",
    response_model=LiveWorkflowSnapshot,
    dependencies=[Depends(require_permission("admin.live_transactions"))],
)
def list_live_transactions(session: DbSession) -> LiveWorkflowSnapshot:
    return workflow_snapshot(session)


@router.get(
    "/admin/live-transactions/stream",
    dependencies=[Depends(require_permission("admin.live_transactions"))],
)
def stream_live_transactions(session: DbSession) -> StreamingResponse:
    factory = sessionmaker(bind=session.get_bind(), autoflush=False, expire_on_commit=False)

    async def events():
        previous = ""
        heartbeat_count = 0
        while True:
            with factory() as stream_session:
                snapshot = workflow_snapshot(stream_session)
            payload = json.dumps(snapshot.model_dump(mode="json"), ensure_ascii=False)
            if payload != previous or heartbeat_count >= 10:
                yield payload + "\n"
                previous = payload
                heartbeat_count = 0
            heartbeat_count += 1
            await asyncio.sleep(1)

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
    )
