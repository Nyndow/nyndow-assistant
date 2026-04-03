# Nyndow Assistant

Nyndow Assistant is a local-first AI companion with streaming chat, PDF ingestion for retrieval-augmented answers, and built-in text-to-speech playback. The app is split into a FastAPI backend and a React + Vite frontend, with Ollama handling LLM and embeddings locally.

**Features**
- Streaming chat with session memory.
- PDF ingestion into a local vector database (Chroma) for document search.
- Text-to-speech playback via Piper (WAV).
- Simple roadmap tracker backed by SQLite.

**Tech Stack**
- Backend: FastAPI, LangChain, Chroma, Ollama, Piper.
- Frontend: React 19, TypeScript, Vite.

**Project Structure**
- `backend/` FastAPI server, RAG tools, models, SQLite DB, and vector store.
- `frontend/` React client with chat, PDF ingest, and roadmap UI.
- `backend/data/` Uploads, SQLite DB, and voice/STT models.

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

**API Endpoints**
- `GET /api/health` health check.
- `POST /api/chat` non-streaming chat response.
- `POST /api/chat/stream` newline-delimited JSON streaming chat.
- `POST /api/ingest` PDF upload and vector index.
- `GET /api/roadmap` list roadmap items.
- `POST /api/roadmap` create roadmap item.
- `DELETE /api/roadmap/{id}` remove roadmap item.
- `POST /api/tts` generate WAV audio for a text prompt.

**Data Locations**
- Uploaded PDFs: `backend/data/uploads/`.
- Vector database: `backend/vector_db/`.
- Roadmap SQLite DB: `backend/data/roadmap.db`.

**Notes**
- The backend expects Ollama to be running locally for both chat and embeddings.
- The default models are `llama3.2` and `nomic-embed-text`. Adjust them in `backend/config/llm_settings.py` if needed.
- If TTS fails, confirm the Piper model file exists at `backend/data/voice-model/en_US-lessac-medium.onnx`.
