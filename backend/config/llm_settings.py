from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parents[1]

class LLMSettings(BaseModel):
    llm_model: str = "llama3.2"
    embedding_model: str = "nomic-embed-text"
    vector_db_path: str = str(BASE_DIR / "vector_db")

llm_settings = LLMSettings()
