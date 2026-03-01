import logging
import json
from typing import List, Dict, Any
from app.core.supabase import get_service_client
from app.core.ai_client import get_ai_client
from app.models.opportunity_engine import OpportunityIdea, OpportunityEngineResponse
from app.services.opportunity_scoring_service import OpportunityScoringService

logger = logging.getLogger(__name__)

class OpportunityEngineService:
    def __init__(self):
        self.supabase = get_service_client()
        self.ai = get_ai_client()
        self.scoring = OpportunityScoringService()

    async def generate_opportunities(self, user_id: str = None) -> Dict[str, Any]:
        """
        1. Fetch top market signals
        2. Analyze with AI
        3. Return 5 ideas
        """
        try:
            # Step 1: Fetch signals from DB (cached)
            # We assume signals are already populated by the periodic scraper or /api/market-signals
            signals_result = self.supabase.table("market_signals").select("*").order("signal_strength", desc=True).limit(20).execute()
            signals = signals_result.data
            
            if not signals:
                logger.warning("No market signals found in database. Opportunity generation may be generic.")
                signals = []

            # Step 2: Prompt AI
            system_prompt = """You are a senior venture capitalist and startup strategist.
Analyze the provided market signals (discussions, trends, problems) and detect deep patterns, unsolved pain points, and emerging market gaps.
Generate 5 high-potential venture opportunities. Each must feel uniquely enabled by the current market landscape.

Response MUST be a JSON object with this structure:
{
  "ideas": [
    {
      "title": "Short catchy name",
      "problem": "Raw pain point detected",
      "target_customer": "Primary user/buyer",
      "market_hint": "Why this is a large opportunity",
      "why_now": "Why this is possible/urgent now based on signals"
    }
  ]
}
"""
            
            signals_text = "\n".join([
                f"- [{s['source']}] {s['title']}: {s.get('description', '')[:200]}" 
                for s in signals
            ])
            
            user_message = f"""Here are the latest market signals from the internet:
{signals_text}

Analyze these signals and generate 5 unique startup ideas in the requested JSON format."""

            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": user_message}],
                system_prompt=system_prompt,
                response_format={"type": "json_object"}
            )
            
            result_data = json.loads(response['content'])
            ideas = result_data.get('ideas', [])
            
            # Step 2.5: Enrich with Scores
            logger.info(f"Auto-scoring {len(ideas)} venture ideas...")
            scored_ideas = []
            for idea in ideas:
                try:
                    idea_text = f"Title: {idea['title']}\nProblem: {idea['problem']}\nCustomer: {idea['target_customer']}"
                    analysis = await self.scoring.analyze_opportunity(
                        idea=idea_text
                    )
                    
                    # Map to ScoreData format for frontend
                    idea['score_data'] = {
                        "score": analysis.opportunity_score,
                        "market_demand": self.scoring._numeric_to_label(analysis.demand_score),
                        "competition": self.scoring._numeric_to_label(10 - analysis.competition_score),
                        "revenue_potential": self.scoring._numeric_to_label(analysis.revenue_score),
                        "build_difficulty": self.scoring._numeric_to_label(analysis.difficulty_score),
                        "trend": self.scoring._score_to_trend(analysis.trend_score),
                        "summary": analysis.summary,
                        "market_evidence": analysis.market_evidence.model_dump() if analysis.market_evidence else None
                    }
                    scored_ideas.append(idea)
                except Exception as sc_err:
                    logger.error(f"Failed to score idea {idea['title']}: {sc_err}")
                    scored_ideas.append(idea)
            
            result_data['ideas'] = scored_ideas

            # Step 3: Log run to DB
            run_data = {
                "user_id": user_id,
                "signals_used": signals[:10], # Store subset to keep DB light
                "ideas_generated": ideas
            }
            
            self.supabase.table("opportunity_runs").insert(run_data).execute()
            
            return result_data

        except Exception as e:
            logger.error(f"Error in OpportunityEngineService: {e}")
            raise e
