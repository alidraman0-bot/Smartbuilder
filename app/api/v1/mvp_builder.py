"""
MVP Builder API — REST endpoints for the autonomous build pipeline.

Endpoints:
  POST /mvp-builder/build          — Full 8-step pipeline from idea
  POST /mvp-builder/improve        — Targeted improvement on existing build
  GET  /mvp-builder/{sid}/state    — Session state + pipeline steps
  GET  /mvp-builder/{sid}/logs     — Build timeline / logs
  GET  /mvp-builder/{sid}/files    — Generated files
  GET  /mvp-builder/{sid}/pipeline — Pipeline step statuses
  POST /mvp-builder/{sid}/freeze   — Freeze build for deployment
  POST /mvp-builder/{sid}/revert   — Revert to last stable version
"""

import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.mvp_builder_service import MvpBuilderService

router = APIRouter()
mvp_service = MvpBuilderService()


# ============================================================================
# Request Models
# ============================================================================

class BuildMVPRequest(BaseModel):
    idea: str = Field(..., min_length=5, description="The application idea to build")
    run_id: Optional[str] = None

class ImproveMVPRequest(BaseModel):
    instruction: str = Field(..., min_length=5, description="What to improve")

class FreezeRequest(BaseModel):
    environment: str = "production"


# ============================================================================
# Build Pipeline
# ============================================================================

@router.post("/mvp-builder/build")
async def build_mvp(request: BuildMVPRequest, background_tasks: BackgroundTasks):
    """
    Start the full 8-step autonomous build pipeline.
    Returns immediately with session_id; build runs in background.
    """
    try:
        session = mvp_service.create_session(run_id=request.run_id, idea=request.idea)

        # Run heavy pipeline in background
        background_tasks.add_task(mvp_service.build_mvp, session.session_id, request.idea)

        return {
            "session_id": session.session_id,
            "run_id": session.run_id,
            "state": session.state.value,
            "message": "Build pipeline started — poll /state for progress",
            "pipeline_steps": session.pipeline_steps,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Legacy endpoint - same as build but different path for backwards compat
@router.post("/mvp-builder/init")
async def init_builder_session(request: BuildMVPRequest, background_tasks: BackgroundTasks):
    """Legacy init endpoint — delegates to build_mvp."""
    return await build_mvp(request, background_tasks)


# ============================================================================
# Improve Pipeline
# ============================================================================

@router.post("/mvp-builder/{session_id}/improve")
async def improve_mvp(session_id: str, request: ImproveMVPRequest, background_tasks: BackgroundTasks):
    """
    Trigger targeted improvement on an existing build.
    """
    session = mvp_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    background_tasks.add_task(mvp_service.improve_mvp, session_id, request.instruction)

    return {
        "session_id": session_id,
        "state": "S3",
        "message": "Improvement pipeline started",
    }


# ============================================================================
# State & Pipeline Queries
# ============================================================================

@router.get("/mvp-builder/{session_id}/state")
async def get_session_state(session_id: str):
    """Get full session state including pipeline step statuses."""
    state = mvp_service.get_session_state(session_id)
    if state.get("state") == "S0":
        raise HTTPException(status_code=404, detail="Session not found")
    return state


@router.get("/mvp-builder/{session_id}/pipeline")
async def get_pipeline_steps(session_id: str):
    """Get pipeline step statuses only."""
    session = mvp_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session_id,
        "state": session.state.value,
        "steps": session.pipeline_steps,
    }


@router.get("/mvp-builder/{session_id}/logs")
async def get_build_logs(session_id: str):
    """Get build timeline and logs."""
    session = mvp_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "timeline": [e.to_dict() for e in session.timeline],
        "last_error": session.last_error,
    }


@router.get("/mvp-builder/{session_id}/files")
async def get_generated_files(session_id: str):
    """Get all generated files for a session."""
    session = mvp_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session_id,
        "project_name": session.project_name,
        "files": session.files,
        "total_files": len(session.files),
    }


# ============================================================================
# Freeze / Revert
# ============================================================================

@router.post("/mvp-builder/{session_id}/freeze")
async def freeze_build(session_id: str):
    """Freeze the build — make it immutable."""
    try:
        session = await mvp_service.freeze(session_id)
        return {
            "session_id": session.session_id,
            "state": session.state.value,
            "message": "Build frozen and ready for deployment",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/mvp-builder/{session_id}/revert")
async def revert_build(session_id: str):
    """Revert to last stable snapshot."""
    try:
        session = await mvp_service.revert(session_id)
        return {
            "session_id": session.session_id,
            "state": session.state.value,
            "build_version": session.build_version,
            "message": "Reverted to last stable version",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# Scaffold / Deploy Integration
# ============================================================================

@router.get("/mvp-builder/{session_id}/scaffold")
async def get_scaffold(session_id: str):
    """Return the project scaffold metadata."""
    session = mvp_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session_id,
        "project_name": session.project_name,
        "scaffold": session.scaffold,
    }


@router.get("/mvp-builder/sessions")
async def list_sessions():
    """List all active build sessions."""
    sessions = []
    for sid, session in mvp_service.sessions.items():
        sessions.append({
            "session_id": sid,
            "project_name": session.project_name,
            "state": session.state.value,
            "preview_url": session.preview_url,
            "created_at": session.created_at.isoformat(),
        })
    return {"sessions": sessions, "count": len(sessions)}
