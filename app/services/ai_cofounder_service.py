import logging
import json
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from app.core.supabase import get_service_client
from app.core.ai_client import get_ai_client
from app.models.ai_cofounder import AICofounderAdvice
from app.services.research_service import research_service
from app.services.business_plan_service import business_plan_service
from app.services.prd_service import prd_service
from app.services.opportunity_scoring_service import OpportunityScoringService

logger = logging.getLogger(__name__)

class AICofounderService:
    def __init__(self):
        self.supabase = get_service_client()
        self.ai = get_ai_client()
        self.scoring_service = OpportunityScoringService()

    async def generate_advice(self, project_id: UUID) -> Optional[AICofounderAdvice]:
        """
        Aggregates project context and generates AI Co-Founder advice.
        """
        try:
            # 1. Fetch project details
            project_res = self.supabase.table("startup_projects").select("*").eq("id", str(project_id)).execute()
            if not project_res.data:
                logger.error(f"Project {project_id} not found")
                return None
            
            project = project_res.data[0]
            idea_id = project.get("idea_id")
            
            # 2. Gather Context
            context = {}
            
            # Idea & Score
            if idea_id:
                idea_res = self.supabase.table("ideas").select("*").eq("id", str(idea_id)).execute()
                if idea_res.data:
                    context["idea"] = idea_res.data[0]
                
                score_res = self.supabase.table("opportunity_scores").select("*").eq("startup_id", str(project_id)).execute()
                if score_res.data:
                    context["opportunity_score"] = score_res.data[0]

            # Research & PRD (from memory stores for now, as they aren't fully persisted in DB yet)
            # In a real app, we'd fetch these from DB based on project.research_id etc.
            # For this MVP, we'll try to find them by run_id if available
            run_id = project.get("id") # Assuming run_id matches project_id for simplicity in this flow
            context["research"] = research_service.research_store.get(str(run_id))
            context["business_plan"] = business_plan_service.plan_store.get(str(run_id))
            context["prd"] = prd_service.prd_store.get(str(run_id))

            # 3. Construct AI Prompt
            system_prompt = """
You are an elite AI Co-Founder for a startup project in the Smartbuilder ecosystem.
Your goal is to provide high-leverage guidance, identify blind spots, and suggest the absolute next best actions.

You will be provided with the current context of the startup (Idea, Market Research, Business Plan, PRD, and Opportunity Scores).

Your output must be a structured JSON object:
{
  "health_score": 0-100,
  "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
  "risks": ["Risk 1", "Risk 2"],
  "next_actions": ["Action 1", "Action 2"],
  "summary": "Short 1-2 sentence executive summary"
}

Keep insights strategic, risks honest, and actions highly tactical.
"""
            user_msg = f"Analyze this startup project context and provide co-founder guidance:\n\n{json.dumps(context, indent=2, default=str)}"

            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": user_msg}],
                system_prompt=system_prompt,
                response_format={"type": "json_object"}
            )
            
            advice_data = json.loads(response["content"])
            
            # 4. Persist Advice
            db_row = {
                "project_id": str(project_id),
                "health_score": advice_data.get("health_score", 50),
                "key_insights": advice_data.get("key_insights", []),
                "risks": advice_data.get("risks", []),
                "next_actions": advice_data.get("next_actions", []),
                "analysis_context": context
            }
            
            insert_res = self.supabase.table("ai_cofounder_advice").insert(db_row).execute()
            
            if insert_res.data:
                return AICofounderAdvice(**insert_res.data[0])
            return None

        except Exception as e:
            logger.error(f"Error generating Co-Founder advice: {e}")
            return None

    async def get_latest_advice(self, project_id: UUID) -> Optional[AICofounderAdvice]:
        """Fetches the latest advice for a project."""
        try:
            res = self.supabase.table("ai_cofounder_advice")\
                .select("*")\
                .eq("project_id", str(project_id))\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            
            if res.data:
                return AICofounderAdvice(**res.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching latest advice: {e}")
            return None

    async def deeper_analysis(self, project_id: UUID, query: str) -> str:
        """Provide deeper analysis based on a user query."""
        try:
            advice = await self.get_latest_advice(project_id)
            context = advice.analysis_context if advice else {}
            
            system_prompt = f"""
You are the AI Co-Founder for this startup. 
Context: {json.dumps(context, indent=2, default=str)}

The user wants a deeper analysis on a specific topic. 
Be concise, strategic, and supportive like a real co-founder.
"""
            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": query}],
                system_prompt=system_prompt
            )
            return response["content"]
        except Exception as e:
            logger.error(f"Error in deeper analysis: {e}")
            return "I encountered an error while analyzing that. Let's try again."

ai_cofounder_service = AICofounderService()
