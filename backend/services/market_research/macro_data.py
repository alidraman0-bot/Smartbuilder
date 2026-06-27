import httpx
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class MacroDataService:
    """
    Service for Nasdaq Data Link API.
    Used for economic indicators and global insights.
    """
    def __init__(self):
        self.api_key = os.getenv("NASDAQ_DATA_LINK_API_KEY", "")
        self.base_url = "https://data.nasdaq.com/api/v3"

    async def get_macro_data(self, indicator: str) -> Dict[str, Any]:
        """
        Fetches macroeconomic datasets from Nasdaq Data Link.
        """
        if not self.api_key:
            logger.warning("Nasdaq Data Link API key not found. Returning mock data.")
            return self._get_mock_data(indicator)

        try:
            async with httpx.AsyncClient(verify=False, timeout=20.0) as client:
                params = {"api_key": self.api_key, "limit": 1}
                # Example: Fetching a common dataset (FRED/GDP as default if indicator is generic)
                dataset_code = indicator if "/" in indicator else f"FRED/GDP"
                
                url = f"{self.base_url}/datasets/{dataset_code}/data.json"
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    dataset_data = response.json().get("dataset_data", {})
                    data_list = dataset_data.get("data", [])
                    return {
                        "source": "Nasdaq Data Link",
                        "indicator": dataset_code,
                        "data": data_list if isinstance(data_list, list) else []
                    }
                else:
                    logger.error(f"Nasdaq Data Link returned status {response.status_code}: {response.text}")
                    return self._get_mock_data(indicator)
        except Exception as e:
            logger.error(f"Error calling Nasdaq Data Link API: {e}")
            return {"error": str(e), "data": self._get_mock_data(indicator)}

    def _get_mock_data(self, indicator: str) -> Dict[str, Any]:
        return {
            "source": "Nasdaq Data Link (Mock)",
            "indicator": indicator,
            "trends": "Consistent upward trend in consumer spending.",
            "forecast": "Growth expected to continue at 2.5% YoY.",
            "context": "Global macro conditions remain stable despite regional volatility."
        }
