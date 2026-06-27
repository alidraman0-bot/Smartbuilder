from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid

from app.services.launch_orchestrator import LaunchOrchestrator

router = APIRouter()

class FilePart(BaseModel):
    filename: str = Field(..., description="Name of the file within the zip")
    content: str = Field(..., description="Base64‑encoded file content")

class LaunchRequest(BaseModel):
    project_name: str = Field(..., description="Human readable project name")
    files: List[FilePart] = Field(..., description="All source files for the MVP")
    env: Optional[dict] = Field(default_factory=dict, description="Environment variables")
    db_schema: Optional[str] = Field(None, description="SQL schema for database, if any")

@router.post("/launch", status_code=202)
async def launch_app(request: LaunchRequest, background_tasks: BackgroundTasks):
    """Accept MVP bundle and trigger asynchronous deployment pipeline.

    Returns a UUID that can be used by the frontend to poll status via SSE.
    """
    launch_id = str(uuid.uuid4())
    try:
        orchestrator = LaunchOrchestrator(launch_id)
        # Store request payload in Supabase (or any persistence) – orchestrator handles it
        background_tasks.add_task(orchestrator.start_pipeline, request)
        return {"launch_id": launch_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
