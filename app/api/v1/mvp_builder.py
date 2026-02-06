"""
MVP Builder API Routes
Endpoints for managing the MVP Builder state machine
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.mvp_builder_service import MvpBuilderService, BuildMode

router = APIRouter()
mvp_builder_service = MvpBuilderService()


class CreateSessionRequest(BaseModel):
    run_id: str
    prd: Optional[Dict[str, Any]] = None
    research: Optional[Dict[str, Any]] = None
    idea: Optional[str] = None


class SubmitIdeaRequest(BaseModel):
    idea: str


class IterateRequest(BaseModel):
    prompt: str
    build_mode: Optional[str] = None


@router.post("/mvp-builder/init")
async def create_builder_session(request: CreateSessionRequest):
    """Create a new MVP Builder session"""
    try:
        session = mvp_builder_service.create_session(
            run_id=request.run_id,
            prd=request.prd,
            research=request.research,
            idea=request.idea
        )
        
        # If initialized with idea, we treat it as S1 submission and transition to S2
        if request.idea and not request.prd:
             await mvp_builder_service.submit_idea(session.session_id, request.idea)
        
        return {
            "session_id": session.session_id,
            "state": session.state.value,
            "message": "Builder session created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mvp-builder/{session_id}/state")
async def get_session_state(session_id: str):
    """Get current state of a builder session"""
    try:
        state = mvp_builder_service.get_session_state(session_id)
        
        if state.get("state") == "S0":
            raise HTTPException(status_code=404, detail="Session not found")
        
        return state
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mvp-builder/{session_id}/submit-idea")
async def submit_idea(session_id: str, request: SubmitIdeaRequest):
    """
    S1 → S2: Submit idea and start build process
    """
    try:
        session = await mvp_builder_service.submit_idea(session_id, request.idea)
        
        return {
            "session_id": session.session_id,
            "state": session.state.value,
            "message": "Build started"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mvp-builder/{session_id}/iterate")
async def iterate_build(session_id: str, request: IterateRequest):
    """
    S4: Iterate on stable build
    """
    try:
        build_mode = None
        if request.build_mode:
            build_mode = BuildMode(request.build_mode)
        
        session = await mvp_builder_service.iterate(
            session_id=session_id,
            prompt=request.prompt,
            build_mode=build_mode
        )
        
        return {
            "session_id": session.session_id,
            "state": session.state.value,
            "build_version": session.build_version,
            "message": "Iteration complete"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mvp-builder/{session_id}/freeze")
async def freeze_build(session_id: str):
    """
    S4 → S6: Freeze build (make immutable)
    """
    try:
        session = await mvp_builder_service.freeze(session_id)
        
        return {
            "session_id": session.session_id,
            "state": session.state.value,
            "message": "Build frozen and ready for deployment"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mvp-builder/{session_id}/revert")
async def revert_build(session_id: str):
    """Revert to last stable snapshot"""
    try:
        session = await mvp_builder_service.revert(session_id)
        
        return {
            "session_id": session.session_id,
            "state": session.state.value,
            "build_version": session.build_version,
            "message": "Reverted to last stable version"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mvp-builder/{session_id}/logs")
async def get_build_logs(session_id: str):
    """Get build logs for a session"""
    try:
        session = mvp_builder_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "logs": session.logs,
            "timeline": [
                {
                    "timestamp": event.timestamp,
                    "message": event.message,
                    "type": event.type
                }
                for event in session.timeline
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
