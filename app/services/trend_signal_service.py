import logging
import httpx
from typing import List, Dict, Any, Optional
from app.core.supabase import get_service_client
from app.core.config import settings

logger = logging.getLogger(__name__)

class TrendSignalService:
    def __init__(self):
        self.supabase = get_service_client()
        self.serpapi_key = settings.SERPAPI_API_KEY

    async def get_trend_signals(self, keywords: List[str], idea_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch Google Trends data for keywords via SerpApi and calculate growth/momentum.
        """
        if not self.serpapi_key:
            logger.warning("SerpApi key not configured. Returning empty trend signals.")
            return []

        results = []
        try:
            # Google Trends allows up to 5 keywords per request
            chunk_size = 5
            for i in range(0, len(keywords), chunk_size):
                chunk = keywords[i:i + chunk_size]
                q = ",".join(chunk)
                
                async with httpx.AsyncClient() as client:
                    params = {
                        "engine": "google_trends",
                        "q": q,
                        "data_type": "TIMESERIES",
                        "api_key": self.serpapi_key
                    }
                    resp = await client.get("https://serpapi.com/search", params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        interest_over_time = data.get("interest_over_time", {})
                        timeline_data = interest_over_time.get("timeline_data", [])
                        
                        if not timeline_data:
                            continue
                            
                        # Process each keyword in the chunk
                        for kw in chunk:
                            # Calculate growth (last few points vs earlier points)
                            # Simplified: compare average of first 3 points to last 3 points
                            values = []
                            for entry in timeline_data:
                                for val in entry.get("values", []):
                                    if val.get("query") == kw:
                                        try:
                                            values.append(float(val.get("extracted_value", 0)))
                                        except:
                                            pass
                            
                            if len(values) >= 6:
                                first_avg = sum(values[:3]) / 3
                                last_avg = sum(values[-3:]) / 3
                                
                                growth_val = 0
                                if first_avg > 0:
                                    growth_val = ((last_avg - first_avg) / first_avg) * 100
                                else:
                                    growth_val = last_avg * 10 # Arbitrary multiplier for 0 baseline
                                    
                                growth_str = f"{'+' if growth_val >= 0 else ''}{int(growth_val)}%"
                                
                                momentum = "stable"
                                if growth_val > 20:
                                    momentum = "rising"
                                elif growth_val > 50:
                                    momentum = "explosive"
                                elif growth_val < -10:
                                    momentum = "declining"
                                
                                signal = {
                                    "keyword": kw,
                                    "growth": growth_str,
                                    "momentum": momentum
                                }
                                results.append(signal)
                                
                                if idea_id:
                                    self.supabase.table("trend_signals").insert({
                                        "idea_id": idea_id,
                                        "keyword": kw,
                                        "growth": growth_str,
                                        "momentum": momentum
                                    }).execute()
        except Exception as e:
            logger.error(f"Error in TrendSignalService: {e}")
            
        return results
