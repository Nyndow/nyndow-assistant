from fastapi import APIRouter, File, UploadFile

from api.models import IngestResponse
from api.services.ingest_service import save_and_ingest_pdf

router = APIRouter()


@router.post("/ingest", response_model=IngestResponse)
def ingest(file: UploadFile = File(...)):
    filename = file.filename or ""
    result, stored_path = save_and_ingest_pdf(filename, file.file.read())
    return IngestResponse(result=result, stored_as=stored_path)
