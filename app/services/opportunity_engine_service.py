import logging
import json
from typing import List, Dict, Any
from app.core.supabase import get_service_client
from app.core.ai_client import get_ai_client
from app.models.opportunity_engine import OpportunityIdea, OpportunityEngineResponse
from app.services.opportunity_scoring_service import OpportunityScoringService
from app.services.memory_service import memory_service
from app.models.memory import MemoryEventBase
import uuid
import asyncio

logger = logging.getLogger(__name__)

class OpportunityEngineService:
    def __init__(self):
        self.supabase = get_service_client()
        self.ai = get_ai_client()
        self.scoring = OpportunityScoringService()

    async def generate_opportunities(self, user_id: str = None, project_id: str = None) -> Dict[str, Any]:
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
            
            # Step 2.5: Enrich with Scores (Parallelized)
            logger.info(f"Auto-scoring {len(ideas)} venture ideas in parallel...")
            
            async def score_one_idea(idea):
                try:
                    idea_text = f"Title: {idea['title']}\nProblem: {idea['problem']}\nCustomer: {idea['target_customer']}"
                    analysis = await self.scoring.analyze_opportunity(
                        idea=idea_text
                    )
                    
                    # Map to ScoreData format for frontend
                    return {
                        **idea,
                        'score_data': {
                            "score": analysis.opportunity_score,
                            "market_demand": self.scoring._numeric_to_label(analysis.demand_score),
                            "competition": self.scoring._numeric_to_label(10 - analysis.competition_score),
                            "revenue_potential": self.scoring._numeric_to_label(analysis.revenue_score),
                            "build_difficulty": self.scoring._numeric_to_label(analysis.difficulty_score),
                            "trend": self.scoring._score_to_trend(analysis.trend_score),
                            "summary": analysis.summary,
                            "market_evidence": analysis.market_evidence.model_dump() if analysis.market_evidence else None
                        }
                    }
                except Exception as sc_err:
                    logger.error(f"Failed to score idea {idea.get('title', 'Unknown')}: {sc_err}")
                    return idea

            scored_ideas = await asyncio.gather(*[score_one_idea(idea) for idea in ideas])
            
            result_data['ideas'] = scored_ideas

            # Step 3: Log run to DB
            run_data = {
                "user_id": user_id,
                "signals_used": signals[:10], # Store subset to keep DB light
                "ideas_generated": ideas
            }
            
            self.supabase.table("opportunity_runs").insert(run_data).execute()
            
            # Step 4: Log to Project Memory if project_id is provided
            if project_id:
                try:
                    await memory_service.log_event(MemoryEventBase(
                        project_id=uuid.UUID(project_id),
                        type="opportunity_batch_generated",
                        title="Venture Opportunities Generated",
                        description=f"AI synthesized {len(scored_ideas)} new strategic opportunities from market signals.",
                        actor="smartbuilder_ai",
                        metadata={"count": len(scored_ideas)}
                    ))
                except Exception as log_err:
                    logger.warning(f"Failed to log opportunity generation to memory: {log_err}")
            
            return result_data

        except Exception as e:
            logger.error(f"Error in OpportunityEngineService: {e}")
            raise e

    async def analyze_discovery_item(self, idea_id: str) -> Dict[str, Any]:
        """
        DEEP ANALYSIS: Performs heavy lifting for a specific idea on-demand.
        """
        try:
            # 1. Fetch lightweight idea from ideas_v2
            idea_res = self.supabase.table("ideas_v2").select("*").eq("id", idea_id).single().execute()
            if not idea_res.data:
                raise Exception(f"Idea {idea_id} not found")
            
            idea = idea_res.data
            
            # 2. Check if analysis already exists
            analysis_res = self.supabase.table("opportunity_analysis").select("*").eq("idea_id", idea_id).execute()
            if analysis_res.data:
                return {
                    "idea": idea,
                    "analysis": analysis_res.data[0]
                }
            
            # 3. Perform Deep Analysis using OpportunityScoringService
            # We construct a rich context for the scoring service
            context = f"""
            Title: {idea['title']}
            Summary: {idea['summary']}
            Industry: {idea.get('industry', 'General')}
            Customer: {idea.get('customer_segment', 'Broad')}
            Problem: {idea.get('problem', 'Unspecified')}
            Technology: {idea.get('technology', 'AI/SaaS')}
            """
            
            analysis = await self.scoring.analyze_opportunity(idea=context)
            
            # 4. Prepare research-heavy fields (Simulated for this MVP)
            # In production, these would fetch from real APIs (Crunchbase, Trends, etc.)
            competitors = [
                {"name": "Legacy Solution A", "strength": "High Distribution"},
                {"name": "Early-stage Startup B", "strength": "Agile"}
            ]
            
            market_size_numeric = 1500000000  # $1.5B simulated
            
            # 5. Persist to opportunity_analysis
            analysis_record = {
                "idea_id": idea_id,
                "problem_score": analysis.demand_score,
                "market_size_description": f"Estimated at ${market_size_numeric/1e9:.1f}B with {analysis.market_evidence.market_momentum if analysis.market_evidence else 'stable'} market momentum.",
                "market_size_numeric": market_size_numeric,
                "competition_intensity": self.scoring._numeric_to_label(10 - analysis.competition_score),
                "competitors": [{"name": c, "strength": "Detected Competitor"} for c in analysis.market_evidence.top_competitors] if analysis.market_evidence and analysis.market_evidence.top_competitors else competitors,
                "growth_trend": self.scoring._score_to_trend(analysis.trend_score),
                "opportunity_score": analysis.opportunity_score,
                "why_now": analysis.summary[:1000],
                "generated_at": "now()"
            }
            
            self.supabase.table("opportunity_analysis").insert(analysis_record).execute()
            
            return {
                "idea": idea,
                "analysis": analysis_record
            }

        except Exception as e:
            logger.error(f"Deep analysis failed for idea {idea_id}: {e}")
            raise e
