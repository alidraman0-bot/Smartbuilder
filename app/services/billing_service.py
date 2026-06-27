"""
Billing Service - Core billing operations
Handles subscription queries, feature gating, and billing events
"""

from typing import Optional, Dict, List, Any
from datetime import datetime
import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

# Feature Matrix (SYSTEM TRUTH)
PLAN_FEATURES = {
    "free": {
        "idea_clicks": 20,
        "ideas_per_click": 5,
        "mvp_builder": False,
        "freeze_build": False,
        "deployment": False,
        "team_access": False,
        "max_projects": 0,
    },
    "starter": {
        "idea_clicks": 200,
        "ideas_per_click": 10,
        "mvp_builder": True,
        "freeze_build": False,
        "deployment": False,
        "team_access": False,
        "max_projects": 1,
    },
    "pro": {
        "idea_clicks": -1, # Infinity
        "ideas_per_click": 10,
        "mvp_builder": True,
        "freeze_build": True,
        "deployment": True,
        "team_access": False,
        "max_projects": 5,
    },
    "team": {
        "idea_clicks": -1,
        "ideas_per_click": 10,
        "mvp_builder": True,
        "freeze_build": True,
        "deployment": True,
        "team_access": True,
        "max_projects": -1,
    },
}


import asyncio

import asyncio
import uuid
from datetime import datetime, timezone

class BillingService:
    """Service for managing billing and subscriptions"""
    
    def __init__(self):
        # Use service role client for billing operations (bypasses RLS when needed)
        self.supabase_service = None
        self.supabase = None
        try:
            if settings.SUPABASE_SERVICE_ROLE_KEY:
                self.supabase_service = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
            else:
                logger.warning("SUPABASE_SERVICE_ROLE_KEY not set - privileged operations will fail")
        except Exception as e:
            logger.error(f"Failed to create Supabase service client: {e}")

        # Regular client for user-facing operations
        try:
            self.supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        except Exception as e:
            logger.error(f"Failed to create Supabase anon client: {e}")
    
    async def get_subscription(self, org_id: str) -> Optional[Dict[str, Any]]:
        """Get current subscription for an organization (Async)"""
        try:
            client = self.supabase_service or self.supabase
            def _fetch():
                return client.table("subscriptions")\
                    .select("*")\
                    .eq("org_id", org_id)\
                    .limit(1)\
                    .execute()
            
            response = await asyncio.to_thread(_fetch)
            if not response.data:
                return None
            
            subscription = response.data[0]
            subscription['features'] = self.get_plan_features(subscription['plan'])
            return subscription
        except Exception as e:
            logger.error(f"Error fetching subscription: {e}")
            return None

    def get_plan_features(self, plan: str) -> Dict[str, Any]:
        """Get features for a specific plan from matrix (Sync)"""
        features = PLAN_FEATURES.get(plan.lower(), PLAN_FEATURES['free']).copy()
        features['plan'] = plan.lower()
        return features

    async def check_feature_access(self, org_id: str, feature: str) -> bool:
        """Check if an organization has access to a feature (Async)"""
        try:
            subscription = await self.get_subscription(org_id)
            if not subscription or subscription['status'] not in ['active', 'trialing', 'past_due']:
                features = self.get_plan_features("free")
            else:
                features = subscription.get('features', {})
            
            val = features.get(feature, False)
            return val if isinstance(val, bool) else (val != 0 if isinstance(val, int) else False)
        except Exception as e:
            logger.error(f"Feature check error: {e}")
            return False

    async def ensure_default_organization(self, user_id: str, email: str, full_name: Optional[str] = None) -> Optional[str]:
        """Ensure user has an organization, auto-create if missing (Async)"""
        try:
            if not self.supabase_service: return None
            
            # Check existing membership
            def _check():
                return self.supabase_service.table("org_members")\
                    .select("org_id")\
                    .eq("user_id", user_id)\
                    .limit(1)\
                    .execute()
            
            res = await asyncio.to_thread(_check)
            if res.data: return res.data[0]['org_id']

            # Create new
            org_name = f"{full_name or email.split('@')[0]}'s Organization"
            def _create():
                return self.supabase_service.table("organizations").insert({
                    "name": org_name,
                    "owner_id": user_id,
                    "plan": "starter"
                }).execute()
            
            new_org = await asyncio.to_thread(_create)
            if not new_org.data: return None
            
            org_id = new_org.data[0]['id']
            
            # Add member & initial subscription
            def _setup():
                self.supabase_service.table("org_members").insert({
                    "org_id": org_id, "user_id": user_id, "role": "owner"
                }).execute()
                self.supabase_service.table("subscriptions").insert({
                    "org_id": org_id, "plan": "free", "status": "active"
                }).execute()
                
            await asyncio.to_thread(_setup)
            return org_id
        except Exception as e:
            logger.error(f"Org provisioning error: {e}")
            return None

    async def get_billing_history(self, org_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch billing history (Async) — 5 s timeout to prevent ECONNRESET."""
        client = self.supabase_service or self.supabase
        if not client:
            logger.warning("No Supabase client available for billing history")
            return []
        try:
            def _fetch():
                return client.table("billing_events")\
                    .select("*")\
                    .eq("org_id", org_id)\
                    .order("created_at", desc=True)\
                    .limit(limit)\
                    .execute()
            res = await asyncio.wait_for(asyncio.to_thread(_fetch), timeout=5.0)
            return res.data or []
        except asyncio.TimeoutError:
            logger.warning(f"Billing history query timed out for org {org_id}")
            return []
        except Exception as e:
            logger.error(f"Billing history error: {e}")
            return []

    async def get_payment_method(self, org_id: str) -> Optional[Dict[str, Any]]:
        """Fetch default payment method (Async)"""
        try:
            client = self.supabase_service or self.supabase
            def _fetch():
                return client.table("payment_methods")\
                    .select("*")\
                    .eq("org_id", org_id)\
                    .eq("is_default", True)\
                    .limit(1)\
                    .execute()
            res = await asyncio.to_thread(_fetch)
            return res.data[0] if res.data else None
        except Exception as e:
            logger.error(f"Payment method error: {e}")
            return None

    async def update_subscription(self, org_id: str, updates: Dict[str, Any]) -> bool:
        """Update subscription (Async)"""
        try:
            if not self.supabase_service: return False
            updates['updated_at'] = datetime.utcnow().isoformat()
            def _update():
                return self.supabase_service.table("subscriptions")\
                    .update(updates)\
                    .eq("org_id", org_id)\
                    .execute()
            await asyncio.to_thread(_update)
            return True
        except Exception as e:
            logger.error(f"Subscription update error: {e}")
            return False

    async def log_billing_event(self, org_id: str, event_type: str, payload: Dict[str, Any], **kwargs) -> bool:
        """Log billing event (Async)"""
        try:
            if not self.supabase_service: return False
            data = {
                "org_id": org_id,
                "event_type": event_type,
                "provider": kwargs.get("provider", "paystack"),
                "amount": kwargs.get("amount"),
                "currency": kwargs.get("currency", "GHS"),
                "raw_payload": payload
            }
            def _log():
                return self.supabase_service.table("billing_events").insert(data).execute()
            await asyncio.to_thread(_log)
            return True
        except Exception as e:
            logger.error(f"Event logging error: {e}")
            return False

# Singleton instance
billing_service = BillingService()
