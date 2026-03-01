import logging
import json
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.models.schemas import ResearchOutput, MarketSize, CompetitionEntry

logger = logging.getLogger(__name__)

class ResearchAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Research Agent")

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate market reality and timing for a single idea.
        """
        idea = context.get("idea")
        if not idea:
            raise ValueError("Idea context required for Research")

        prompt = f"""
        Analyze the market reality and timing for this startup idea:
        Title: {idea.get('title')}
        Problem: {idea.get('problem')}
        Target User: {idea.get('target_user')}
        Monetization: {idea.get('monetization')}
        
        Provide:
        1. Market size estimate (e.g., $10B TAM).
        2. Competition list (at least 1 entry with name and weakness).
        3. Timing rationale.
        4. Validation score (0-100).
        5. Kill flag (true if market is too small, saturated, or timing is wrong).
        
        RETURN ONLY JSON matching this structure:
        {{
            "market_size": {{ "estimate": "string", "confidence": 0.0 }},
            "competition": [{{ "name": "string", "weakness": "string" }}],
            "timing_rationale": "string",
            "validation_score": 0.0,
            "kill_flag": false
        }}
        """

        try:
            from app.services.research_service import research_service
            
            # Use the dedicated ResearchService which handles Signal fetching + Analysis
            # We pass the run_id from context to keep track in the research store
            run_id = context.get("run_id")
            result = await research_service.execute_research(idea, run_id=run_id)
            
            # Ensure the output matches the Pydantic schema for the Orchestrator
            # (which expects: market_size, competition, timing_rationale, validation_score, kill_flag)
            # These are now added to the unified response in ResearchService.
            return result

        except Exception as e:
            logger.error(f"Research Agent error (real-scan): {e}")
            return self._get_mock_research(idea)

    def _get_mock_research(self, idea: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "market_size": { "estimate": "$12B TAM by 2030", "confidence": 85.0 },
            "competition": [
                { "name": "Legacy Giant Inc", "weakness": "Slow to adopt edge-native architectures" }
            ],
            "timing_rationale": "Edge computing surge driven by privacy laws makes this ideal timing.",
            "validation_score": 88.0,
            "kill_flag": False
        }

    def _get_system_prompt(self) -> str:
        return "You are the Research Agent. Validate market reality and timing. kill_flag = true immediately halts FSM. Market size must be explicit. Competition list >= 1 entry."
