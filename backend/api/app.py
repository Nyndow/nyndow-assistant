from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.chat import router as chat_router
from api.routes.ingest import router as ingest_router
from api.routes.roadmap import router as roadmap_router
from api.routes.stt import router as stt_router
from api.routes.tts import router as tts_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


app.include_router(chat_router, prefix="/api")
app.include_router(ingest_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")
app.include_router(stt_router, prefix="/api")
app.include_router(tts_router, prefix="/api")
