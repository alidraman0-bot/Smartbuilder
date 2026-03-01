import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from app.models.market_signal import MarketSignal, IdeaFromSignalRequest
from app.services.market_signals_collector import MarketSignalsCollector
from app.services.market_signal_aggregator import MarketSignalAggregator
from app.services.opportunity_scoring_service import OpportunityScoringService
from app.core.ai_client import get_ai_client
from app.api.deps import get_current_user
from app.core.config import settings
from supabase import create_client

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/market-signals")
async def get_market_signals():
    """
    Retrieve the latest market signals for the Live Feed.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    db = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    
    try:
        response = db.table("market_signals").select("*").order("created_at", desc=True).limit(20).execute()
        
        if not response.data:
            raise Exception("No data in DB. Triggering fallback data.")
            
        # If the schema hasn't been updated yet, 'topic' will be missing.
        if 'topic' not in response.data[0]:
            raise Exception("Old schema detected. Triggering fallback data.")
            
        return response.data
    except Exception as e:
        logger.error(f"Error fetching market signals: {e}")
        # Default fallback data for UI preview while developing
        return [
            {
                "source": "Reddit",
                "topic": "Founders asking for Stripe alternatives in Africa",
                "summary": "Multiple threads complaining about high fees and payout delays.",
                "trend_score": 88
            },
            {
                "source": "Product Hunt",
                "topic": "3 new AI meeting assistants launched today",
                "summary": "High upvotes for tools auto-generating PRDs from transcripts.",
                "trend_score": 95
            },
            {
                "source": "Hacker News",
                "topic": "Developers frustrated with deploying LLM apps",
                "summary": "Top post on pain points of Langchain scaling.",
                "trend_score": 92
            },
            {
                "source": "Google Trends",
                "topic": "“AI customer support” searches up 63%",
                "summary": "Breakout trend globally over the past week.",
                "trend_score": 100
            }
        ]

@router.post("/market-signals/sync")
async def sync_market_signals(background_tasks: BackgroundTasks):
    """
    Manually trigger or schedule a sync of market signals from various sources.
    This runs asynchronously to avoid blocking the API.
    """
    collector = MarketSignalsCollector()
    
    async def run_collector():
        try:
            await collector.collect_and_store()
        except Exception as e:
            logger.error(f"Background collector failed: {e}")
            
    background_tasks.add_task(run_collector)
    return {"status": "Sync started in background"}

@router.post("/generate-from-signal")
async def generate_idea_from_signal(
    request: IdeaFromSignalRequest = Body(...)
):
    """
    Takes a market signal and uses AI to generate a startup idea based on it.
    """
    try:
        ai = get_ai_client()
        
        system_prompt = """You are an expert startup founder and product strategist.
You take live market signals (problems, complaints, trends) and instantly generate perfectly aligned, high-potential SaaS or AI startup ideas.
Your response MUST be pure JSON matching this structure:
{
    "title": "Short catchy name for the product",
    "description": "1-2 sentence compelling pitch",
    "target_audience": "Who this is for",
    "core_features": ["Feature 1", "Feature 2", "Feature 3"],
    "monetization": "How it makes money",
    "why_now": "Why this is a good idea right now based on the signal"
}
"""
        
        user_message = f"""Generate a startup idea based on this hot market signal:
Source: {request.source}
Title: {request.title}
Context/Description: {request.description or 'N/A'}

Provide the response in the requested JSON format.
"""
        
        response = await ai.chat_completion(
            messages=[{"role": "user", "content": user_message}],
            system_prompt=system_prompt,
            response_format={"type": "json_object"}
        )
        
        import json
        idea_data = json.loads(response['content'])
        return idea_data
        
    except Exception as e:
        logger.error(f"Error generating idea from signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market-evidence")
async def get_market_evidence(idea: str):
    """
    Fetch comprehensive market evidence (Trends, Competitors, Funding) for an idea.
    """
    try:
        aggregator = MarketSignalAggregator()
        evidence = await aggregator.aggregate_market_data(idea)
        return evidence
    except Exception as e:
        logger.error(f"Error fetching market evidence: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-opportunity")
async def analyze_opportunity(
    idea: str = Body(..., embed=True),
    startup_id: str = Body(None, embed=True)
):
    """
    Perform a full venture intelligence analysis with real-market grounding.
    """
    try:
        service = OpportunityScoringService()
        analysis = await service.analyze_opportunity(idea=idea, startup_id=startup_id)
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing opportunity: {e}")
        raise HTTPException(status_code=500, detail=str(e))
