"""
Build Engine API Routes

Endpoints for the MVP Builder build orchestrator:
  POST /api/v1/build/start   — Start a new build
  GET  /api/v1/build/{id}/status — Get build progress
  GET  /api/v1/build/{id}/logs   — Get build logs
  GET  /api/v1/build/{id}/stats  — Get 'wow' stats
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter()

# Lazy-init orchestrator to avoid import-time side effects
_orchestrator = None

def _get_orchestrator():
    global _orchestrator
    if _orchestrator is None:
        from app.services.build_orchestrator_service import BuildOrchestrator
        _orchestrator = BuildOrchestrator()
    return _orchestrator


class StartBuildRequest(BaseModel):
    project_id: str
    blueprint: Optional[Dict[str, Any]] = None


@router.post("/build/start")
async def start_build(request: StartBuildRequest):
    """
    Start a new MVP build.
    Accepts a project_id and optional blueprint.
    Returns immediately with a build_id; the build runs in background.
    """
    try:
        orchestrator = _get_orchestrator()
        result = await orchestrator.start_build(
            project_id=request.project_id,
            blueprint=request.blueprint,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/build/{build_id}/status")
async def get_build_status(build_id: str):
    """
    Get current build status with pipeline progress.
    Frontend polls this every 2 seconds.
    """
    try:
        orchestrator = _get_orchestrator()
        status = orchestrator.get_build_status(build_id)
        if status.get("status") == "unknown":
            raise HTTPException(status_code=404, detail="Build not found")
        return status
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/build/{build_id}/logs")
async def get_build_logs(build_id: str):
    """Get build log entries for the timeline."""
    try:
        orchestrator = _get_orchestrator()
        logs = orchestrator.get_build_logs(build_id)
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/build/{build_id}/stats")
async def get_build_stats(build_id: str):
    """
    Get the 'wow' stats after build completes.
    Shows pages created, APIs generated, tables, build time.
    """
    try:
        orchestrator = _get_orchestrator()
        stats = orchestrator.get_build_stats(build_id)
        return {"stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
