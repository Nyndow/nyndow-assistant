from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parents[1]

class TTSSettings(BaseModel):
    tts_model_path: str = str(BASE_DIR / "data/voice-model/en_US-lessac-medium.onnx")
    tts_use_cuda: bool = True

tts_settings = TTSSettings()
