import httpx
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class MarketDataService:
    """
    Service for Polygon.io API.
    Used for real-time stock, forex, and crypto data.
    """
    def __init__(self):
        self.api_key = os.getenv("POLYGON_API_KEY", "")
        self.base_url = "https://api.polygon.io"

    async def get_market_data(self, symbol: str) -> Dict[str, Any]:
        """
        Fetches real-time market aggregates from Polygon.io.
        """
        if not self.api_key:
            logger.warning("Polygon.io API key not found. Returning mock data.")
            return self._get_mock_data(symbol)

        try:
            async with httpx.AsyncClient(verify=False, timeout=15.0) as client:
                params = {"apiKey": self.api_key}
                
                # Fetch daily aggregates (Previous Close)
                url = f"{self.base_url}/v2/aggs/ticker/{symbol}/prev"
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    results = response.json().get("results", [])
                    return {
                        "source": "Polygon.io",
                        "symbol": symbol,
                        "results": results[0] if isinstance(results, list) and results else {}
                    }
                else:
                    logger.error(f"Polygon API returned status {response.status_code}: {response.text}")
                    return self._get_mock_data(symbol)
        except Exception as e:
            logger.error(f"Error calling Polygon API: {e}")
            return {"error": str(e), "data": self._get_mock_data(symbol)}

    def _get_mock_data(self, symbol: str) -> Dict[str, Any]:
        return {
            "source": "Polygon.io (Mock)",
            "symbol": symbol,
            "last_price": "$145.20",
            "change_percent": "+1.2%",
            "volume": "2.5M",
            "asset_class": "Equity"
        }
