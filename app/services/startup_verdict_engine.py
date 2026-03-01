import logging
import json
from typing import Dict, Any
from app.core.ai_client import get_ai_client
from app.models.verdict import VerdictRequest, VerdictResponse

logger = logging.getLogger(__name__)

class StartupVerdictEngine:
    def __init__(self):
        self.ai = get_ai_client()

    async def generate_verdict(self, data: VerdictRequest) -> VerdictResponse:
        """
        Synthesizes market research data into a final VC-style verdict.
        """
        system_prompt = """You are a top-tier venture capitalist partner at a prestige firm (like Sequoia or Benchmark).
Your task is to provide a final, definitive verdict on a startup opportunity based on market research data.

Inputs you will receive:
- opportunity_score (1-10)
- trend_growth (growth % or score)
- competitor_count (number of players)
- funding_activity (market investment heat)
- market_size (TAM/SAM/SOM)

Return a JSON object with EXACTLY this structure:
{
  "verdict": "A concise, high-impact title for the opportunity (e.g., 'Promising Opportunity', 'Niche Dominance Play', 'Avoid: Saturated Market')",
  "success_probability": "A string percentage (e.g., '68%')",
  "confidence_score": 0.72,
  "reasons": [
    "3-4 short, punchy reasons justifying the verdict based on the data"
  ]
}

Be realistic. Not every idea is a winner. Use the data to ground your assessment."""

        user_message = f"""Analyze this startup opportunity:
Idea: {data.idea or 'Not provided'}
Opportunity Score: {data.opportunity_score}/10
Trend Growth: {data.trend_growth}%
Competitor Count: {data.competitor_count}
Funding Activity: {data.funding_activity}
Market Size: {data.market_size}"""

        try:
            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": user_message}],
                system_prompt=system_prompt,
                response_format={"type": "json_object"}
            )
            
            content = response["content"]
            result_json = json.loads(content)
            
            return VerdictResponse(
                verdict=result_json.get("verdict", "Unknown"),
                success_probability=result_json.get("success_probability", "0%"),
                confidence_score=float(result_json.get("confidence_score", 0.0)),
                reasons=result_json.get("reasons", ["No specific reasons provided"])
            )

        except Exception as e:
            logger.error(f"Verdict Engine failed: {e}")
            return VerdictResponse(
                verdict="Error in Analysis",
                success_probability="0%",
                confidence_score=0.0,
                reasons=["System failure during synthesis"]
            )
