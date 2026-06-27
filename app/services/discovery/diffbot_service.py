from app.core.http_client import http_client
from app.utils.circuit_breaker import breaker
from app.core.config import settings
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class DiffbotService:
    """
    AI Data Structuring Engine using Diffbot with AI fallbacks.
    """
    def __init__(self):
        self.token = settings.DIFFBOT_TOKEN
        self.client = http_client
        
        if not self.token:
            logger.info("Diffbot token not configured. Will use AI-assisted extraction fallback.")

    @breaker
    async def structure_content(self, url: str, html: Optional[str] = None) -> Dict[str, Any]:
        """
        Structure web content using Diffbot Extract APIs or AI fallbacks.
        """
        if not self.token:
            return await self._ai_structure(url, html)

        try:
            params = {
                "token": self.token,
                "url": url
            }
            response = await self.client.get("https://api.diffbot.com/v3/analyze", params=params)
            
            if response.status_code != 200:
                return await self._ai_structure(url, html)
            
            data = response.json()
            return {
                "url": url,
                "objects": data.get("objects", []),
                "type": data.get("type", "unknown")
            }
        except Exception as e:
            logger.warning(f"Diffbot extraction failed, using AI fallback: {e}")
            return await self._ai_structure(url, html)

    async def _ai_structure(self, url: str, html: Optional[str]) -> Dict[str, Any]:
        """
        Use AI to extract structured data from HTML.
        """
        if not html:
            return {"objects": [], "type": "empty"}

        try:
            from app.core.ai_client import get_ai_client
            ai_client = get_ai_client()
            
            # Truncate HTML to avoid token limits - 3500 chars is usually enough for key metadata
            truncated_html = html[:3500]
            
            prompt = (
                f"Extract structured information from the following HTML content from URL: {url}\n\n"
                f"HTML snippet: {truncated_html}\n\n"
                "Return a JSON object with 'type' (e.g. article, product) and 'objects' list containing "
                "title, description, and any other relevant fields."
            )
            
            response = await ai_client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                system_prompt="You are a web data extraction agent. Return only valid JSON.",
                response_format={"type": "json_object"},
                max_tokens=1000 # Extraction doesn't need huge responses
            )
            
            import json
            data = json.loads(response["content"])
            return {
                "url": url,
                "objects": data.get("objects", []),
                "type": data.get("type", "unknown"),
                "provider": "ai_fallback"
            }
        except Exception as e:
            logger.warning(f"AI structure fallback failed for {url}: {e}")
            return self._basic_structure(html)

    def _basic_structure(self, html: Optional[str]) -> Dict[str, Any]:
        """
        Fallback basic structuring.
        """
        if not html:
            return {"objects": [], "type": "empty"}
            
        return {
            "objects": [
                {
                    "title": "Extracted Content (Basic)",
                    "description": "Information could not be structured automatically.",
                    "type": "article"
                }
            ],
            "type": "article",
            "status": "fallback"
        }

diffbot_service = DiffbotService()
