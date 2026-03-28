from fastapi import APIRouter, HTTPException

from api.models import RoadmapCreateRequest, RoadmapDeleteResponse, RoadmapItem, RoadmapListResponse
from db.roadmap import init_db, list_items, add_item, delete_item

router = APIRouter()
init_db()


@router.get("/roadmap", response_model=RoadmapListResponse)
def get_roadmap():
    return RoadmapListResponse(items=list_items())


@router.post("/roadmap", response_model=RoadmapItem)
def create_roadmap_item(request: RoadmapCreateRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")
    return RoadmapItem(**add_item(text))


@router.delete("/roadmap/{item_id}", response_model=RoadmapDeleteResponse)
def remove_roadmap_item(item_id: int):
    if not delete_item(item_id):
        raise HTTPException(status_code=404, detail="Item not found.")
    return RoadmapDeleteResponse(ok=True)
