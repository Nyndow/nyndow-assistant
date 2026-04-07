from __future__ import annotations

from pathlib import Path

from faster_whisper import WhisperModel

from config.stt_settings import stt_settings


_model: WhisperModel | None = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            stt_settings.stt_model_size,
            compute_type=stt_settings.stt_compute_type,
        )
    return _model


def get_stt_model() -> WhisperModel:
    return _get_model()


def transcribe_wav_path(wav_path: str | Path) -> str:
    path = Path(wav_path)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found at '{path}'.")

    model = _get_model()
    segments, _ = model.transcribe(
        str(path),
        language=stt_settings.stt_language,
        vad_filter=stt_settings.stt_vad_filter,
    )
    text = " ".join(segment.text for segment in segments).strip()
    return text
