from typing import Dict, Any
from app.agents.base import BaseAgent
from app.models.schemas import PRD, Feature
from app.services.validator import ValidationService

class PRDAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="PRD Agent")

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        bp = context.get("business_plan")
        if not bp:
            raise ValueError("Business Plan required for PRD")

        # Mock LLM generation
        mock_prd_data = {
            "app_name": bp["business_name"],
            "features": [
                {
                    "name": "Dashboard",
                    "description": "Main view for metrics",
                    "revenue_mapping": "Core value retention",
                    "customer_pain_mapping": "Lack of visibility",
                    "success_metric": "Daily Active Users"
                }
            ],
            "out_of_scope": ["Mobile App", "Social Login"],
            "user_flow": ["Landing -> Sign up -> Dashboard"],
            "tech_stack_requirements": ["React", "FastAPI"]
        }

        prd = ValidationService.validate_schema(mock_prd_data, PRD)
        return prd.model_dump()
