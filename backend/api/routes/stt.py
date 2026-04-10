from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, File, UploadFile

from api.models import STTResponse
from core.stt import transcribe_wav_path

router = APIRouter()


@router.post("/stt", response_model=STTResponse)
async def stt(audio: UploadFile = File(...)):
    suffix = Path(audio.filename or "speech.webm").suffix or ".webm"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        contents = await audio.read()
        tmp.write(contents)
        tmp_path = Path(tmp.name)

    try:
        text = transcribe_wav_path(tmp_path)
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except Exception:
            pass
    print(f"Transcribed text: {text}")
    return STTResponse(text=text)
