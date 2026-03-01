import logging
from typing import Optional
from datetime import datetime, timedelta
from app.core.supabase import get_service_client
import asyncio

logger = logging.getLogger(__name__)

class RateLimiterService:
    """
    Rate limiting service to prevent abuse and control costs.
    
    Strategy:
    - Soft limit (per minute): Show warning as limit approaches
    - Hard limit (per day): Based on plan tier
    - Burst allowance: Allow short bursts regardless of rate
    - Graceful degradation: Return cached ideas instead of hard error
    
    Plan Tiers:
    - free: 20 clicks/month, 5/minute
    - starter: 200 clicks/month, 10/minute
    - pro: Unlimited clicks, 20/minute
    - team: Unlimited clicks, 50/minute
    """
    
    def __init__(self):
        self.client = get_service_client()
        self._rate_limit_cache = {}  # In-memory cache for fast lookups
        logger.info("RateLimiterService initialized")
    
    async def get_user_plan(self, user_id: str) -> str:
        """
        Get user's plan tier.
        Defaults to 'free' if not found.
        """
        # Anonymous users always get free plan
        if not user_id or user_id == "anonymous":
            return "free"
        
        try:
            # Use org_members table (has org_id column linked to user_id)
            org_response = self.client.table("org_members")\
                .select("org_id")\
                .eq("user_id", user_id)\
                .limit(1)\
                .execute()
            
            if not org_response.data:
                return "free"
            
            org_id = org_response.data[0].get("org_id")
            if not org_id:
                return "free"
            
            # Get organization's plan
            plan_response = self.client.table("organizations")\
                .select("plan")\
                .eq("id", org_id)\
                .limit(1)\
                .execute()
            
            if plan_response.data:
                return plan_response.data[0].get("plan", "free")
            
            return "free"
            
        except Exception as e:
            logger.error(f"Failed to get user plan: {e}")
            return "free"
    
    async def get_rate_limit_config(self, plan_type: str) -> dict:
        """Get rate limit configuration for a plan tier."""
        # Use values from PLAN_FEATURES for monthly limit
        from app.services.billing_service import PLAN_FEATURES
        
        plan_feat = PLAN_FEATURES.get(plan_type, PLAN_FEATURES['free'])
        monthly_limit = plan_feat.get("idea_clicks", 20)
        
        # Define per-minute/day caps for safety
        configs = {
            "free": {"cpm": 5, "cpd": 10, "burst": 2},
            "starter": {"cpm": 10, "cpd": 50, "burst": 5},
            "pro": {"cpm": 20, "cpd": 1000, "burst": 10},
            "team": {"cpm": 50, "cpd": 5000, "burst": 20},
        }
        
        safety = configs.get(plan_type, configs['free'])
        
        return {
            "plan_type": plan_type,
            "clicks_per_minute": safety["cpm"],
            "clicks_per_day": safety["cpd"],
            "clicks_per_month": monthly_limit,
            "burst_allowance": safety["burst"]
        }
    
    async def get_usage_count(
        self, 
        user_id: str, 
        window_minutes: Optional[int] = None,
        window_days: Optional[int] = None
    ) -> int:
        """
        Get usage count for a user within a time window.
        """
        # Anonymous users can't be tracked (not a valid UUID)
        if not user_id or user_id == "anonymous":
            return 0
        
        try:
            query = self.client.table("idea_generation_usage")\
                .select("id", count="exact")\
                .eq("user_id", user_id)
            
            if window_minutes:
                cutoff = datetime.utcnow() - timedelta(minutes=window_minutes)
                query = query.gte("created_at", cutoff.isoformat())
            elif window_days:
                cutoff = datetime.utcnow() - timedelta(days=window_days)
                query = query.gte("created_at", cutoff.isoformat())
            
            response = query.execute()
            return response.count if response.count is not None else 0
            
        except Exception as e:
            logger.error(f"Failed to get usage count: {e}")
            return 0
    
    async def check_rate_limit(
        self, 
        user_id: str,
        project_id: Optional[str] = None
    ) -> dict:
        """
        Check if user has exceeded rate limits.
        
        Returns:
        {
            "allowed": bool,
            "reason": str or None,
            "usage_minute": int,
            "usage_day": int,
            "limit_minute": int,
            "limit_day": int,
            "warning": bool,  # True if approaching limit
            "plan_type": str
        }
        """
        try:
            # Get user's plan
            plan_type = await self.get_user_plan(user_id)
            
            # Get rate limit config
            config = await self.get_rate_limit_config(plan_type)
            
            # Get current usage
            usage_minute = await self.get_usage_count(user_id, window_minutes=1)
            usage_day = await self.get_usage_count(user_id, window_days=1)
            usage_month = await self.get_usage_count(user_id, window_days=30)
            
            limit_minute = config["clicks_per_minute"]
            limit_day = config["clicks_per_day"]
            limit_month = config["clicks_per_month"]
            burst_allowance = config["burst_allowance"]
            
            # Check monthly limit (The primary quota)
            if limit_month != -1 and usage_month >= limit_month:
                return {
                    "allowed": False,
                    "reason": f"Monthly idea limit reached ({limit_month} generations/month for {plan_type} plan)",
                    "usage_minute": usage_minute,
                    "usage_day": usage_day,
                    "usage_month": usage_month,
                    "limit_minute": limit_minute,
                    "limit_day": limit_day,
                    "limit_month": limit_month,
                    "warning": False,
                    "plan_type": plan_type
                }

            # Check hard daily limits (safety)
            if usage_day >= limit_day:
                return {
                    "allowed": False,
                    "reason": f"Daily safety limit reached for {plan_type} plan",
                    "usage_minute": usage_minute,
                    "usage_day": usage_day,
                    "limit_minute": limit_minute,
                    "limit_day": limit_day,
                    "warning": False,
                    "plan_type": plan_type
                }
            
            # Check per-minute limit (with burst allowance)
            if usage_minute >= limit_minute + burst_allowance:
                return {
                    "allowed": False,
                    "reason": f"Rate limit exceeded. Please wait a moment.",
                    "usage_minute": usage_minute,
                    "usage_day": usage_day,
                    "limit_minute": limit_minute,
                    "limit_day": limit_day,
                    "warning": False,
                    "plan_type": plan_type
                }
            
            # Check if approaching limits (soft warning)
            warning = (
                usage_minute >= limit_minute * 0.7 or
                usage_day >= limit_day * 0.8
            )
            
            return {
                "allowed": True,
                "reason": None,
                "usage_minute": usage_minute,
                "usage_day": usage_day,
                "limit_minute": limit_minute,
                "limit_day": limit_day,
                "warning": warning,
                "plan_type": plan_type
            }
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            # On error, allow the request but log it
            return {
                "allowed": True,
                "reason": None,
                "usage_minute": 0,
                "usage_day": 0,
                "limit_minute": 10,
                "limit_day": 50,
                "warning": False,
                "plan_type": "starter"
            }
    
    async def record_usage(
        self,
        user_id: str,
        project_id: str,
        org_id: Optional[str] = None,
        ideas_generated: int = 5,
        ai_calls: int = 1,
        estimated_cost_usd: Optional[float] = None
    ):
        """Record a generation event for billing and rate limiting."""
        # Skip recording for anonymous users (can't store string as UUID)
        if not user_id or user_id == "anonymous":
            logger.info(f"Skipping usage recording for anonymous user")
            return
        
        try:
            usage_record = {
                "user_id": user_id,
                "project_id": project_id,
                "org_id": org_id,
                "ideas_generated": ideas_generated,
                "ai_calls": ai_calls,
                "estimated_cost_usd": estimated_cost_usd
            }
            
            self.client.table("idea_generation_usage").insert(usage_record).execute()
            logger.info(f"Recorded usage for user {user_id[:8]}... ({ideas_generated} ideas, {ai_calls} AI calls)")
            
        except Exception as e:
            logger.error(f"Failed to record usage: {e}")
            # Non-critical, don't block the request


# Global singleton
rate_limiter_service = RateLimiterService()
