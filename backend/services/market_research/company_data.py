import httpx
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class GlobalDatabaseService:
    """
    Service for Global Database API (api.globaldatabase.com).
    Used for retrieving company data, identifying competitors and partners.
    """
    def __init__(self):
        self.api_key = os.getenv("GLOBAL_DATABASE_API_KEY", "")
        self.base_url = "https://api.globaldatabase.com/v2"

    async def get_company_data(self, query: str) -> Dict[str, Any]:
        """
        Fetches company intelligence from Global Database.
        """
        if not self.api_key:
            logger.warning("Global Database API key not found. Returning mock data.")
            return self._get_mock_data(query)

        try:
            async with httpx.AsyncClient(verify=False, timeout=20.0) as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Accept": "application/json"
                }
                # Search companies endpoint
                url = f"{self.base_url}/companies/search"
                params = {"name": query, "size": 5}
                
                response = await client.get(url, headers=headers, params=params)
                
                if response.status_code == 200:
                    return {
                        "source": "Global Database",
                        "companies": response.json().get("data", [])
                    }
                else:
                    logger.error(f"Global Database API returned status {response.status_code}: {response.text}")
                    return self._get_mock_data(query)
        except Exception as e:
            logger.error(f"Error calling Global Database API: {e}")
            return {"error": str(e), "data": self._get_mock_data(query)}

    def _get_mock_data(self, query: str) -> Dict[str, Any]:
        return {
            "source": "Global Database (Mock)",
            "companies": [
                {
                    "name": f"{query} Group",
                    "industry": "Technology",
                    "location": "Global",
                    "founded": "2015"
                },
                {
                    "name": f"{query} Solutions",
                    "industry": "Software",
                    "location": "USA",
                    "status": "Active"
                }
            ],
            "related_entities": ["Partner X", "Supporter Y"]
        }
