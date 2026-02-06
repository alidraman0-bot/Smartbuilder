from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.deployment_service import deployment_service
from app.services.mvp_service import mvp_service

router = APIRouter()


class DeploymentRequest(BaseModel):
    run_id: str
    build_id: str


class RollbackRequest(BaseModel):
    reason: str


@router.post("/start")
async def start_deployment(request: DeploymentRequest):
    """
    Initiate deployment from completed build.
    
    Prerequisites:
    - Build must be in COMPLETE status
    - Build artifacts must be available
    
    Returns:
        Deployment metadata and initial status
    """
    # Validate build exists and is complete
    build = mvp_service.get_build_status(request.run_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    if build["status"] != "COMPLETE":
        raise HTTPException(
            status_code=400, 
            detail=f"Build must be COMPLETE before deployment. Current status: {build['status']}"
        )
    
    # Check if deployment already in progress for this build
    existing_deployments = deployment_service.get_deployment_history(request.run_id)
    for dep in existing_deployments:
        if dep.get("status") == "DEPLOYING":
            raise HTTPException(
                status_code=400,
                detail="Deployment already in progress for this build"
            )
    
    # Start deployment
    deployment = await deployment_service.start_deployment(
        run_id=request.run_id,
        build_id=request.build_id
    )
    
    return deployment


@router.get("/{deployment_id}/status")
async def get_deployment_status(deployment_id: str):
    """
    Get current deployment status, logs, and metadata.
    
    Returns:
        Complete deployment state including:
        - Current stage
        - Stage progress
        - Live logs
        - Errors (if any)
        - Deployment URL (when available)
    """
    deployment = deployment_service.get_deployment_status(deployment_id)
    
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    
    return deployment


@router.post("/{deployment_id}/rollback")
async def rollback_deployment(deployment_id: str, request: RollbackRequest):
    """
    Rollback deployment to previous version.
    
    Prerequisites:
    - Previous deployment must exist
    - Current deployment must be in LIVE or FAILED status
    
    Returns:
        Rollback status and previous version info
    """
    deployment = deployment_service.get_deployment_status(deployment_id)
    
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    
    if deployment["status"] not in ["LIVE", "FAILED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot rollback deployment in {deployment['status']} status"
        )
    
    if not deployment.get("rollback_available"):
        raise HTTPException(
            status_code=400,
            detail="No previous deployment available for rollback"
        )
    
    try:
        result = await deployment_service.rollback_deployment(
            deployment_id=deployment_id,
            reason=request.reason
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history/{run_id}")
async def get_deployment_history(run_id: str):
    """
    Get deployment history for a run.
    
    Returns:
        List of all deployments for the run, ordered by creation time
    """
    history = deployment_service.get_deployment_history(run_id, type="run")
    
    return {
        "run_id": run_id,
        "total_deployments": len(history),
        "deployments": history
    }
