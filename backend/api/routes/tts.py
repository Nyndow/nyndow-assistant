from fastapi import APIRouter, Response

from api.models import TTSRequest
from core.speech import synthesize_wav_bytes

router = APIRouter()


@router.post("/tts")
def tts(request: TTSRequest):
    audio = synthesize_wav_bytes(request.text)
    return Response(content=audio, media_type="audio/wav")
