import asyncio
from fastapi import APIRouter, HTTPException, Depends, Header, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from app.core.config import settings
from app.services.idea_service import idea_service
from app.services.rate_limiter_service import rate_limiter_service
import logging
from app.workflows.discovery.idea_pipeline import idea_pipeline
from app.workflows.discovery.signal_pipeline import signal_pipeline
from app.models.investment_brief import IdeaDetailsRequest, InvestmentBriefResponse
from app.services.investment_brief_service import investment_brief_service

logger = logging.getLogger(__name__)
router = APIRouter()
discovery_engine_router = APIRouter()

class GenerateRequest(BaseModel):
    mode: Literal["validate_idea", "discover"]
    user_input: Optional[str] = None
    project_id: Optional[str] = None  # Allow frontend to specify project

class PromoteRequest(BaseModel):
    idea_id: str

async def get_user_id_from_header(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extract user_id from authorization header (Supabase JWT).
    """
    if not authorization:
        return None

    try:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None
        
        token = parts[1]
        from app.core.auth import verify_supabase_token
        
        try:
             user_data = await verify_supabase_token(token)
             return user_data.get("id")
        except HTTPException as he:
             # Standard auth failure (expired/invalid)
             if he.status_code == 401:
                 logger.info(f"Auth Session: Expired or invalid token (falling back to anonymous)")
             else:
                 logger.warning(f"Auth Error: {he.detail}")
             return None
        except Exception as e:
             logger.error(f"Unexpected Auth Error: {e}")
             return None
             
    except Exception as e:
        logger.debug(f"Malformed auth header ignored: {e}")
        return None

async def get_default_project_id(user_id: Optional[str] = None) -> str:
    """
    Get or create a default project for the user.
    In production, this should be user-specific.
    """
    from app.core.supabase import get_service_client
    svc_client = get_service_client()
    
    try:
        # Try to get first project
        proj_res = svc_client.table("projects").select("project_id").limit(1).execute()
        if proj_res.data:
            return str(proj_res.data[0]["project_id"])
        
        # Create default project if none exists
        logger.info("Creating Default Genesis project")
        import uuid
        default_id = str(uuid.uuid4())
        new_proj = svc_client.table("projects").insert({
            "project_id": default_id,
            "name": "Default Genesis",
            "framework": "Next.js",
            "status": "active"
        }).execute()
        
        if new_proj.data:
            return str(new_proj.data[0]["project_id"])
        
        # If insert was blocked but didn't raise (e.g. RLS), return fallback
        logger.warning("Project insert returned no data (likely RLS). Using fallback ID.")
        import uuid
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, "smartbuilder.default"))
        
    except Exception as e:
        logger.error(f"Failed to get/create project: {e}")
        # Return a deterministic fallback ID
        import uuid
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, "smartbuilder.default"))

@router.post("/generate")
async def generate_ideas(
    request: GenerateRequest,
    user_id: Optional[str] = Depends(get_user_id_from_header)
):
    """
    Generate or validate startup ideas with the new Intelligence Discovery Engine.
    """
    try:
        # Get project ID (from request or default)
        project_id = request.project_id or await get_default_project_id(user_id)
        
        # Check rate limits
        rate_check = await rate_limiter_service.check_rate_limit(
            user_id=user_id or "anonymous",
            project_id=project_id
        )
        
        if not rate_check["allowed"]:
            raise HTTPException(status_code=429, detail={"error": "Rate limit exceeded", "reason": rate_check["reason"]})

        # Use the new IdeaPipeline for strategic discovery/validation
        mode = "deep" if request.mode == "discover" else "basic"
        response = await idea_pipeline.run_discovery(
            seed_idea=request.user_input or "New startup idea",
            mode=mode
        )
        
        ideas = response.get("ideas", [])
        
        # Record Usage
        if user_id and ideas:
            await rate_limiter_service.record_usage(
                user_id=user_id,
                project_id=project_id,
                ideas_generated=len(ideas)
            )

        return ideas

    except Exception as e:
        logger.error(f"Generation failure: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = f"CRITICAL ERROR in generate_ideas API: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail={"error": str(e), "message": "Internal generation failure."}
        )

class DiscoveryRequest(BaseModel):
    project_id: Optional[str] = None

@router.get("/discovery")
async def discovery_ideas_status():
    """
    Check the status of the Intelligence Discovery Engine.
    """
    return {
        "status": "operational",
        "engine": "Intelligence Discovery V2",
        "capabilities": ["Signal Analysis", "Venture Scoring", "Deep Market Scan"],
        "message": "Discovery engine is online. Use POST to trigger a deep scan."
    }

@router.post("/discovery")
async def discovery_ideas(
    request: DiscoveryRequest,
    user_id: Optional[str] = Depends(get_user_id_from_header)
):
    """
    INTELLIGENCE DISCOVERY: Real-world signal based opportunity detection.
    """
    try:
        # Use a generic seed to trigger discovery across live signals
        # Wrap in a timeout to prevent socket hang-ups when AI providers are unreachable
        logger.info("Discovery API: Starting deep discovery scan...")
        start_time = asyncio.get_event_loop().time()
        
        response = await asyncio.wait_for(
            idea_pipeline.run_discovery(
                seed_idea="emerging startup opportunities in SaaS and AI",
                mode="deep"
            ),
            timeout=90.0  # Increased to 90s to accommodate deep signal analysis + parallel structuring
        )
        
        duration = asyncio.get_event_loop().time() - start_time
        logger.info(f"Discovery API: Completed deep discovery in {duration:.2f}s")
        
        ideas = response.get("ideas", [])
        return ideas
    except Exception as e:
        import traceback
        error_str = str(e)
        duration = asyncio.get_event_loop().time() - start_time if 'start_time' in locals() else 0
        
        # Check if it's an expected issue to give a better warning without a full stack trace
        is_timeout = isinstance(e, (TimeoutError, asyncio.TimeoutError))
        is_quota = any(x in error_str.lower() for x in ["quota", "429", "balance", "402", "credit"])
        
        if is_timeout:
            logger.error(f"Discovery API timed out after {duration:.2f}s (providers too slow).")
            raise HTTPException(status_code=504, detail="Unable to fetch AI data. Please try again.")
        elif is_quota:
            logger.error(f"Discovery API quota/balance exceeded: {error_str}")
            raise HTTPException(status_code=402, detail="Unable to fetch AI data. AI Service Quota Exhausted.")
        else:
            logger.error(f"Discovery API failed after {duration:.2f}s: {e}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Unable to fetch AI data. Please try again.")

from app.api.supervisor import runner
import asyncio

@router.post("/promote")
async def promote_idea(request: PromoteRequest):
    """
    Promote an idea to the Research stage.
    """
    result = idea_service.promote_idea(request.idea_id)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    
    # Trigger the research and planning phase for the selected idea
    # We use create_task to run it in the background so the API returns immediately
    asyncio.create_task(runner.start_research_from_idea(result["idea"]))
    
    return result

# --- DISCOVERY ENGINE ENDPOINTS ---

class IdeaDiscoveryRequest(BaseModel):
    idea: str
    mode: Literal["basic", "deep"] = "basic"

@discovery_engine_router.post("/generate-ideas")
async def generate_discovery_ideas(
    request: IdeaDiscoveryRequest,
    user_id: Optional[str] = Depends(get_user_id_from_header)
):
    """
    POST /api/generate-ideas
    Transform User Idea -> Internet Signals -> Structured Intelligence -> Validated Opportunities
    """
    try:
        return await idea_pipeline.run_discovery(
            seed_idea=request.idea,
            mode=request.mode
        )
    except Exception as e:
        logger.error(f"Discovery generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@discovery_engine_router.get("/live-signals")
async def get_live_signals():
    """
    GET /api/live-signals
    Power the right-side UI panel with real-time intelligence.
    """
    try:
        signals = await signal_pipeline.fetch_live_signals()
        return {"signals": signals}
    except Exception as e:
        logger.error(f"Failed to fetch live signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@discovery_engine_router.post("/idea-details", response_model=InvestmentBriefResponse)
async def get_idea_details(
    request: IdeaDetailsRequest,
    user_id: Optional[str] = Depends(get_user_id_from_header)
):
    """
    POST /api/idea-details
    Generate deep, structured, investor-grade analysis for any startup idea.
    """
    try:
        return await investment_brief_service.generate_brief(
            idea_data=request.idea,
            mode=request.mode,
            user_id=user_id
        )
    except Exception as e:
        logger.error(f"Failed to generate idea details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/debug/history")
async def debug_history():
    """
    Debug endpoint to see what's in the idea history.
    """
    return {
        "instance_id": idea_service.instance_id,
        "history_keys": list(idea_service.history.keys()),
        "history_count": len(idea_service.history)
    }

@router.get("/debug/rate-limits")
async def debug_rate_limits(user_id: Optional[str] = Depends(get_user_id_from_header)):
    """
    Debug endpoint to check rate limit status.
    """
    rate_check = await rate_limiter_service.check_rate_limit(
        user_id=user_id or "anonymous"
    )
    return rate_check

