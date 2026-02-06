from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.services.memory_service import memory_service
import uuid

router = APIRouter()

@router.get("/{project_id}/timeline")
async def get_project_timeline(project_id: str):
    """
    Get the sequential memory events for a specific project.
    """
    try:
        uuid.UUID(project_id) # Validate UUID
        return await memory_service.get_project_timeline(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project_id format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}/ideas")
async def get_project_ideas(project_id: str):
    """
    Get all stored ideas for a project.
    """
    # This could be implemented in MemoryService as a helper
    from app.core.supabase import supabase
    response = supabase.table("ideas").select("*").eq("project_id", project_id).order("created_at", desc=True).execute()
    return response.data

@router.post("/{project_id}/log")
async def log_manual_event(project_id: str, event_data: Dict[str, Any]):
    """
    Manually log a memory event (e.g., from UI actions).
    """
    from app.models.memory import MemoryEventBase
    try:
        event = MemoryEventBase(
            project_id=uuid.UUID(project_id),
            **event_data
        )
        return await memory_service.log_event(event)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
