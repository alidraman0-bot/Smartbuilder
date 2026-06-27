"""
Builder API — Institutional-Grade Business Plan & PRD Endpoints.

Routes:
  POST /api/business-plan   → Generate 25-section business plan
  POST /api/prd             → Generate 25-section PRD
  POST /api/generate-prd    → Combined BP + PRD pipeline
  GET  /api/business-plan/{run_id} → Retrieve cached business plan
  GET  /api/prd/{run_id}    → Retrieve cached PRD
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uuid
import json
import asyncio
import logging

from app.services.business_plan_service import business_plan_service
from app.services.prd_service import prd_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------

class BusinessPlanRequest(BaseModel):
    """Input contract for business plan generation."""
    idea: str = Field(..., min_length=5, description="Startup idea description")
    industry: str = Field(default="Technology", description="Industry vertical")
    target_market: str = Field(default="", description="Target market description")
    business_model: str = Field(default="SaaS", description="Business model type")
    region: str = Field(default="Global", description="Target region")
    depth: str = Field(default="investor", description="basic | advanced | investor")
    # Optional structured idea object (overrides 'idea' string)
    idea_details: Optional[Dict[str, Any]] = None
    research: Optional[Dict[str, Any]] = None


class PRDRequest(BaseModel):
    """Input contract for PRD generation."""
    product_name: str = Field(default="", description="Product name")
    idea: str = Field(..., min_length=5, description="Product idea description")
    platform: str = Field(default="web", description="web | mobile | saas | ai")
    complexity: str = Field(default="enterprise", description="simple | medium | enterprise")
    mode: str = Field(default="production", description="prototype | production")
    # Optional structured data
    idea_details: Optional[Dict[str, Any]] = None
    business_plan: Optional[Dict[str, Any]] = None


class CombinedBuildRequest(BaseModel):
    """Input for combined Business Plan + PRD generation."""
    idea: str = Field(..., min_length=5)
    industry: str = Field(default="Technology")
    target_market: str = Field(default="")
    business_model: str = Field(default="SaaS")
    region: str = Field(default="Global")
    depth: str = Field(default="investor")
    platform: str = Field(default="web")
    complexity: str = Field(default="enterprise")
    mode: str = Field(default="production")


class LegacyBusinessPlanRequest(BaseModel):
    """Legacy request format for backward compatibility."""
    idea: Dict[str, Any]
    research: Dict[str, Any] = {}
    run_id: Optional[str] = None


class LegacyPRDRequest(BaseModel):
    """Legacy request format for backward compatibility."""
    idea: Dict[str, Any]
    business_plan: Dict[str, Any] = {}
    run_id: Optional[str] = None


class BuilderDecisionRequest(BaseModel):
    """User approval/rejection for generated plans."""
    run_id: str
    decision: str  # "APPROVE" or "KILL"


# ---------------------------------------------------------------------------
# Streaming Status Helper
# ---------------------------------------------------------------------------

BUSINESS_PLAN_STAGES = [
    "Collecting market intelligence...",
    "Analyzing industry landscape...",
    "Detecting customer pain points...",
    "Sizing addressable market (TAM/SAM/SOM)...",
    "Analyzing competitors...",
    "Generating business strategy...",
    "Building financial forecasts...",
    "Calculating unit economics...",
    "Assessing risks & opportunities...",
    "Generating SWOT analysis...",
    "Evaluating investor attractiveness...",
    "Designing go-to-market strategy...",
    "Building growth strategy...",
    "Creating product roadmap...",
    "Generating AI strategic recommendations...",
    "Assembling investor-grade business plan...",
]

PRD_STAGES = [
    "Analyzing product idea...",
    "Defining product vision & objectives...",
    "Creating user personas...",
    "Writing user stories...",
    "Mapping user flows...",
    "Generating feature specifications...",
    "Designing system architecture...",
    "Planning database architecture...",
    "Defining API specifications...",
    "Establishing security requirements...",
    "Planning deployment architecture...",
    "Building engineering roadmap...",
    "Assembling enterprise-grade PRD...",
]


async def _stream_stages(stages: list, result_future: asyncio.Future):
    """Stream pipeline stages as Server-Sent Events."""
    for i, stage in enumerate(stages):
        yield f"data: {json.dumps({'stage': stage, 'progress': int((i / len(stages)) * 100)})}\n\n"
        await asyncio.sleep(0.3)

    # Wait for actual result
    try:
        result = await asyncio.wait_for(result_future, timeout=300)
        yield f"data: {json.dumps({'stage': 'Complete', 'progress': 100, 'result': result})}\n\n"
    except asyncio.TimeoutError:
        yield f"data: {json.dumps({'stage': 'Timeout', 'progress': 100, 'error': 'Generation timed out'})}\n\n"


# ---------------------------------------------------------------------------
# Business Plan Endpoints
# ---------------------------------------------------------------------------

@router.post("/business-plan")
async def generate_business_plan(request: BusinessPlanRequest):
    """
    Generate a 25-section investor-grade business plan.

    Depth levels:
      - basic: 10 core sections
      - advanced: 18 sections
      - investor: Full 25 sections (default)
    """
    try:
        run_id = f"BP-{uuid.uuid4().hex[:8]}"

        # Build idea object
        idea = request.idea_details or {
            "title": request.idea,
            "description": request.idea,
            "industry": request.industry,
            "target_market": request.target_market,
            "business_model": request.business_model,
            "region": request.region,
        }

        result = await business_plan_service.generate_business_plan(
            idea=idea,
            research=request.research or {},
            run_id=run_id,
            industry=request.industry,
            target_market=request.target_market,
            business_model=request.business_model,
            region=request.region,
            depth=request.depth,
        )
        return result
    except Exception as e:
        import traceback
        logger.error(f"Business plan generation failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Business plan generation failed: {str(e)}")


@router.post("/business-plan/legacy")
async def generate_business_plan_legacy(request: LegacyBusinessPlanRequest):
    """Legacy endpoint for backward compatibility with existing frontend."""
    try:
        result = await business_plan_service.generate_business_plan(
            idea=request.idea,
            research=request.research,
            run_id=request.run_id,
        )
        return result
    except Exception as e:
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Business plan generation failed: {str(e)}")


@router.get("/business-plan/{run_id}")
async def get_business_plan(run_id: str):
    """Retrieve a stored business plan by run_id."""
    result = business_plan_service.get_business_plan(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="Business plan not found")
    return result


# ---------------------------------------------------------------------------
# PRD Endpoints
# ---------------------------------------------------------------------------

@router.post("/prd")
async def generate_prd(request: PRDRequest):
    """
    Generate a 25-section enterprise-grade PRD.

    Complexity levels:
      - simple: 8 core sections
      - medium: 14 sections
      - enterprise: Full 25 sections (default)
    """
    try:
        run_id = f"PRD-{uuid.uuid4().hex[:8]}"

        idea = request.idea_details or {
            "title": request.product_name or request.idea[:80],
            "description": request.idea,
            "product_name": request.product_name,
            "platform": request.platform,
        }

        result = await prd_service.generate_prd(
            idea=idea,
            business_plan=request.business_plan,
            run_id=run_id,
            product_name=request.product_name,
            platform=request.platform,
            complexity=request.complexity,
            mode=request.mode,
        )
        return result
    except Exception as e:
        import traceback
        logger.error(f"PRD generation failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"PRD generation failed: {str(e)}")


@router.post("/prd/legacy")
async def generate_prd_legacy(request: LegacyPRDRequest):
    """Legacy endpoint for backward compatibility."""
    try:
        result = await prd_service.generate_prd(
            idea=request.idea,
            business_plan=request.business_plan,
            run_id=request.run_id,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PRD generation failed: {str(e)}")


@router.get("/prd/{run_id}")
async def get_prd(run_id: str):
    """Retrieve a stored PRD by run_id."""
    result = prd_service.get_prd(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="PRD not found")
    return result


# ---------------------------------------------------------------------------
# Combined Pipeline
# ---------------------------------------------------------------------------

@router.post("/generate-prd")
async def generate_combined(request: CombinedBuildRequest):
    """
    Combined pipeline: Business Plan → PRD.
    Generates a business plan first, then uses it as context for the PRD.
    """
    try:
        run_id = f"RUN-{uuid.uuid4().hex[:6]}"

        idea = {
            "title": request.idea[:120],
            "description": request.idea,
            "industry": request.industry,
            "target_market": request.target_market,
            "business_model": request.business_model,
            "region": request.region,
        }

        # Step 1: Generate Business Plan
        logger.info(f"[{run_id}] Starting business plan generation...")
        bp_result = await business_plan_service.generate_business_plan(
            idea=idea,
            research={},
            run_id=f"{run_id}-BP",
            industry=request.industry,
            target_market=request.target_market,
            business_model=request.business_model,
            region=request.region,
            depth=request.depth,
        )

        # Step 2: Generate PRD using business plan as context
        logger.info(f"[{run_id}] Starting PRD generation...")
        prd_result = await prd_service.generate_prd(
            idea=idea,
            business_plan=bp_result,
            run_id=f"{run_id}-PRD",
            product_name=request.idea[:80],
            platform=request.platform,
            complexity=request.complexity,
            mode=request.mode,
        )

        return {
            "run_id": run_id,
            "status": "COMPLETE",
            "strategy": bp_result,
            "prd": prd_result.get("prd", prd_result),
            "business_plan": bp_result.get("business_plan", bp_result),
            "confidence_score": min(
                bp_result.get("confidence_score", 0),
                prd_result.get("confidence_score", 0),
            ),
        }
    except Exception as e:
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Decision endpoint (approval gate)
# ---------------------------------------------------------------------------

@router.post("/decision")
async def handle_decision(request: BuilderDecisionRequest):
    """Record user approval/rejection for generated plans."""
    if request.decision == "APPROVE":
        return {"status": "success", "message": "Build authorized.", "run_id": request.run_id}
    else:
        return {"status": "success", "message": "Project halted.", "next_stage": "HALTED"}
