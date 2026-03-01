import logging
import json
from typing import Dict, Any, List
from app.core.ai_client import get_ai_client
from app.agents.base import BaseAgent
from app.models.schemas import BuildOutput, DataModel, APIEndpoint, PageRoute

logger = logging.getLogger(__name__)

class BuildAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Build Agent")
        self.ai_client = get_ai_client()

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Translate PRD into build-ready instructions.
        """
        prd = context.get("prd")
        tech_constraints = context.get("tech_constraints", {"frontend": "Next.js", "backend": "FastAPI"})
        
        if not prd:
            raise ValueError("PRD context required for Build")

        prompt = f"""
        Translate this PRD into build-ready instructions:
        PRD: {json.dumps(prd)}
        Tech Constraints: {json.dumps(tech_constraints)}
        
        Provide:
        1. Data models (name and fields).
        2. API endpoints (method and path).
        3. Pages (route and purpose).
        
        RULES:
        - Every feature must map to >=1 endpoint.
        - No UI styling details allowed.
        - All routes explicit.
        
        RETURN ONLY JSON matching this structure:
        {{
            "data_models": [{{ "name": "string", "fields": ["string"] }}],
            "api_endpoints": [{{ "method": "string", "path": "string" }}],
            "pages": [{{ "route": "string", "purpose": "string" }}]
        }}
        """

        try:
            from app.core.config import settings
            if not self.ai_client.has_provider(settings.AI_PROVIDER) and not settings.OPENAI_API_KEY:
                output = self._get_mock_build_plan(prd)
            else:
                response = await self.ai_client.chat_completion(
                    messages=[
                        {"role": "system", "content": self._get_system_prompt()},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                output = json.loads(response["content"])

            # Validation
            validated = BuildOutput(**output)
            return validated.dict()

        except Exception as e:
            logger.error(f"Build Agent error: {e}")
            return self._get_mock_build_plan(prd)

    def _get_mock_build_plan(self, prd: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "data_models": [
                { "name": "User", "fields": ["id", "email", "created_at"] },
                { "name": "Metric", "fields": ["id", "type", "value", "timestamp"] }
            ],
            "api_endpoints": [
                { "method": "GET", "path": "/api/metrics" },
                { "method": "POST", "path": "/api/metrics" }
            ],
            "pages": [
                { "route": "/", "purpose": "Dashboard landing" },
                { "route": "/stats", "purpose": "Detailed statistics" }
            ]
        }

    def _get_system_prompt(self) -> str:
        return "You are the Build Agent. Translate PRD into build-ready instructions. Every feature must map to >=1 endpoint. No UI styling allowed."
