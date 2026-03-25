from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parents[1]

class STTSettings(BaseModel):
    stt_model_path: str = str(BASE_DIR / "data/voice-model/vosk-model-en-us-0.22")

stt_settings = STTSettings()