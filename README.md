# Nyndow Assistant

Nyndow Assistant is a local-first AI companion with streaming chat, PDF ingestion for retrieval-augmented answers, and built-in text-to-speech playback. The app is split into a FastAPI backend and a React + Vite frontend, with Ollama handling LLM and embeddings locally.

## Demo

https://github.com/user-attachments/assets/80e2933b-ba11-498b-b4a1-37718409d0b5

**Features**
- Streaming chat with session memory.
- PDF ingestion into a local vector database for document search.
- Text-to-speech and Speech-to-text

**Prerequisites**
- Python 3.10+.
- Node.js 18+.
- Ollama installed and running locally.
- Piper voice model file at `backend/data/voice-model/en_US-lessac-medium.onnx`.

**Setup**
1. Backend dependencies:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
2. Frontend dependencies:
```bash
cd frontend
npm install
```
3. Pull default Ollama models:
```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

**Run (Development)**
1. Start the backend:
```bash
cd backend
source .venv/bin/activate
python main.py
```
2. Start the frontend:
```bash
cd frontend
npm run dev
```

**Configuration**
- Frontend API base URL: set `VITE_API_BASE` (defaults to empty string for same-origin).
- LLM + embeddings config: `backend/config/llm_settings.py`.
- TTS model path: `backend/config/tts_settings.py`.
- STT model path (optional): `backend/config/stt_settings.py`.

**Data Locations**
- Uploaded PDFs: `backend/data/uploads/`.
- Vector database: `backend/vector_db/`.
- Roadmap SQLite DB: `backend/data/roadmap.db`.

**Notes**
- The backend expects Ollama to be running locally for both chat and embeddings.
- The default models are `llama3.2` and `nomic-embed-text`. Adjust them in `backend/config/llm_settings.py` if needed.
- If TTS fails, confirm the Piper model file exists at `backend/data/voice-model/en_US-lessac-medium.onnx`.
