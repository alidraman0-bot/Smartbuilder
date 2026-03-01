import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from uuid import UUID
from typing import List, Optional
from app.models.startup import StartupProgressResponse, StartupStage, StartupCreate, ProjectResponse, ProjectCreate, ProjectUpdate
from app.services.startup_service import StartupService
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/startup-progress", response_model=StartupProgressResponse)
async def get_startup_progress(
    id: UUID = Query(..., description="The ID of the startup"),
    current_user: dict = Depends(get_current_user)
):
    """Fetches the current progress/stage of a specific startup."""
    service = StartupService()
    startup = service.get_startup_by_id(id)
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    
    # Check ownership
    if str(startup.user_id) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this startup")
        
    return startup

@router.post("/startup", response_model=StartupProgressResponse)
async def create_startup_entry(
    payload: StartupCreate,
    current_user: dict = Depends(get_current_user)
):
    """Creates a new startup tracking entry."""
    service = StartupService()
    startup = service.create_startup(user_id=UUID(current_user["id"]), name=payload.name)
    if not startup:
        raise HTTPException(status_code=500, detail="Failed to create startup")
    return startup

@router.patch("/startup/{startup_id}/stage", response_model=StartupProgressResponse)
async def update_startup_stage(
    startup_id: UUID,
    payload: StartupStage,
    current_user: dict = Depends(get_current_user)
):
    """Updates the current stage of a startup."""
    service = StartupService()
    startup = service.get_startup_by_id(startup_id)
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
        
    # Check ownership
    if str(startup.user_id) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to update this startup")
        
    updated = service.update_stage(startup_id, payload.stage)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update stage")
    return updated

# --- Startup Projects (New Endpoints) ---

@router.post("/project/create", response_model=ProjectResponse)
async def create_project(
    payload: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """Creates a new startup project tracking entry."""
    service = StartupService()
    project = service.create_project(user_id=UUID(current_user["id"]), project_data=payload)
    if not project:
        raise HTTPException(status_code=500, detail="Failed to create project")
    return project

@router.get("/project/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """Fetches details of a specific startup project."""
    service = StartupService()
    project = service.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check ownership
    if str(project.user_id) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
        
    return project

@router.patch("/project/stage", response_model=ProjectResponse)
async def update_project_stage(
    project_id: UUID,  # Changed from payload-based to query or body as needed, but let's follow standard
    stage: str,
    current_user: dict = Depends(get_current_user)
):
    """Updates the current stage of a project."""
    service = StartupService()
    project = service.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check ownership
    if str(project.user_id) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
        
    updated = service.update_project_stage(project_id, stage)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update stage")
    return updated

@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(
    current_user: dict = Depends(get_current_user)
):
    """Lists all startup projects for the authenticated user."""
    service = StartupService()
    return service.get_user_projects(user_id=UUID(current_user["id"]))
