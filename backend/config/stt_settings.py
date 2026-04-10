from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parents[1]


class STTSettings(BaseModel):
    stt_model_size: str = "small.en"
    stt_compute_type: str = "int8"
    stt_device: str = "cpu"
    stt_language: str | None = "en"
    stt_vad_filter: bool = True

stt_settings = STTSettings()
