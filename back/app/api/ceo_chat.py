from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.admin import Actor, require_permission
from app.config import get_settings
from app.database import get_db
from app.models import CeoChatMessage, CeoChatSession
from app.schemas import (
    CeoChatConversationRead,
    CeoChatCreate,
    CeoChatMessageRead,
    CeoChatPrompt,
    CeoChatStatusRead,
)
from app.services.ceo_assistant import build_executive_snapshot, stream_gemini_answer

logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/admin/ceo-chat",
    tags=["CEO Copilot"],
    dependencies=[Depends(require_permission("admin.ceo_chat"))],
)
DbSession = Annotated[Session, Depends(get_db)]


def _conversation(session: Session, conversation_id: str, actor_id: str) -> CeoChatSession:
    conversation = session.scalar(
        select(CeoChatSession).where(
            CeoChatSession.id == conversation_id,
            CeoChatSession.created_by_id == actor_id,
        )
    )
    if conversation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Percakapan tidak ditemukan")
    return conversation


@router.get("/status", response_model=CeoChatStatusRead)
def chat_status() -> CeoChatStatusRead:
    settings = get_settings()
    return CeoChatStatusRead(
        configured=bool(settings.gemini_api_key.strip()),
        model=settings.gemini_model,
        project_name=settings.google_cloud_project_name,
        project_number=settings.google_cloud_project_number,
        context_source="Database operasional MYMARKET",
    )


@router.get("/conversations", response_model=list[CeoChatConversationRead])
def list_conversations(session: DbSession, actor: Actor) -> list[CeoChatSession]:
    return list(
        session.scalars(
            select(CeoChatSession)
            .where(CeoChatSession.created_by_id == actor.id)
            .order_by(CeoChatSession.updated_at.desc())
            .limit(100)
        ).all()
    )


@router.post(
    "/conversations",
    response_model=CeoChatConversationRead,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(payload: CeoChatCreate, session: DbSession, actor: Actor) -> CeoChatSession:
    conversation = CeoChatSession(
        title=payload.title.strip(),
        created_by_id=actor.id,
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(conversation_id: str, session: DbSession, actor: Actor) -> Response:
    conversation = _conversation(session, conversation_id, actor.id)
    session.delete(conversation)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: str,
    payload: CeoChatPrompt,
    session: DbSession,
    actor: Actor,
) -> StreamingResponse:
    settings = get_settings()
    if not settings.gemini_api_key.strip():
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Asisten sedang tidak tersedia.",
        )

    conversation = _conversation(session, conversation_id, actor.id)
    history = list(conversation.messages)
    user_message = CeoChatMessage(
        session_id=conversation.id,
        role="user",
        content=payload.message,
    )
    if not history:
        conversation.title = payload.message[:60]
    conversation.updated_at = datetime.now(UTC)
    session.add(user_message)
    session.commit()
    session.refresh(user_message)
    snapshot = build_executive_snapshot(session)

    async def events() -> AsyncIterator[str]:
        answer_parts: list[str] = []
        yield (
            json.dumps(
                {
                    "type": "user_message",
                    "message": CeoChatMessageRead.model_validate(user_message).model_dump(
                        mode="json"
                    ),
                    "title": conversation.title,
                },
                ensure_ascii=False,
            )
            + "\n"
        )
        try:
            async for part in stream_gemini_answer(payload.message, snapshot, history):
                answer_parts.append(part)
                yield json.dumps({"type": "delta", "text": part}, ensure_ascii=False) + "\n"
            answer = "".join(answer_parts).strip()
            if not answer:
                raise RuntimeError("Gemini mengembalikan jawaban kosong")
            assistant_message = CeoChatMessage(
                session_id=conversation.id,
                role="assistant",
                content=answer,
            )
            conversation.updated_at = datetime.now(UTC)
            session.add(assistant_message)
            session.commit()
            session.refresh(assistant_message)
            yield (
                json.dumps(
                    {
                        "type": "done",
                        "message": CeoChatMessageRead.model_validate(assistant_message).model_dump(
                            mode="json"
                        ),
                        "updated_at": conversation.updated_at.isoformat(),
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )
        except Exception:
            session.rollback()
            logger.exception("Gemini gagal merespons percakapan %s", conversation.id)
            yield (
                json.dumps(
                    {
                        "type": "error",
                        "message": (
                            "Asisten belum dapat merespons. Silakan coba lagi."
                        ),
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
