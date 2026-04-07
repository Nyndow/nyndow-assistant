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


class STTResponse(BaseModel):
    text: str


class RoadmapCreateRequest(BaseModel):
    text: str


class RoadmapItem(BaseModel):
    id: int
    text: str
    created_at: str


class RoadmapListResponse(BaseModel):
    items: list[RoadmapItem]


class RoadmapDeleteResponse(BaseModel):
    ok: bool
