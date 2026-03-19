from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    reply: str


class IngestResponse(BaseModel):
    result: str
    stored_as: str


class TTSRequest(BaseModel):
    text: str
