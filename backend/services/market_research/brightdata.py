import httpx
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class BrightDataService:
    """
    Service for Bright Data Web Unlocker / SERP API.
    Used for scraping real-time web data, extracting competitors, pricing, and products.
    """
    def __init__(self):
        self.api_key = os.getenv("BRIGHTDATA_API_KEY", "")
        self.zone = os.getenv("BRIGHTDATA_ZONE", "web_unlocker")
        # Example Proxy URL for Bright Data Web Unlocker
        self.proxy_url = f"http://brd-customer-{os.getenv('BRIGHTDATA_CUSTOMER_ID')}-zone-{self.zone}:{self.api_key}@brd.superproxy.io:22225"
        self.api_base_url = "https://api.brightdata.com"

    async def scrape_web_data(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scrapes web data using Bright Data SERP API with a fallback to SerpApi.
        """
        search_query = query.get("keywords") or query.get("idea", "")
        
        # 1. Try Bright Data if configured
        if self.api_key and os.getenv("BRIGHTDATA_CUSTOMER_ID"):
            try:
                async with httpx.AsyncClient(verify=False, timeout=30.0, proxy=self.proxy_url) as client:
                    url = "https://google.com/search"
                    params = {"q": search_query, "brd_json": "1"}
                    response = await client.get(url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        organic = data.get("organic", [])
                        if not isinstance(organic, list):
                            organic = []
                        return {
                            "source": "Bright Data SERP",
                            "raw_results": organic[:5],
                            "query": search_query
                        }
            except Exception as e:
                logger.error(f"Bright Data API failed: {e}")

        # 2. Fallback to SerpApi (Verified to be working)
        serpapi_key = os.getenv("SERPAPI_API_KEY")
        if serpapi_key:
            try:
                logger.info(f"Falling back to SerpApi for query: {search_query}")
                async with httpx.AsyncClient(verify=False, timeout=20.0) as client:
                    resp = await client.get(
                        "https://serpapi.com/search",
                        params={"q": search_query, "api_key": serpapi_key, "engine": "google"}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        organic_results = data.get("organic_results", [])
                        if not isinstance(organic_results, list):
                            organic_results = []
                        return {
                            "source": "SerpApi (Fallback)",
                            "raw_results": organic_results[:8],
                            "query": search_query
                        }
            except Exception as e:
                logger.error(f"SerpApi fallback failed: {e}")

        # 3. Final Fallback to Mock
        logger.warning("No real-world web data sources available. Using mock data.")
        return self._get_mock_data(query)

    def _get_mock_data(self, query: Dict[str, Any]) -> Dict[str, Any]:
        idea = query.get("idea", "the startup idea")
        return {
            "source": "Bright Data (Mock)",
            "web_insights": f"Web signals indicate growing interest in {idea}.",
            "scraped_competitors": [
                {"name": "Competitor A", "description": "Market leader in the segment."},
                {"name": "Competitor B", "description": "Innovative startup focusing on UX."}
            ],
            "pricing_observations": "Average market price for similar services ranges from $20 to $100 per month."
        }
