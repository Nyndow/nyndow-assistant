from pathlib import Path
from typing import Dict, List

from core.agent import build_agent

BASE_DIR = Path(__file__).resolve().parents[1]
agent = build_agent()
_sessions: Dict[str, List[dict]] = {}
UPLOAD_DIR = BASE_DIR / "data" / "uploads"


def get_sessions() -> Dict[str, List[dict]]:
    return _sessions


def ensure_upload_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
