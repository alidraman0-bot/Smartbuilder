"""
Feature Gating Dependencies
FastAPI dependencies for enforcing subscription feature access on endpoints
"""

from fastapi import Depends, HTTPException, status
from typing import Callable
from app.api.deps import get_current_user
from app.services.billing_service import billing_service

def requires_feature(feature_name: str) -> Callable:
    """
    Dependency factory to check if organization has access to a specific feature.
    Usage:
        @router.post("/deploy", dependencies=[Depends(requires_feature("deployment"))])
    """
    async def _check_feature(
        org_id: str,  # Expects org_id in query params or body (this is a simplification)
        user: dict = Depends(get_current_user)
    ):
        # In a real app, you might need to extract org_id more robustly 
        # (e.g. from path params, or infer from user's current context)
        
        # Check access
        has_access = billing_service.check_feature_access(org_id, feature_name)
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "FEATURE_LOCKED",
                    "message": f"Upgrade to a higher plan to unlock '{feature_name}'",
                    "feature": feature_name
                }
            )
        
        return True
        
    return _check_feature
