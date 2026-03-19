import os
from typing import List

from pypdf import PdfReader

from rag.vectorstore import get_vectorstore

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def _chunk_text(text: str) -> List[str]:
    text = " ".join(text.split())
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = max(end - CHUNK_OVERLAP, end)
    return chunks


def ingest_pdf(path: str) -> str:
    if not os.path.exists(path):
        return f"File not found: {path}"
    if not path.lower().endswith(".pdf"):
        return "Please provide a .pdf file."

    reader = PdfReader(path)
    texts = []
    metadatas = []

    for idx, page in enumerate(reader.pages, start=1):
        page_text = page.extract_text() or ""
        for chunk in _chunk_text(page_text):
            texts.append(chunk)
            metadatas.append({"source": path, "page": idx})

    if not texts:
        return "No extractable text found in the PDF."

    db = get_vectorstore()
    db.add_texts(texts=texts, metadatas=metadatas)
    db.persist()

    return f"Added {len(texts)} chunks from {os.path.basename(path)}."
