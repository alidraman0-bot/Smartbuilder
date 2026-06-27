"""
Billing API - User-facing billing management endpoints
Handles subscription queries, upgrades, downgrades, and cancellations
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import logging

from app.api.deps import get_current_user
from app.services.billing_service import billing_service
from app.services.paystack_service import paystack_service

router = APIRouter()
logger = logging.getLogger(__name__)


# Request/Response Models
class UpgradeRequest(BaseModel):
    plan: str  # starter, pro, team, enterprise
    email: str
    org_id: str
    callback_url: Optional[str] = None


class DowngradeRequest(BaseModel):
    plan: str
    org_id: str


class CancelRequest(BaseModel):
    org_id: str
    reason: Optional[str] = None


# Available Plans (USD)
PLANS = [
    {
        "id": "free",
        "name": "Explorer (Free)",
        "price": 0,
        "currency": "USD",
        "interval": "forever",
        "features": {
            "idea_clicks": 20,
            "ideas_per_click": 5,
            "mvp_builder": False,
            "freeze_build": False,
            "deployment": False,
            "team_access": False,
            "max_projects": 0
        }
    },
    {
        "id": "starter",
        "name": "Builder (Starter)",
        "price": 2900, # $29.00 in cents
        "currency": "USD",
        "interval": "month",
        "features": {
            "idea_clicks": 200,
            "ideas_per_click": 10,
            "mvp_builder": True,
            "freeze_build": False,
            "deployment": False,
            "team_access": False,
            "max_projects": 1,
            "prd_generation": True,
            "github_connection": True,
            "pdf_exports": True
        }
    },
    {
        "id": "pro",
        "name": "Founder (Pro)",
        "price": 7900, # $79.00 in cents
        "currency": "USD",
        "interval": "month",
        "features": {
            "idea_clicks": -1,
            "ideas_per_click": 10,
            "mvp_builder": True,
            "freeze_build": True,
            "deployment": True,
            "team_access": False,
            "max_projects": 5,
            "prd_generation": True,
            "github_connection": True,
            "pdf_exports": True,
            "custom_domain": True
        }
    },
    {
        "id": "team",
        "name": "Team",
        "price": 19900, # $199.00 in cents
        "currency": "USD",
        "interval": "month",
        "features": {
            "idea_clicks": -1,
            "ideas_per_click": 10,
            "mvp_builder": True,
            "freeze_build": True,
            "deployment": True,
            "team_access": True,
            "max_projects": -1,
            "prd_generation": True,
            "github_connection": True,
            "pdf_exports": True,
            "custom_domain": True,
            "analytics_dashboard": True
        }
    }
]


@router.post("/ensure-org")
async def ensure_organization(
    user: dict = Depends(get_current_user)
):
    try:
        user_id = user.get("id")
        email = user.get("email")
        full_name = user.get("user_metadata", {}).get("full_name")
        
        logger.info(f"Ensuring organization for user {user_id} ({email})")
        org_id = await billing_service.ensure_default_organization(user_id, email, full_name)
        
        if not org_id:
            logger.error(f"Failed to ensure organization for user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to verify or create organization")
            
        return {"org_id": org_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ensuring organization: {e}")
        raise HTTPException(status_code=500, detail="Organization verification failed")


@router.get("/subscription")
async def get_subscription(
    org_id: str,
    user: dict = Depends(get_current_user)
):
    try:
        subscription = await billing_service.get_subscription(org_id)
        
        if not subscription:
            return {
                "org_id": org_id,
                "plan": "free",
                "status": "active",
                "features": billing_service.get_plan_features("free")
            }
        
        return subscription
        
    except Exception as e:
        logger.error(f"Error fetching subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch subscription")


@router.get("/ping")
async def ping_billing():
    return {"status": "ok", "message": "Billing API is reachable"}


@router.get("/plans")
async def get_plans():
    return {"plans": PLANS}


@router.get("/features")
async def get_features(
    org_id: str,
    user: dict = Depends(get_current_user)
):
    try:
        subscription = await billing_service.get_subscription(org_id)
        
        if not subscription:
            features = billing_service.get_plan_features("free")
        else:
            features = subscription.get("features", {})
        
        return {
            "org_id": org_id,
            "plan": subscription.get("plan", "free") if subscription else "free",
            "features": features
        }
        
    except Exception as e:
        logger.error(f"Error fetching features: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch features")


@router.post("/upgrade")
async def upgrade_plan(
    request: UpgradeRequest,
    user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Upgrade Request: user_id={user.get('id')}, email={request.email}, plan={request.plan}, org_id={request.org_id}")
        
        if not request.email or "@" not in request.email:
            logger.warning(f"Invalid email provided for upgrade: {request.email}")
            raise HTTPException(status_code=400, detail="A valid email address is required for payment initialization.")
            
        try:
            # Get amount for plan
            amount_ghs = paystack_service.get_plan_amount(request.plan)
            
            # Initialize transaction
            transaction = await paystack_service.initialize_transaction(
                email=request.email.strip(),
                amount_usd=amount_ghs, # The service converts this internally or uses it directly
                plan=request.plan,
                org_id=request.org_id,
                callback_url=request.callback_url
            )
            
            if not transaction:
                raise HTTPException(status_code=500, detail="Failed to initialize payment")
            
            return {
                "authorization_url": transaction.get("authorization_url"),
                "access_code": transaction.get("access_code"),
                "reference": transaction.get("reference"),
                "amount_ghs": transaction.get("amount_ghs")
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error upgrading plan: {e}")
            raise HTTPException(status_code=500, detail="Failed to upgrade plan")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Outer error upgrading plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to upgrade plan")


@router.get("/payment-method")
async def get_payment_method(
    org_id: str,
    user: dict = Depends(get_current_user)
):
    try:
        payment_method = await billing_service.get_payment_method(org_id)
        
        if not payment_method:
            return {"message": "No payment method on file"}
        
        return {
            "card_brand": payment_method.get("card_brand"),
            "last4": payment_method.get("last4"),
            "exp_month": payment_method.get("exp_month"),
            "exp_year": payment_method.get("exp_year"),
            "is_default": payment_method.get("is_default", True)
        }
    except Exception as e:
        logger.error(f"Error fetching payment method: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payment method")


@router.get("/history")
async def get_billing_history(
    org_id: str,
    limit: int = 50,
    user: dict = Depends(get_current_user)
):
    try:
        history = await billing_service.get_billing_history(org_id, limit)
        
        formatted_history = []
        for event in history:
            formatted_history.append({
                "id": event.get("id"),
                "date": event.get("created_at"),
                "type": event.get("event_type"),
                "amount": event.get("amount"),
                "currency": event.get("currency", "USD"),
                "status": _get_event_status(event.get("event_type")),
            })
        
        return {"history": formatted_history}
    except Exception as e:
        logger.error(f"Error fetching billing history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch billing history")


def _get_event_status(event_type: str) -> str:
    status_map = {
        "payment_succeeded": "paid",
        "payment_failed": "failed",
        "subscription_created": "paid",
        "subscription_cancelled": "cancelled",
        "subscription_updated": "paid"
    }
    return status_map.get(event_type, "pending")


@router.get("/check-feature")
async def check_feature(
    org_id: str,
    feature: str,
    user: dict = Depends(get_current_user)
):
    try:
        has_access = await billing_service.check_feature_access(org_id, feature)
        return {
            "org_id": org_id,
            "feature": feature,
            "has_access": has_access
        }
    except Exception as e:
        logger.error(f"Error checking feature access: {e}")
        raise HTTPException(status_code=500, detail="Failed to check feature access")
