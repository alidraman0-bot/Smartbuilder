import logging
import json
from typing import Dict, Any, List
from openai import AsyncOpenAI
from app.core.config import settings
from app.agents.base import BaseAgent
from app.models.schemas import BusinessPlanPRDOutput, BP_BusinessPlan, BP_PRD, PRD_Feature

logger = logging.getLogger(__name__)

class BusinessPlanPRDAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Business Plan & PRD Agent")
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Define how the business works and what gets built by leveraging specialized services.
        """
        from app.services.business_plan_service import business_plan_service
        from app.services.prd_service import prd_service

        validated_idea = context.get("validated_idea") or context.get("idea")
        research_summary = context.get("research_summary") or context.get("research")
        run_id = context.get("run_id")
        
        if not validated_idea or not research_summary:
            raise ValueError("Idea and Research context required for Business Plan & PRD")

        try:
            # 1. Generate Business Plan
            bp_res = await business_plan_service.generate_business_plan(
                idea=validated_idea,
                research=research_summary,
                run_id=run_id
            )
            business_plan = bp_res.get("business_plan")

            # 2. Generate PRD
            prd_res = await prd_service.generate_prd(
                idea=validated_idea,
                business_plan=business_plan,
                run_id=run_id
            )
            prd = prd_res.get("prd")

            return {
                "business_plan": business_plan,
                "prd": prd,
                "confidence_score": bp_res.get("business_plan", {}).get("investment_verdict", {}).get("confidence", 90.0)
            }

        except Exception as e:
            logger.error(f"BP & PRD Agent error: {e}")
            return self._get_mock_bp_prd(validated_idea)

        except Exception as e:
            logger.error(f"BP & PRD Agent error: {e}")
            return self._get_mock_bp_prd(validated_idea)

    def _get_mock_bp_prd(self, idea: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "business_plan": {
                "value_proposition": f"Premium AI-driven {idea.get('title')} optimization.",
                "target_customer": idea.get("target_user", "Founders"),
                "pricing_model": "SaaS Subscription",
                "go_to_market": "Product Hunt + Social Media",
                "success_metrics": ["MRR", "Churn Rate"]
            },
            "prd": {
                "core_features": [
                    { "feature_id": "core-1", "description": "AI Dashboard" },
                    { "feature_id": "core-2", "description": "Automated Reports" }
                ],
                "non_goals": ["Mobile App", "Multi-language support"]
            },
            "confidence_score": 90.0
        }

    def _get_system_prompt(self) -> str:
        return "You are the Business Plan & PRD Agent. Define business and build details. Max 5 features. Monetization defined. Non-goals required."
