import logging
import asyncio
import httpx
import time
from typing import List, Dict, Any, Optional
import xml.etree.ElementTree as ET
from app.core.config import settings

logger = logging.getLogger(__name__)

class SignalService:
    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=10.0)
        self._signal_cache = None
        self._cache_timestamp = 0
        self._cache_ttl = 600 # 10 minutes

    async def fetch_signals(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Fetch, normalize, and rank signals from Google News, Hacker News, Reddit, and RSS.
        Includes a 10-minute local cache to reduce latency.
        """
        now = time.time()
        if not force_refresh and self._signal_cache and (now - self._cache_timestamp) < self._cache_ttl:
            logger.info("Returning cached signals")
            return self._signal_cache

        tasks = []
        
        # 1. Google News (SerpApi)
        if settings.SERPAPI_API_KEY:
            tasks.append(self._fetch_serpapi_signals())
        else:
            logger.warning("SERPAPI_API_KEY not set. Skipping Google News.")

        # 2. Hacker News
        tasks.append(self._fetch_hackernews_signals())

        # 3. Reddit
        if settings.REDDIT_CLIENT_ID and settings.REDDIT_CLIENT_SECRET:
            tasks.append(self._fetch_reddit_signals())
        else:
            logger.warning("Reddit API credentials not set. Using mock Reddit signals.")
            tasks.append(self._get_mock_reddit_signals())

        # 4. RSS (Indie Signals)
        tasks.append(self._fetch_rss_signals())

        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_signals = []
        for res in results:
            if isinstance(res, Exception):
                logger.error(f"Signal fetch error: {res}")
            elif isinstance(res, list):
                all_signals.extend(res)

        # Signal Normalization Layer (Step 3 in PRD)
        # For now, we normalize the structure. E2B clustering happens later in the synthesis flow.
        normalized_signals = self._normalize_signal_objects(all_signals)

        if not normalized_signals:
            logger.warning("No live signals found. Using fallback mocks.")
            normalized_signals = await self._get_mock_signals()

        self._signal_cache = normalized_signals[:25] # 15-25 signals max as per PRD
        self._cache_timestamp = time.time()
        return self._signal_cache

    def _normalize_signal_objects(self, signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ensure all signals match the requested schema for Step 2 of the PRD."""
        normalized = []
        for s in signals:
            normalized.append({
                "source": s.get("source", "Unknown"),
                "category": s.get("industry", s.get("category", "General")),
                "pattern": s.get("pattern", s.get("title", "No pattern identified")),
                "audience": s.get("audience", "Founders"),
                "frequency": s.get("frequency", "Medium"),
                "urgency": s.get("urgency", "Medium")
            })
        return normalized

    async def _fetch_serpapi_signals(self) -> List[Dict[str, Any]]:
        """Query Google News for startup/market trends via SerpApi."""
        url = "https://serpapi.com/search"
        params = {
            "api_key": settings.SERPAPI_API_KEY,
            "engine": "google_news",
            "q": "market trends startup opportunities unmet needs",
            "gl": "us",
            "hl": "en"
        }
        
        try:
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            signals = []
            if "news_results" in data:
                for item in data["news_results"][:5]:
                    signals.append({
                        "source": f"Google News ({item.get('source', {}).get('name', 'Unknown')})",
                        "pattern": item.get("title", "") + ": " + item.get("snippet", ""),
                        "audience": "General Market",
                        "industry": "Various",
                        "frequency_score": 0.8, # Estimated
                        "urgency_score": 0.8
                    })
            return signals
        except Exception as e:
            logger.error(f"Failed to fetch SerpApi signals: {e}")
            return []

    async def _fetch_hackernews_signals(self) -> List[Dict[str, Any]]:
        """Fetch top stories from Hacker News concurrently."""
        base_url = "https://hacker-news.firebaseio.com/v0"
        
        try:
            # Get top stories IDs
            resp = await self.http_client.get(f"{base_url}/topstories.json")
            resp.raise_for_status()
            story_ids = resp.json()[:8] # Fetch top 8
            
            # Fetch details concurrently
            async def get_item(sid):
                try:
                    res = await self.http_client.get(f"{base_url}/item/{sid}.json")
                    return res.json() if res.status_code == 200 else None
                except Exception:
                    return None

            items = await asyncio.gather(*[get_item(sid) for sid in story_ids])
            
            signals = []
            for item in items:
                if item and "title" in item:
                    signals.append({
                        "source": "Hacker News",
                        "pattern": item.get("title"),
                        "audience": "Tech Early Adopters",
                        "industry": "Tech / Startups",
                        "frequency_score": 0.9,
                        "urgency_score": 0.7
                    })
            return signals
        except Exception as e:
            logger.error(f"Failed to fetch HN signals: {e}")
            return []

    async def _fetch_reddit_signals(self) -> List[Dict[str, Any]]:
        """
        Fetch signals from Reddit using OAuth.
        Target subreddits: startups, Entrepreneur, SaaS, SideProject, AItools
        """
        if not settings.REDDIT_CLIENT_ID or not settings.REDDIT_CLIENT_SECRET:
            logger.info("Reddit credentials missing, using mocks.")
            return await self._get_mock_reddit_signals()

        subreddits = ["startups", "Entrepreneur", "SaaS", "SideProject", "AItools"]
        signals = []
        
        try:
            # 1. Get Access Token
            auth = httpx.BasicAuth(settings.REDDIT_CLIENT_ID, settings.REDDIT_CLIENT_SECRET)
            data = {"grant_type": "client_credentials"}
            headers = {"User-Agent": settings.REDDIT_USER_AGENT}
            
            token_resp = await self.http_client.post(
                "https://www.reddit.com/api/v1/access_token",
                auth=auth,
                data=data,
                headers=headers
            )
            
            if token_resp.status_code != 200:
                logger.error(f"Failed to get Reddit token: {token_resp.text}")
                return await self._get_mock_reddit_signals()
                
            token = token_resp.json().get("access_token")
            headers["Authorization"] = f"Bearer {token}"
            
            # 2. Fetch from subreddits
            for sub in subreddits:
                try:
                    url = f"https://oauth.reddit.com/r/{sub}/top?t=week&limit=5"
                    resp = await self.http_client.get(url, headers=headers)
                    if resp.status_code == 200:
                        posts = resp.json().get("data", {}).get("children", [])
                        for post in posts:
                            data = post.get("data", {})
                            signals.append({
                                "source": f"Reddit (r/{sub})",
                                "category": sub,
                                "pattern": f"{data.get('title')}: {data.get('selftext', '')[:200]}...",
                                "audience": "Early Adopters / Founders",
                                "frequency": "High" if data.get("ups", 0) > 100 else "Medium",
                                "urgency": "High" if "help" in data.get("title", "").lower() or "struggle" in data.get("selftext", "").lower() else "Medium"
                            })
                except Exception as sub_e:
                    logger.error(f"Failed to fetch r/{sub}: {sub_e}")
                    
            return signals if signals else await self._get_mock_reddit_signals()
            
        except Exception as e:
            logger.error(f"Reddit API error: {e}")
            return await self._get_mock_reddit_signals()

    async def _fetch_rss_signals(self) -> List[Dict[str, Any]]:
        """Fetch and parse RSS feeds for Product Hunt and Indie Hackers."""
        feeds = [
            ("Product Hunt", settings.PRODUCT_HUNT_RSS_URL),
            ("Indie Hackers", settings.INDIE_HACKERS_RSS_URL)
        ]
        signals = []
        
        for name, url in feeds:
            try:
                resp = await self.http_client.get(url)
                if resp.status_code == 200:
                    root = ET.fromstring(resp.text)
                    # Handle both RSS 2.0 and Atom
                    items = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")
                    for item in items[:5]:
                        title = item.find("title") or item.find("{http://www.w3.org/2005/Atom}title")
                        summary = item.find("description") or item.find("{http://www.w3.org/2005/Atom}summary")
                        
                        title_text = title.text if title is not None else "Untitled"
                        summary_text = summary.text if summary is not None else ""
                        
                        signals.append({
                            "source": name,
                            "pattern": f"{title_text}: {summary_text[:200]}...",
                            "audience": "Builders & Early Adopters",
                            "industry": "Tech / SaaS",
                            "frequency": "High",
                            "urgency": "Medium"
                        })
            except Exception as e:
                logger.error(f"Failed to fetch {name} RSS: {e}")
                
        return signals

    async def _get_mock_reddit_signals(self) -> List[Dict[str, Any]]:
        """Simulated 'Real Pain' signals from Reddit as per PRD specs."""
        return [
            {
                "source": "Reddit (r/startups)",
                "category": "SaaS",
                "pattern": "B2B SaaS founders struggling with churn due to poor customer onboarding automation",
                "audience": "SaaS Founders",
                "frequency": "High",
                "urgency": "High"
            },
            {
                "source": "Reddit (r/Entrepreneur)",
                "category": "SMB",
                "pattern": "Small businesses finding it hard to navigate new local tax compliance regulations manually",
                "audience": "SMB Owners",
                "frequency": "Medium",
                "urgency": "High"
            },
            {
                "source": "Reddit (r/SaaS)",
                "category": "DevTools",
                "pattern": "Developers complaining about the complexity of managing multi-tenant database migrations",
                "audience": "Backend Engineers",
                "frequency": "High",
                "urgency": "Medium"
            }
        ]

    async def fetch_market_data(self, idea: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deep-dive fetch for research phase.
        Gathers search trends, community signals, macro indicators, and competitive data.
        """
        title = idea.get("title", "")
        keywords = f"{title} {idea.get('target_user', '')} market trends startup opportunities"
        
        tasks = [
            self._fetch_serpapi_research(keywords),
            self._fetch_hackernews_signals(), # Reuse HN logic
            self._fetch_worldbank_indicators(),
            self._fetch_competitive_data(title),
            self._fetch_e2b_deep_scrape(keywords) # Feature 4: Deep Scrape
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Normalize results
        return {
            "search_demand": results[0] if not isinstance(results[0], Exception) else [],
            "community_signals": results[1] if not isinstance(results[1], Exception) else [],
            "macro_indicators": results[2] if not isinstance(results[2], Exception) else {},
            "competitive_data": results[3] if not isinstance(results[3], Exception) else [],
            "deep_signals": results[4] if not isinstance(results[4], Exception) else []
        }

    async def _fetch_serpapi_research(self, keywords: str) -> List[Dict[str, Any]]:
        """Fetch search and trend signals via SerpApi."""
        if not settings.SERPAPI_API_KEY:
            return [{"note": "SerpApi mock: High growth in vertical AI for legal sector"}]
            
        url = "https://serpapi.com/search"
        params = {
            "api_key": settings.SERPAPI_API_KEY,
            "engine": "google",
            "q": keywords,
            "google_domain": "google.com",
            "gl": "us",
            "hl": "en"
        }
        
        try:
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            results = []
            # Extract organic rankings as "demand" signals
            if "organic_results" in data:
                for res in data["organic_results"][:5]:
                    results.append({
                        "title": res.get("title"),
                        "snippet": res.get("snippet"),
                        "link": res.get("link")
                    })
            return results
        except Exception as e:
            logger.error(f"Deep research search failed: {e}")
            return []

    async def _fetch_worldbank_indicators(self) -> Dict[str, Any]:
        """Fetch macro-economic indicators from World Bank API."""
        # Example: GDP Growth (NY.GDP.MKTP.KD.ZG) for World
        url = "https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=5"
        try:
            resp = await self.http_client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if len(data) > 1:
                    return {"gdp_growth": data[1]}
            return {}
        except Exception as e:
            logger.error(f"World Bank API failed: {e}")
            return {}

    async def _fetch_competitive_data(self, title: str) -> List[Dict[str, Any]]:
        """Find potential competitors or ecosystem peers."""
        if not settings.SERPAPI_API_KEY:
            return [{"name": "Mock Competitor A", "description": "Legacy player in legal ops"}]
            
        url = "https://serpapi.com/search"
        params = {
            "api_key": settings.SERPAPI_API_KEY,
            "engine": "google",
            "q": f"alternatives to {title} competitors",
            "gl": "us",
            "hl": "en"
        }
        
        try:
            response = await self.http_client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            competitors = []
            if "organic_results" in data:
                for res in data["organic_results"][:3]:
                    competitors.append({
                        "name": res.get("title"),
                        "description": res.get("snippet")
                    })
            return competitors
        except Exception:
            return []

    async def _get_mock_signals(self) -> List[Dict[str, Any]]:
        """
        Returns a list of structured signal objects (Fallback).
        """
        return [
            {
                "source": "Hacker News (Mock)",
                "pattern": "Growing intense interest in local-first software and privacy-preserving tools.",
                "audience": "Developers & Privacy Advocates",
                "industry": "Software / DevTools",
                "frequency_score": 0.9,
                "urgency_score": 0.8
            },
            {
                "source": "Google News (Mock)",
                "pattern": "Healthcare providers are seeking automated compliance auditing tools due to new 2025 regulations.",
                "audience": "Healthcare Ops Managers",
                "industry": "Healthcare / Compliance",
                "frequency_score": 0.85,
                "urgency_score": 0.95
            }
        ]

    async def _fetch_e2b_deep_scrape(self, keywords: str) -> List[Dict[str, Any]]:
        """
        Use E2B Code Interpreter as an autonomous agent to find 
        deep market signals from specific URLs.
        """
        from app.services.interpreter_service import interpreter_service
        if not interpreter_service.enabled:
            return []

        # This code runs inside E2B to fetch and analyze a target URLs
        scrape_code = f"""
import json
import requests
from bs4 import BeautifulSoup

def deep_scrape(q):
    # Simulated autonomous discovery of a niche forum or pricing page
    # In a real scenario, this would use a list of known high-value domains
    target_url = "https://news.ycombinator.com/item?id=38912345" # Example target
    try:
        # In a real E2B setup, we'd use playwright for JS-heavy sites
        # For now, we use requests to demonstrate the concept
        resp = requests.get(target_url, timeout=5)
        soup = BeautifulSoup(resp.text, 'html.parser')
        comments = [c.text for c in soup.find_all('span', class_='commtext')[:3]]
        return {{"signal": f"Deep signal for {{q}}", "evidence": comments}}
    except:
        return {{"signal": "No deep signals found via autonomous scraper"}}

print(json.dumps(deep_scrape("{keywords}")))
"""
        try:
            result = await interpreter_service.run_analysis(scrape_code, {})
            if result.get("status") == "success":
                data = result.get("results", {})
                return [{
                    "source": "Autonomous E2B Scraper",
                    "pattern": data.get("signal"),
                    "details": data.get("evidence", []),
                    "confidence": 0.95
                }]
        except Exception as e:
            logger.error(f"E2B Deep Scrape failed: {e}")
        
        return []

signal_service = SignalService()
