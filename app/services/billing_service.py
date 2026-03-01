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


class BillingService:
    """Service for managing billing and subscriptions"""
    
    def __init__(self):
        # Use service role client for billing operations (bypasses RLS when needed)
        if settings.SUPABASE_SERVICE_ROLE_KEY:
            self.supabase_service = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
        else:
            self.supabase_service = None
            logger.warning("SUPABASE_SERVICE_ROLE_KEY not set - webhook operations will fail")
        
        # Regular client for user-facing operations
        self.supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
    
    def get_subscription(self, org_id: str) -> Optional[Dict[str, Any]]:
        """
        Get current subscription for an organization
        Returns subscription with plan features merged in
        """
        try:
            # Fetch subscription
            response = self.supabase.table("subscriptions")\
                .select("*")\
                .eq("org_id", org_id)\
                .limit(1)\
                .execute()
            
            if not response.data:
                return None
            
            subscription = response.data[0]
            
            # Fetch plan features
            features = self.get_plan_features(subscription['plan'])
            subscription['features'] = features
            
            return subscription
            
        except Exception as e:
            logger.error(f"Error fetching subscription for org {org_id}: {e}")
            return None
    
    def get_plan_features(self, plan: str) -> Dict[str, Any]:
        """Get features for a specific plan from matrix"""
        features = PLAN_FEATURES.get(plan.lower(), PLAN_FEATURES['free']).copy()
        features['plan'] = plan.lower()
        return features

    def get_plan_features_for_org(self, org_id: str) -> Dict[str, Any]:
        """Get plan features for an organization (includes default free)"""
        try:
            sub = self.get_subscription(org_id)
            plan = sub.get("plan", "free") if sub else "free"
            return self.get_plan_features(plan)
        except Exception as e:
            logger.error(f"Error fetching features for plan: {e}")
            # Return default free plan features instead of empty dict
            return self.get_plan_features("free")
    
    def check_feature_access(self, org_id: str, feature: str) -> bool:
        """
        Check if an organization has access to a specific feature
        Returns True if feature is enabled, False otherwise
        """
        try:
            subscription = self.get_subscription(org_id)
            
            if not subscription:
                # No subscription = free plan
                return PLAN_FEATURES['free'].get(feature, False)
            
            # Check if subscription is active or in grace period (past_due)
            if subscription['status'] not in ['active', 'trialing', 'past_due']:
                # Inactive subscription = no premium features
                return False
            
            features = subscription.get('features', {})
            feature_value = features.get(feature, False)
            
            # Handle boolean features
            if isinstance(feature_value, bool):
                return feature_value
            
            # Handle numeric limits (-1 means unlimited)
            if isinstance(feature_value, int):
                return feature_value != 0
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking feature access for org {org_id}, feature {feature}: {e}")
            return False
    
    def get_billing_history(self, org_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get billing event history for an organization"""
        try:
            response = self.supabase.table("billing_events")\
                .select("*")\
                .eq("org_id", org_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Error fetching billing history for org {org_id}: {e}")
            return []
    
    def get_payment_method(self, org_id: str) -> Optional[Dict[str, Any]]:
        """Get payment method for an organization"""
        try:
            response = self.supabase.table("payment_methods")\
                .select("*")\
                .eq("org_id", org_id)\
                .eq("is_default", True)\
                .limit(1)\
                .execute()
            
            return response.data[0] if response.data else None
            
        except Exception as e:
            logger.error(f"Error fetching payment method for org {org_id}: {e}")
            return None
    
    def log_billing_event(
        self,
        org_id: str,
        event_type: str,
        payload: Dict[str, Any],
        amount: Optional[int] = None,
        currency: str = "NGN",
        provider: str = "paystack",
        subscription_id: Optional[str] = None
    ) -> bool:
        """
        Log a billing event to the immutable ledger
        Uses service role to bypass RLS
        """
        try:
            if not self.supabase_service:
                logger.error("Cannot log billing event - service role not configured")
                return False
            
            event_data = {
                "org_id": org_id,
                "event_type": event_type,
                "provider": provider,
                "amount": amount,
                "currency": currency,
                "raw_payload": payload,
                "subscription_id": subscription_id
            }
            
            self.supabase_service.table("billing_events").insert(event_data).execute()
            logger.info(f"Logged billing event {event_type} for org {org_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error logging billing event: {e}")
            return False
    
    def update_subscription(
        self,
        org_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """
        Update subscription details
        Uses service role to bypass RLS
        """
        try:
            if not self.supabase_service:
                logger.error("Cannot update subscription - service role not configured")
                return False
            
            updates['updated_at'] = datetime.utcnow().isoformat()
            
            self.supabase_service.table("subscriptions")\
                .update(updates)\
                .eq("org_id", org_id)\
                .execute()
            
            logger.info(f"Updated subscription for org {org_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating subscription for org {org_id}: {e}")
            return False
    
    def create_subscription(self, subscription_data: Dict[str, Any]) -> Optional[str]:
        """
        Create a new subscription
        Uses service role to bypass RLS
        """
        try:
            if not self.supabase_service:
                logger.error("Cannot create subscription - service role not configured")
                return None
            
            response = self.supabase_service.table("subscriptions")\
                .insert(subscription_data)\
                .execute()
            
            if response.data:
                logger.info(f"Created subscription for org {subscription_data['org_id']}")
                return response.data[0]['id']
            
            return None
            
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            return None
    
    def save_payment_method(
        self,
        org_id: str,
        payment_data: Dict[str, Any]
    ) -> bool:
        """
        Save or update payment method
        Uses service role to bypass RLS
        """
        try:
            if not self.supabase_service:
                logger.error("Cannot save payment method - service role not configured")
                return False
            
            # Check if payment method exists
            existing = self.supabase_service.table("payment_methods")\
                .select("id")\
                .eq("org_id", org_id)\
                .eq("provider", payment_data.get('provider', 'paystack'))\
                .limit(1)\
                .execute()
            
            payment_data['org_id'] = org_id
            payment_data['updated_at'] = datetime.utcnow().isoformat()
            
            if existing.data:
                # Update existing
                self.supabase_service.table("payment_methods")\
                    .update(payment_data)\
                    .eq("id", existing.data[0]['id'])\
                    .execute()
            else:
                # Insert new
                payment_data['created_at'] = datetime.utcnow().isoformat()
                self.supabase_service.table("payment_methods")\
                    .insert(payment_data)\
                    .execute()
            
            logger.info(f"Saved payment method for org {org_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving payment method: {e}")
            return False

    def require_feature_access(self, org_id: str, feature: str):
        """
        Enforce feature access via exception
        Used in API dependencies/middlewares
        """
        from fastapi import HTTPException
        
        has_access = self.check_feature_access(org_id, feature)
        if not has_access:
            raise HTTPException(
                status_code=402, # Payment Required
                detail=f"Subscription upgrade required to access feature: {feature}"
            )
        return True

    def ensure_default_organization(self, user_id: str, email: str, full_name: Optional[str] = None) -> Optional[str]:
        """
        Check if user has an organization, create one if not.
        Uses service role to guarantee creation.
        """
        try:
            if not self.supabase_service:
                logger.error("Cannot ensure organization - service role not configured")
                return None

            # 1. Check for existing organization membership
            # Try org_members first
            res = self.supabase_service.table("org_members")\
                .select("org_id")\
                .eq("user_id", user_id)\
                .limit(1)\
                .execute()
            
            if res.data:
                return res.data[0]['org_id']

            # Try organizations owner_id next
            owned = self.supabase_service.table("organizations")\
                .select("id")\
                .eq("owner_id", user_id)\
                .limit(1)\
                .execute()
            
            if owned.data:
                return owned.data[0]['id']

            # 2. If nothing found, create a new organization
            org_name = f"{full_name or email.split('@')[0]}'s Organization"
            new_org = self.supabase_service.table("organizations").insert({
                "name": org_name,
                "owner_id": user_id,
                "plan": "starter"
            }).execute()

            if not new_org.data:
                logger.error(f"Failed to create organization for user {user_id}")
                return None
            
            org_id = new_org.data[0]['id']

            # 3. Create org membership
            self.supabase_service.table("org_members").insert({
                "org_id": org_id,
                "user_id": user_id,
                "role": "owner"
            }).execute()

            logger.info(f"Auto-provisioned organization {org_id} for user {user_id}")
            return org_id

        except Exception as e:
            logger.error(f"Error ensuring organization for user {user_id}: {e}")
            return None


# Singleton instance
billing_service = BillingService()
