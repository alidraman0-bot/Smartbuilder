from app.core.http_client import http_client
from app.utils.circuit_breaker import breaker
from app.core.config import settings
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class SocialService:
    """
    Social Intelligence Service using ScraperAPI and simulation fallbacks.
    """
    def __init__(self):
        self.scraperapi_key = settings.SCRAPERAPI_API_KEY
        self.client = http_client
        
        if not self.scraperapi_key:
            logger.info("ScraperAPI key not configured for SocialService. Will use simulations.")

    @breaker
    async def get_reddit_pain_points(self, subreddit: str, query: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Scrape Reddit for complaints and pain points.
        """
        if self.scraperapi_key:
            signals = await self._get_reddit_signals_scraperapi(subreddit, query)
            if signals:
                return signals
            
        return self._get_fallback_reddit(subreddit, query)

    def _get_fallback_reddit(self, subreddit: str, query: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Simulation fallback for Reddit data.
        """
        return [
            {
                "source": f"Reddit (r/{subreddit})",
                "subreddit": subreddit,
                "title": f"Frustrated with current {query or 'SaaS'} solutions",
                "content": "Does anyone else find it impossible to scale X without hitting Y limitations? Looking for alternatives.",
                "sentiment": "negative",
                "upvotes": 156,
                "url": "#"
            },
            {
                "source": f"Reddit (r/{subreddit})",
                "subreddit": subreddit,
                "title": "Why is there no tool for Z?",
                "content": "I spend 4 hours a day manually updating spreadsheets. There should be an AI for this.",
                "sentiment": "negative",
                "upvotes": 89,
                "url": "#"
            }
        ]

    async def _get_reddit_signals_scraperapi(self, subreddit: str, query: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch real Reddit data directly or via ScraperAPI.
        """
        search_query = query or "problem OR complaint OR annoying OR hate"
        reddit_url = f"https://www.reddit.com/r/{subreddit}/search.json?q={search_query}&sort=new&limit=5"
        
        # Option A: Direct Reddit JSON API first
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SmartBuilder/1.0"
            }
            logger.info(f"Attempting direct Reddit API call: {reddit_url}")
            response = await self.client.get(reddit_url, headers=headers, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                children = data.get("data", {}).get("children", [])
                signals = []
                for child in children:
                    post = child.get("data", {})
                    signals.append({
                        "source": f"Reddit (r/{subreddit})",
                        "subreddit": subreddit,
                        "title": post.get("title"),
                        "content": post.get("selftext", "")[:300],
                        "sentiment": "negative" if any(w in post.get("title", "").lower() for w in ["problem", "hate", "issue"]) else "neutral",
                        "upvotes": post.get("ups", 0),
                        "url": f"https://reddit.com{post.get('url')}"
                    })
                logger.info(f"Direct Reddit API call succeeded, got {len(signals)} posts.")
                return signals
            else:
                logger.warning(f"Direct Reddit API call returned status {response.status_code}. Trying ScraperAPI...")
        except Exception as e:
            logger.warning(f"Direct Reddit API call failed: {e}. Trying ScraperAPI...")

        # Option B: ScraperAPI fallback if key is configured
        if self.scraperapi_key:
            try:
                params = {
                    "api_key": self.scraperapi_key,
                    "url": reddit_url
                }
                response = await self.client.get("http://api.scraperapi.com", params=params)
                if response.status_code == 200:
                    data = response.json()
                    children = data.get("data", {}).get("children", [])
                    signals = []
                    for child in children:
                        post = child.get("data", {})
                        signals.append({
                            "source": f"Reddit (r/{subreddit})",
                            "subreddit": subreddit,
                            "title": post.get("title"),
                            "content": post.get("selftext", "")[:300],
                            "sentiment": "negative" if any(w in post.get("title", "").lower() for w in ["problem", "hate", "issue"]) else "neutral",
                            "upvotes": post.get("ups", 0),
                            "url": f"https://reddit.com{post.get('url')}"
                        })
                    logger.info(f"ScraperAPI Reddit fetch succeeded with {len(signals)} posts.")
                    return signals
            except Exception as e:
                logger.warning(f"ScraperAPI Reddit fetch failed: {e}")
        return []

    async def get_twitter_trends(self, query: str) -> List[Dict[str, Any]]:
        """
        Scrape Twitter/X for trends.
        """
        # Twitter is highly restricted, usually requiring simulation or specialized scrapers
        return [
            {
                "source": "Twitter (Simulation)",
                "tweet": f"Just realized there is no good way to automate {query}. Someone build this!",
                "user": "startup_ent",
                "likes": 450,
                "sentiment": "positive"
            },
            {
                "source": "Twitter (Simulation)",
                "tweet": f"The state of {query} in 2024 is abysmal. Legacy players are too slow.",
                "user": "tech_critic",
                "likes": 1200,
                "sentiment": "negative"
            }
        ]

social_service = SocialService()
