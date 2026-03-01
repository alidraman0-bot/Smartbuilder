from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from app.core.config import settings
from app.services.idea_service import idea_service
from app.services.rate_limiter_service import rate_limiter_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class GenerateRequest(BaseModel):
    mode: Literal["validate_idea", "discover"]
    user_input: Optional[str] = None
    project_id: Optional[str] = None  # Allow frontend to specify project

class PromoteRequest(BaseModel):
    idea_id: str

async def get_user_id_from_header(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extract user_id from authorization header (Supabase JWT).
    Returns None if no token or invalid token (anonymous usage).
    """
    if not authorization:
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        
        from app.core.auth import verify_supabase_token
        # This raises HTTPException if invalid, but we want to allow anonymous fallback for now?
        # Actually, if they send a token, they EXPECT to be logged in. 
        # If the token is invalid, we should probably ignore it and treat as anonymous, 
        # OR raise 401. 
        # Given the frontend behavior (if session exists, send token), invalid token should probably be 401?
        # But for robustness, let's log and fall back to anonymous to prevent 500s.
        try:
             user_data = await verify_supabase_token(token)
             return user_data.get("id")
        except HTTPException:
             # Token expired or invalid
             logger.warning(f"Invalid token provided in ideas API: {token[:10]}...")
             return None
        except Exception as e:
             logger.error(f"Error verifying token in ideas API: {e}")
             return None
             
    except Exception as e:
        logger.warning(f"Malformed authorization header: {authorization[:20]}...")
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
    Generate or validate startup ideas with production seed-based system.
    
    Features:
    - Atomic seed reservation (prevents race conditions)
    - Batch AI generation (80% cost reduction)
    - Rate limiting with plan-based tiers
    - Per-project + per-user uniqueness
    - Automatic retry with seed release
    """
    try:
        start_time = datetime.now()
        # Get project ID (from request or default)
        project_id = request.project_id or await get_default_project_id(user_id)
        
        # Check rate limits
        rate_check = await rate_limiter_service.check_rate_limit(
            user_id=user_id or "anonymous",
            project_id=project_id
        )
        
        if not rate_check["allowed"]:
            raise HTTPException(
                status_code=429, 
                detail={
                    "error": "Rate limit exceeded",
                    "reason": rate_check["reason"],
                    "usage_minute": rate_check["usage_minute"],
                    "usage_day": rate_check["usage_day"],
                    "limit_minute": rate_check["limit_minute"],
                    "limit_day": rate_check["limit_day"],
                    "plan_type": rate_check["plan_type"]
                }
            )
        
        # Determine organization ID
        from app.core.supabase import get_service_client
        svc_client = get_service_client()
        org_id = None
        try:
            if user_id:
                # Use org_members table which has org_id linked to user_id
                org_res = svc_client.table("org_members").select("org_id").eq("user_id", user_id).limit(1).execute()
                if org_res.data:
                    org_id = org_res.data[0].get("org_id")
        except Exception as e:
            logger.warning(f"Failed to lookup org for user {user_id}: {e}. Falling back to default.")
        
        if not org_id:
            # Fallback to null org_id for anonymous / org-less users
            org_id = None

        from app.services.billing_service import billing_service
        plan_features = billing_service.get_plan_features_for_org(org_id)
        ideas_per_click = plan_features.get("ideas_per_click", 5)

        # Generate ideas using production seed-based method
        logger.info(f"Generating {ideas_per_click} ideas for project {project_id[:8]}... (user: {user_id or 'anonymous'}, plan: {plan_features.get('plan', 'free')})")
        
        response = await idea_service.generate_ideas_with_seeds(
            project_id=project_id,
            user_id=user_id,
            mode=request.mode,
            user_input=request.user_input,
            count=5
        )
        
        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Generation completed in {duration}s. Response items: {len(response)}")
        
        # 5. Record Usage (Async)
        try:
             # Use background task in real world, awaiting here for simplicity/safety
             pass 
             # usage recording is inside record_usage but we need to call it if we want billing?
             # rate_limiter_service.record_usage(...) 
             # But idea_service handles its own logic? 
             # actually idea_service doesn't call record_usage. We should do it here if successful.
             if user_id and response:
                 await rate_limiter_service.record_usage(
                     user_id=user_id,
                     project_id=project_id,
                     ideas_generated=len(response)
                 )
        except Exception as billing_e:
             logger.error(f"Billing record failed: {billing_e}")

        return response

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = f"CRITICAL ERROR in generate_ideas API: {str(e)}"
        logger.error(f"{error_msg}\n{traceback.format_exc()}")
        # Return clearer error to client
        raise HTTPException(
            status_code=500, 
            detail={
                "error": str(e), 
                "message": "Internal generation failure. Please try again.",
                "traceback": traceback.format_exc() if settings.OPENAI_API_KEY or settings.GOOGLE_API_KEY else "Traceback hidden in production"
            }
        )

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

