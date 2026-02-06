from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Any
from app.services.resource_service import resource_service

router = APIRouter()

@router.get("/")
async def get_resources(
    project_id: Optional[str] = Query(None),
    stage: Optional[str] = Query(None)
):
    """
    List all resources, optionally filtered by project and stage.
    """
    return await resource_service.get_resources(project_id, stage)

@router.get("/intelligence")
async def get_intelligence(
    project_id: Optional[str] = Query(None)
):
    """
    Get contextual intelligence for the panel.
    """
    return await resource_service.get_intelligence(project_id)

@router.post("/{resource_id}/apply")
async def apply_resource(
    resource_id: str,
    project_id: str = Query(...)
):
    """
    Apply a specific resource to a project.
    """
    try:
        return await resource_service.apply_resource(resource_id, project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
