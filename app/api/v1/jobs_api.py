"""
Job Queue API — endpoints for submitting async jobs and polling results.

Frontend flow:
  1. POST /api/v1/jobs/submit  → returns {job_id}
  2. GET  /api/v1/jobs/{job_id}/status → poll until completed
  3. GET  /api/v1/jobs/{job_id}/result → fetch final data
"""

import logging
from typing import Optional, Any, Dict

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from app.core.job_queue import job_queue
from app.core.ai_cache import get_cache_stats

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class JobSubmitRequest(BaseModel):
    task: str = Field(
        ...,
        description="Pipeline task name: investment_brief, market_evidence, opportunity_score, idea_discovery"
    )
    payload: Dict[str, Any] = Field(
        ...,
        description="Task-specific payload (e.g. idea_data, idea, mode)"
    )


class JobSubmitResponse(BaseModel):
    job_id: str
    task: str
    status: str = "queued"
    message: str = "Job submitted successfully"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/jobs/submit", response_model=JobSubmitResponse)
async def submit_job(request: JobSubmitRequest):
    """
    Submit a heavy AI pipeline task to the background queue.
    Returns immediately with a job_id for polling.
    """
    try:
        # Ensure orchestrator handlers are registered
        import app.core.pipeline_orchestrator  # noqa: F401

        job_id = await job_queue.enqueue(request.task, request.payload)
        return JobSubmitResponse(
            job_id=job_id,
            task=request.task,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Job submit failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    """
    Poll the status of a submitted job.
    """
    status = job_queue.get_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return status


@router.get("/jobs/{job_id}/result")
async def get_job_result(job_id: str):
    """
    Retrieve the result of a completed job.
    Returns 202 if still running, 200 with result if completed, 500 if failed.
    """
    status = job_queue.get_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    if status["status"] == "completed":
        return {"status": "completed", "result": status["result"]}
    elif status["status"] == "failed":
        raise HTTPException(
            status_code=500,
            detail={"status": "failed", "error": status.get("error")}
        )
    else:
        # Still queued or running
        return {
            "status": status["status"],
            "progress": status.get("progress", 0),
            "message": "Job is still processing. Poll again.",
        }


@router.get("/jobs")
async def list_jobs(status: Optional[str] = None, limit: int = 20):
    """
    List recent jobs, optionally filtered by status.
    """
    return job_queue.list_jobs(status=status, limit=limit)


@router.get("/jobs/stats")
async def queue_stats():
    """
    Return queue and cache health metrics.
    """
    return {
        "queue": job_queue.get_queue_stats(),
        "cache": get_cache_stats(),
    }
