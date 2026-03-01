import logging
import json
from typing import Dict, Any, Optional
from app.core.supabase import get_service_client
from app.core.ai_client import get_ai_client
from app.models.blueprint import BlueprintResponse

logger = logging.getLogger(__name__)


class BlueprintService:
    def __init__(self):
        self.supabase = get_service_client()
        self.ai = get_ai_client()

    async def generate_blueprint(
        self,
        idea: str,
        research: Optional[Dict[str, Any]] = None,
        prd: Optional[Dict[str, Any]] = None,
        project_id: Optional[str] = None,
    ) -> BlueprintResponse:
        """
        Generates a structured startup blueprint using AI.
        Synthesises the idea, market research, and PRD into all 12 blueprint sections.
        Optionally persists the result to the startup_blueprints table.
        """
        # Build contextual sections to inject into the prompt
        context_parts = [f"STARTUP IDEA:\n{idea}"]
        if research:
            context_parts.append(f"MARKET RESEARCH:\n{json.dumps(research, indent=2)}")
        if prd:
            context_parts.append(f"PRD DATA:\n{json.dumps(prd, indent=2)}")
        full_context = "\n\n".join(context_parts)

        system_prompt = """You are a senior startup strategist, venture capitalist, and product architect.
Given a startup idea (plus optional market research and PRD data), generate a comprehensive and realistic startup blueprint.

Return a JSON object with EXACTLY this structure — no extra fields, no markdown:
{
  "name": "A memorable startup name (2-3 words max)",
  "problem": "The specific, painful problem that exists in the market (2-3 sentences)",
  "solution": "How the startup elegantly solves that problem (2-3 sentences)",
  "customers": "Specific target customer segments with demographics and psychographics",
  "market": "Total addressable market estimate with sizing methodology (TAM/SAM/SOM if possible)",
  "business_model": "Exactly how the company makes money — pricing model, revenue streams",
  "features": [
    "Core feature 1",
    "Core feature 2",
    "Core feature 3",
    "Core feature 4",
    "Core feature 5"
  ],
  "tech_stack": "Recommended technology architecture — frontend, backend, database, infrastructure, AI/ML if applicable",
  "go_to_market": "Specific go-to-market strategy for first users — channels, partnerships, content, SEO, communities",
  "first_customers": "Tactical step-by-step plan to land the first 10 customers — be specific and actionable",
  "build_complexity": "Low",
  "opportunity_score": 7.5
}

Rules:
- build_complexity must be exactly one of: "Low", "Medium", or "High"
- opportunity_score must be a number between 1.0 and 10.0
- features must be an array of 4-6 strings
- Be specific, realistic, and founders-focused — avoid generic platitudes
- Base all assessments on the provided context
"""

        user_message = f"""Generate a startup blueprint for the following:\n\n{full_context}"""

        response = await self.ai.chat_completion(
            messages=[{"role": "user", "content": user_message}],
            system_prompt=system_prompt,
            response_format={"type": "json_object"},
            max_tokens=2000,
        )

        raw = json.loads(response["content"])

        # Normalise and coerce types
        features = raw.get("features", [])
        if isinstance(features, str):
            features = [f.strip() for f in features.split(",")]

        opportunity_score = raw.get("opportunity_score", 5.0)
        try:
            opportunity_score = float(opportunity_score)
        except (TypeError, ValueError):
            opportunity_score = 5.0
        opportunity_score = max(1.0, min(10.0, opportunity_score))

        blueprint = BlueprintResponse(
            name=raw.get("name", "Untitled Startup"),
            problem=raw.get("problem", ""),
            solution=raw.get("solution", ""),
            customers=raw.get("customers", ""),
            market=raw.get("market", ""),
            business_model=raw.get("business_model", ""),
            features=features,
            tech_stack=raw.get("tech_stack", ""),
            go_to_market=raw.get("go_to_market", ""),
            first_customers=raw.get("first_customers", ""),
            build_complexity=raw.get("build_complexity", "Medium"),
            opportunity_score=opportunity_score,
        )

        # Persist to DB if project_id is provided
        if project_id:
            try:
                data = {
                    "project_id": project_id,
                    "overview": blueprint.solution, # Mapping solution to overview for now 
                    "problem": blueprint.problem,
                    "solution": blueprint.solution,
                    "market_size": blueprint.market,
                    "target_customers": blueprint.customers,
                    "revenue_model": blueprint.business_model,
                    "competitive_landscape": blueprint.go_to_market, # Mapping for now
                    "mvp_features": ", ".join(blueprint.features),
                    "tech_architecture": blueprint.tech_stack
                }
                self.supabase.table("startup_blueprints").insert(data).execute()
                logger.info(f"Blueprint saved for project_id={project_id}")
            except Exception as db_err:
                logger.warning(f"Failed to persist blueprint to DB: {db_err}")

        return blueprint

    def get_blueprint_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Fetches a public blueprint by share token."""
        try:
            response = self.supabase.table("startup_blueprints").select("*").eq("share_token", token).eq("is_public", True).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching blueprint by token: {e}")
            return None

    def update_sharing(self, project_id: str, is_public: bool) -> Optional[Dict[str, Any]]:
        """Updates the sharing status of a blueprint."""
        try:
            response = self.supabase.table("startup_blueprints").update({"is_public": is_public}).eq("project_id", project_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating blueprint sharing: {e}")
            return None
