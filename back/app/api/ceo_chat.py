from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from time import perf_counter
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
    CeoChatConversationSummaryRead,
    CeoChatCreate,
    CeoChatMessageRead,
    CeoChatPrompt,
    CeoChatStatusRead,
)
from app.services.ceo_assistant import (
    build_executive_snapshot,
    compact_model_snapshot,
    stream_gemini_answer,
)
from app.services.ceo_queries import answer_business_question

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
        configured=True,
        model=settings.gemini_model if settings.gemini_api_key.strip() else "database",
        project_name=settings.google_cloud_project_name,
        project_number=settings.google_cloud_project_number,
        context_source="Database operasional MYMARKET",
    )


@router.get("/conversations", response_model=list[CeoChatConversationSummaryRead])
def list_conversations(session: DbSession, actor: Actor) -> list[dict[str, object]]:
    rows = session.execute(
        select(CeoChatSession.id, CeoChatSession.title, CeoChatSession.updated_at)
        .where(CeoChatSession.created_by_id == actor.id)
        .order_by(CeoChatSession.updated_at.desc())
        .limit(100)
    ).all()
    return [dict(row._mapping) for row in rows]


@router.get("/conversations/{conversation_id}", response_model=CeoChatConversationRead)
def get_conversation(conversation_id: str, session: DbSession, actor: Actor) -> CeoChatSession:
    return _conversation(session, conversation_id, actor.id)


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
    started_at = perf_counter()
    conversation = _conversation(session, conversation_id, actor.id)
    history = list(conversation.messages)
    direct_answer = answer_business_question(session, payload.message, history)
    settings = get_settings()
    if direct_answer is None and not settings.gemini_api_key.strip():
        direct_answer = (
            "Analisis strategis sementara tidak tersedia. Saya tetap bisa menjawab "
            "pertanyaan angka tentang omzet, produk, stok, dan transaksi langsung "
            "dari database MYMARKET."
        )
    answer_route = "database" if direct_answer is not None else "gemini"
    model_snapshot = None
    if direct_answer is None:
        model_snapshot = compact_model_snapshot(build_executive_snapshot(session))
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
            if direct_answer is not None:
                answer_parts.append(direct_answer)
                yield (
                    json.dumps({"type": "delta", "text": direct_answer}, ensure_ascii=False) + "\n"
                )
            else:
                async for part in stream_gemini_answer(payload.message, model_snapshot, history):
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
            logger.info(
                "CEO chat selesai route=%s duration_ms=%d",
                answer_route,
                round((perf_counter() - started_at) * 1000),
            )
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
            logger.exception(
                "CEO chat gagal route=%s conversation=%s", answer_route, conversation.id
            )
            yield (
                json.dumps(
                    {
                        "type": "error",
                        "message": ("Asisten belum dapat merespons. Silakan coba lagi."),
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
