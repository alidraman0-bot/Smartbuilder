import logging
import json
from typing import List, Dict, Any, Optional
from app.core.supabase import get_service_client
from app.core.ai_client import get_ai_client
from app.core.config import settings
import httpx

logger = logging.getLogger(__name__)

class FundingSignalService:
    def __init__(self):
        self.supabase = get_service_client()
        self.ai = get_ai_client()
        self.serpapi_key = settings.SERPAPI_API_KEY

    async def get_funding_signals(self, keywords: List[str], idea_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Estimate funding activity in the space using AI analysis of search results.
        """
        try:
            search_query = f"recent startup funding news { ' '.join(keywords[:3]) }"
            search_context = ""

            if self.serpapi_key:
                async with httpx.AsyncClient() as client:
                    params = {
                        "q": search_query,
                        "api_key": self.serpapi_key,
                        "engine": "google"
                    }
                    resp = await client.get("https://serpapi.com/search", params=params)
                    if resp.status_code == 200:
                        search_results = resp.json()
                        organic = search_results.get("organic_results", [])
                        search_context = "\n".join([f"- {r.get('title')}: {r.get('snippet')}" for r in organic[:8]])

            system_prompt = """You are a venture capital analyst. 
Based on the provided search results and keywords, estimate the capital flow into this specific market segment over the last 12-24 months.
Provide:
1. Total estimated funding (e.g. "$210M", "$1.2B")
2. Number of startups recently funded (integer)
3. Recent activity score (High, Medium, Low) - based on frequency and size of deals.

Response MUST be a JSON object:
{
  "total_estimated_funding": "$...",
  "num_startups_funded": 12,
  "recent_activity_score": "High/Medium/Low"
}"""

            user_msg = f"Market Keywords: {', '.join(keywords)}\n\nSearch Context:\n{search_context}"
            
            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": user_msg}],
                system_prompt=system_prompt,
                response_format={"type": "json_object"}
            )
            
            funding_data = json.loads(response['content'])
            
            if idea_id:
                self.supabase.table("funding_signals").insert({
                    "idea_id": idea_id,
                    "total_estimated_funding": funding_data.get('total_estimated_funding'),
                    "num_startups_funded": funding_data.get('num_startups_funded'),
                    "recent_activity_score": funding_data.get('recent_activity_score')
                }).execute()
                
            return funding_data
        except Exception as e:
            logger.error(f"Error in FundingSignalService: {str(e)}", exc_info=True)
            return {
                "total_estimated_funding": "Unknown",
                "num_startups_funded": 0,
                "recent_activity_score": "Low"
            }
