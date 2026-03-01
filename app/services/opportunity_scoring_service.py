import logging
import json
from typing import Dict, Any, Optional, List
from app.core.supabase import get_service_client
from app.core.ai_client import get_ai_client
from app.models.opportunity_score import (
    ScoreData,
    OpportunityIntelligenceResponse,
)
from app.services.market_signal_aggregator import MarketSignalAggregator

logger = logging.getLogger(__name__)


class OpportunityScoringService:
    def __init__(self):
        self.supabase = get_service_client()
        self.ai = get_ai_client()

    # ── NEW: 6-factor numeric scoring (Opportunity Intelligence Engine) ────────

    async def analyze_opportunity(
        self,
        idea: str,
        research: Optional[Dict[str, Any]] = None,
        signals: Optional[List[Dict[str, Any]]] = None,
        startup_id: Optional[str] = None,
    ) -> OpportunityIntelligenceResponse:
        """
        Evaluates a startup idea across 6 numeric dimensions (each 1–10).
        Uses REAL Market Signals (Trends, Competitors, Funding) to ground the scores.
        """
        # 1. Fetch REAL Market Evidence
        aggregator = MarketSignalAggregator()
        evidence = await aggregator.aggregate_market_data(idea, startup_id)
        
        # 2. Build context block
        context_parts = [f"STARTUP IDEA:\n{idea}"]
        
        context_parts.append(f"REAL MARKET EVIDENCE:\n{json.dumps(evidence, indent=2)}")
        
        if research:
            context_parts.append(f"MARKET RESEARCH:\n{json.dumps(research, indent=2)}")
        if signals:
            signals_text = "\n".join(
                f"- [{s.get('source', 'signal')}] {s.get('signal', '')}" for s in signals
            )
            context_parts.append(f"ADDITIONAL SIGNALS:\n{signals_text}")
        full_context = "\n\n".join(context_parts)

        system_prompt = """You are a senior venture capitalist performing a rigorous market opportunity assessment.
You MUST prioritize the provided REAL MARKET EVIDENCE (Trends, Competitors, Funding) over generic guesses.

Evaluate the startup idea across exactly 6 dimensions. Each score is a number from 1 to 10.

Scoring guidance:
1. demand_score       — How intense and widespread is the pain point?
2. market_size_score  — How large is the addressable market? 
3. competition_score  — How crowded is the space? (Use detected competitors count)
4. revenue_score      — How easy and scalable is monetisation?
5. trend_score        — Is this aligned with a rising trend? (Use Google Trends growth %)
6. difficulty_score   — How hard is it to build the MVP?

Return a JSON object with EXACTLY this structure:
{
  "demand_score": 7.5,
  "market_size_score": 8.0,
  "competition_score": 5.0,
  "revenue_score": 7.0,
  "trend_score": 8.5,
  "difficulty_score": 4.0,
  "summary": "2-3 sentence VC-style verdict explaining the key thesis and biggest risk"
}"""

        user_message = f"Evaluate this opportunity:\n\n{full_context}"

        response = await self.ai.chat_completion(
            messages=[{"role": "user", "content": user_message}],
            system_prompt=system_prompt,
            response_format={"type": "json_object"},
            max_tokens=800,
        )
        
        content = response["content"]
        logger.info(f"AI Response Content: {content}")
        
        try:
            raw = json.loads(content)
        except json.JSONDecodeError as je:
            logger.error(f"JSON Decode Error: {je}. Raw content: {content}")
            # Try to extract JSON if it's wrapped in triple backticks
            if "```json" in content:
                content = content.split("```json")[-1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[-1].split("```")[0].strip()
            raw = json.loads(content)

        def _clamp(v: Any, default: float = 5.0) -> float:
            try:
                return max(1.0, min(10.0, float(v)))
            except (TypeError, ValueError):
                return default

        demand      = _clamp(raw.get("demand_score"))
        market_size = _clamp(raw.get("market_size_score"))
        competition = _clamp(raw.get("competition_score"))
        revenue     = _clamp(raw.get("revenue_score"))
        trend       = _clamp(raw.get("trend_score"))
        difficulty  = _clamp(raw.get("difficulty_score"))

        # Formula update based on real signals:
        # trend (30%), market_size (25%), competition_inv (20%), funding/revenue (15%), difficulty_inv (10%)
        # Note: We use demand_score to influence revenue/funding if appropriate, 
        # but let's stick closer to the requested pivot.
        
        composite = (
            (trend * 0.3) + 
            (market_size * 0.25) + 
            ((10 - competition) * 0.2) + 
            (revenue * 0.15) + # Revenue acts as proxy for funding/monetization
            ((10 - difficulty) * 0.1)
        ) 
        # Normalize to 1-10 (since weights sum to 1.0, and ingredients are 1-10)
        composite = round(max(1.0, min(10.0, composite)), 2)

        result = OpportunityIntelligenceResponse(
            opportunity_score=composite,
            demand_score=demand,
            market_size_score=market_size,
            competition_score=competition,
            revenue_score=revenue,
            trend_score=trend,
            difficulty_score=difficulty,
            summary=raw.get("summary", ""),
            market_evidence=evidence
        )
        # Attach evidence to result if needed (can be put in analysis_json)
        result_dict = result.model_dump()

        # Persist to opportunity_scores
        try:
            db_row = {
                "idea_id": startup_id or "adhoc",
                "startup_id": startup_id,
                "score": composite,
                # Legacy qualitative fields (kept for schema compat)
                "market_demand": self._numeric_to_label(demand),
                "competition": self._numeric_to_label(10 - competition),
                "revenue_potential": self._numeric_to_label(revenue),
                "build_difficulty": self._numeric_to_label(difficulty),
                "trend": self._score_to_trend(trend),
                "summary": result.summary,
                # New numeric columns
                "demand_score": demand,
                "market_size_score": market_size,
                "competition_score": competition,
                "revenue_score": revenue,
                "trend_score": trend,
                "difficulty_score": difficulty,
                "analysis_json": result_dict,
            }
            self.supabase.table("opportunity_scores").insert(db_row).execute()
            logger.info(f"Opportunity score saved: {composite}")
        except Exception as db_err:
            logger.warning(f"Failed to persist opportunity score: {db_err}")

        return result

    # ── LEGACY: qualitative scoring (used by OpportunityEngineService) ─────────

    async def score_idea(
        self,
        idea_text: str,
        idea_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Legacy qualitative scoring (High/Med/Low) — kept for backward compat
        with OpportunityEngineService.generate_opportunities().
        """
        system_prompt = """You are a senior venture capitalist and startup strategist.
Analyze the provided startup idea and evaluate it realistically across 5 dimensions:
1. Market Demand: Is there a large group of people with this pain point?
2. Competition Level: How crowded is the existing market?
3. Revenue Potential: How easy and scalable is the monetization?
4. Build Difficulty: How technically complex or resource-intensive is the MVP?
5. Trend Momentum: Is this aligned with current market or tech growth?

Return a JSON object with this exact structure:
{
  "score": 8.4,
  "market_demand": "High/Medium/Low",
  "competition": "High/Medium/Low",
  "revenue_potential": "High/Medium/Low",
  "build_difficulty": "High/Medium/Low",
  "trend": "Rising/Stable/Declining",
  "summary": "1-2 sentence VC-style verdict"
}"""

        user_message = f"Evaluate this startup idea like a venture capitalist:\n\n{idea_text}"

        response = await self.ai.chat_completion(
            messages=[{"role": "user", "content": user_message}],
            system_prompt=system_prompt,
            response_format={"type": "json_object"},
        )

        score_data = json.loads(response["content"])

        if idea_id:
            db_data = {
                "idea_id": idea_id,
                "score": score_data.get("score"),
                "market_demand": score_data.get("market_demand"),
                "competition": score_data.get("competition"),
                "revenue_potential": score_data.get("revenue_potential"),
                "build_difficulty": score_data.get("build_difficulty"),
                "trend": score_data.get("trend"),
                "summary": score_data.get("summary"),
            }
            self.supabase.table("opportunity_scores").insert(db_data).execute()

        return {"score_data": score_data}

    # ── Helpers ────────────────────────────────────────────────────────────────

    @staticmethod
    def _numeric_to_label(score: float) -> str:
        if score >= 7:
            return "High"
        if score >= 4:
            return "Medium"
        return "Low"

    @staticmethod
    def _score_to_trend(score: float) -> str:
        if score >= 7:
            return "Rising"
        if score >= 4:
            return "Stable"
        return "Declining"
