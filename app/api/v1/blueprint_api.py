import logging
from fastapi import APIRouter, Depends, HTTPException
from app.models.blueprint import BlueprintRequest, BlueprintResponse
from app.services.blueprint_service import BlueprintService
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/generate-blueprint", response_model=BlueprintResponse)
async def generate_blueprint(
    payload: BlueprintRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Generates a structured startup blueprint from an idea, research data, and PRD.
    Optionally persists the blueprint if a startup_id is provided.
    """
    try:
        service = BlueprintService()
        blueprint = await service.generate_blueprint(
            idea=payload.idea,
            research=payload.research,
            prd=payload.prd,
            project_id=payload.project_id,
        )
        return blueprint
    except Exception as e:
        logger.error(f"Blueprint generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/blueprint/share/{token}")
async def get_public_blueprint(token: str):
    """Retrieves a public blueprint by its share token."""
    service = BlueprintService()
    blueprint = service.get_blueprint_by_token(token)
    if not blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found or not public")
    return blueprint

@router.patch("/blueprint/{project_id}/share")
async def update_blueprint_sharing(
    project_id: str,
    is_public: bool,
    current_user: dict = Depends(get_current_user)
):
    """Toggles public sharing for a startup blueprint."""
    service = BlueprintService()
    # Note: Ownership check should ideally be here or in service. 
    # For now, relying on service to update.
    updated = service.update_sharing(project_id, is_public)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update sharing status")
    return updated
