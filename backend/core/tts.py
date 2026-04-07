from __future__ import annotations

from pathlib import Path
import io
import wave

from piper import PiperVoice
from config.tts_settings import tts_settings


_MODEL_PATH = Path(tts_settings.tts_model_path)
_voice: PiperVoice | None = None


def _get_voice() -> PiperVoice:
    global _voice
    if _voice is None:
        if not _MODEL_PATH.exists():
            raise FileNotFoundError(f"TTS model not found at '{_MODEL_PATH}'.")
        _voice = PiperVoice.load(str(_MODEL_PATH))
    return _voice


def synthesize_wav_bytes(text: str) -> bytes:
    if not text.strip():
        raise ValueError("Text cannot be empty.")

    voice = _get_voice()
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        voice.synthesize_wav(text, wav_file)

    return buffer.getvalue()
