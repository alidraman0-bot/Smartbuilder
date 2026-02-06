
import logging
from typing import List, Dict, Any
from app.core.supabase import supabase
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self):
        pass

    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """
        Aggregate high-level stats for the Command Center.
        """
        try:
            # 1. Active Projects Count
            projects_res = supabase.table("projects").select("project_id", count="exact").execute()
            active_projects = projects_res.count if projects_res.count is not None else 0

            # 3. Latest Deployments
            deploy_recent = supabase.table("deployments")\
                .select("*")\
                .order("created_at", desc=True)\
                .limit(5)\
                .execute()

            # 4. Recent Activity (Last 5 events)
            activity_res = supabase.table("activity_logs")\
                .select("*")\
                .order("timestamp", desc=True)\
                .limit(5)\
                .execute()
            
            # 5. Smart Actions (Logic-based suggestions)
            smart_actions = await self._generate_smart_actions()

            return {
                "active_projects": active_projects,
                "success_rate": f"{success_rate:.1f}%",
                "ai_efficiency": "89.2%", # Placeholder for now, could be derived from token usage vs outcome
                "avg_build_time": "2.1m",   # Placeholder for now, could be derived from deployment durations
                "recent_activity": activity_res.data,
                "latest_deployments": deploy_recent.data,
                "smart_actions": smart_actions
            }
        except Exception as e:
            logger.error(f"Failed to fetch dashboard stats: {e}")
            return self._get_fallback_stats()

    async def _generate_smart_actions(self) -> List[Dict[str, Any]]:
        """
        Generate proactive suggestions for the user.
        """
        actions = []
        
        # Action A: Check if any project has no deployment
        try:
            projects_res = supabase.table("projects").select("project_id, name").execute()
            for project in projects_res.data:
                deploys_res = supabase.table("deployments")\
                    .select("status")\
                    .eq("project_id", project["project_id"])\
                    .execute()
                
                if not deploys_res.data:
                    actions.append({
                        "id": f"action_deploy_{project['project_id']}",
                        "type": "opportunity",
                        "title": f"Launch {project['name']}",
                        "description": "This project hasn't been deployed yet. Ready to go live?",
                        "cta": "Deploy Now",
                        "link": "/deploy",
                        "impact": "high"
                    })
                    break # Just show one for now
        except: pass

        # Action B: Default generic actions if none found
        if not actions:
            actions.append({
                "id": "action_research",
                "type": "strategy",
                "title": "Analyze Market Gaps",
                "description": "New data found in the 'PropTech' sector. Generate new ideas?",
                "cta": "Start Research",
                "link": "/ideas",
                "impact": "medium"
            })
            actions.append({
                "id": "action_monitor",
                "type": "maintenance",
                "title": "System Checkup",
                "description": "Run an automated health audit on your active instances.",
                "cta": "Run Audit",
                "link": "/monitor",
                "impact": "low"
            })

        return actions

    def _get_fallback_stats(self) -> Dict[str, Any]:
        return {
            "active_projects": 0,
            "success_rate": "100%",
            "ai_efficiency": "0%",
            "avg_build_time": "0s",
            "recent_activity": [],
            "smart_actions": []
        }

analytics_service = AnalyticsService()
