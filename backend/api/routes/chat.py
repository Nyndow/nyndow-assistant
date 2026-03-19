import uuid

from fastapi import APIRouter

from api.models import ChatRequest, ChatResponse
from api.services.chat_service import chat_with_agent

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    reply = chat_with_agent(session_id=session_id, message=request.message)
    return ChatResponse(session_id=session_id, reply=reply)
