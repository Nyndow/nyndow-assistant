import uuid

from tools.pdf_ingest import ingest_pdf
from api.state import UPLOAD_DIR, ensure_upload_dir


def save_and_ingest_pdf(filename: str, data: bytes) -> tuple[str, str]:
    if not filename.lower().endswith(".pdf"):
        return "Please provide a .pdf file.", ""

    ensure_upload_dir()
    safe_name = filename.split("/")[-1].split("\\")[-1]
    stored_name = f"{uuid.uuid4()}_{safe_name}"
    stored_path = UPLOAD_DIR / stored_name

    with open(stored_path, "wb") as handle:
        handle.write(data)

    result = ingest_pdf(str(stored_path))
    return result, str(stored_path)
