import httpx
import os
import logging
import asyncio
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class FinancialDataService:
    """
    Service for Financial Modeling Prep (FMP) API.
    Used for fetching company financials and providing credibility.
    """
    def __init__(self):
        self.api_key = os.getenv("FMP_API_KEY", "")
        self.base_url = "https://financialmodelingprep.com/api/v3"

    async def get_financial_data(self, symbol: str) -> Dict[str, Any]:
        """
        Fetches financial data from FMP.
        """
        if not self.api_key:
            logger.warning("FMP API key not found. Returning mock data.")
            return self._get_mock_data(symbol)

        try:
            async with httpx.AsyncClient(verify=False, timeout=15.0) as client:
                params = {"apikey": self.api_key}
                
                # Fetch profile and key metrics in parallel
                profile_task = client.get(f"{self.base_url}/profile/{symbol}", params=params)
                metrics_task = client.get(f"{self.base_url}/key-metrics-ttm/{symbol}", params=params)
                
                responses = await asyncio.gather(profile_task, metrics_task)
                
                data = {}
                if responses[0].status_code == 200:
                    profile_json = responses[0].json()
                    data["profile"] = profile_json[0] if isinstance(profile_json, list) and profile_json else {}
                else:
                    logger.warning(f"FMP profile request failed with status {responses[0].status_code}. Using mock.")
                    data["profile"] = self._get_mock_data(symbol).get("financial_summary", {})

                if responses[1].status_code == 200:
                    metrics_json = responses[1].json()
                    data["metrics"] = metrics_json[0] if isinstance(metrics_json, list) and metrics_json else {}
                else:
                    logger.warning(f"FMP metrics request failed with status {responses[1].status_code}. Using mock.")
                    data["metrics"] = {}
                
                return {
                    "source": "FMP",
                    "symbol": symbol,
                    "data": data
                }
        except Exception as e:
            logger.error(f"Error calling FMP API: {e}")
            return {"error": str(e), "data": self._get_mock_data(symbol)}

    def _get_mock_data(self, symbol: str) -> Dict[str, Any]:
        return {
            "source": "Financial Modeling Prep (Mock)",
            "symbol": symbol,
            "financial_summary": {
                "market_cap": "$500M",
                "revenue_growth": "15%",
                "profit_margin": "12%",
                "pe_ratio": "25.4"
            },
            "recent_filings": ["Q3 2025 Report", "8-K Filing"]
        }
