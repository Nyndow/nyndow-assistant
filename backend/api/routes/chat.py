import json
import uuid

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from api.models import ChatRequest, ChatResponse
from api.services.chat_service import chat_with_agent, stream_chat_with_ollama

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    reply = chat_with_agent(session_id=session_id, message=request.message)
    return ChatResponse(session_id=session_id, reply=reply)


@router.post("/chat/stream")
def chat_stream(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())

    def event_stream():
        for event in stream_chat_with_ollama(session_id=session_id, message=request.message):
            yield json.dumps(event, ensure_ascii=False) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")
