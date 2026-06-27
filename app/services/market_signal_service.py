import logging
import httpx
from app.core.http_client import http_client
import asyncio
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import json
from app.core.supabase import get_service_client, get_async_service_client
from app.core.ai_client import get_ai_client
from app.core.config import settings
from app.models.market_signal import MarketSignalCreate, MarketSignal
from app.core.retry import retry_request

logger = logging.getLogger(__name__)

class MarketSignalService:
    def __init__(self):
        self.supabase = get_service_client()
        self.ai = get_ai_client()
        self.timeout = httpx.Timeout(30.0)
        self.serpapi_key = settings.SERPAPI_API_KEY

    async def fetch_reddit_signals(self) -> List[Dict[str, Any]]:
        queries = ["startup problems", "saas ideas", "founder problem", "what should I build"]
        headers = {'User-Agent': 'Smartbuilder/1.0'}
        
        async def fetch_query(query: str):
            try:
                url = f"https://www.reddit.com/search.json?q={query}&sort=new&limit=10"
                response = await retry_request(lambda: http_client.get(url, headers=headers))
                if response.status_code == 200:
                    data = response.json()
                    return [{
                        'source': 'reddit',
                        'title': p['data'].get('title', ''),
                        'description': p['data'].get('selftext', '')[:500],
                        'url': f"https://reddit.com{p['data'].get('permalink')}",
                        'engagement': p['data'].get('score', 0) + p['data'].get('num_comments', 0),
                        'created_utc': p['data'].get('created_utc', 0)
                    } for p in data.get('data', {}).get('children', [])]
            except Exception as e:
                logger.error(f"Error fetching Reddit signals for '{query}': {e}")
            return []

        results = await asyncio.gather(*(fetch_query(q) for q in queries))
        return [item for sublist in results for item in sublist]

    async def fetch_hn_signals(self) -> List[Dict[str, Any]]:
        queries = ["startup", "problem", "saas", "ai tool"]
        
        async def fetch_query(query: str):
            try:
                url = f"http://hn.algolia.com/api/v1/search_by_date?query={query}&tags=story&hitsPerPage=10"
                response = await retry_request(lambda: http_client.get(url))
                if response.status_code == 200:
                    data = response.json()
                    return [{
                        'source': 'hn',
                        'title': hit.get('title', ''),
                        'description': hit.get('story_text', '')[:500] if hit.get('story_text') else None,
                        'url': hit.get('url') or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                        'engagement': hit.get('points', 0) + hit.get('num_comments', 0),
                        'created_utc': hit.get('created_at_i', 0)
                    } for hit in data.get('hits', [])]
            except Exception as e:
                logger.error(f"Error fetching HN signals for '{query}': {e}")
            return []

        results = await asyncio.gather(*(fetch_query(q) for q in queries))
        return [item for sublist in results for item in sublist]

    async def fetch_news_signals(self) -> List[Dict[str, Any]]:
        queries = ["startup funding", "ai startup", "fintech startup", "developer tools"]
        
        async def fetch_query(query: str):
            try:
                url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}&hl=en-US&gl=US&ceid=US:en"
                response = await retry_request(lambda: http_client.get(url))
                if response.status_code == 200:
                    root = ET.fromstring(response.text)
                    channel = root.find("channel")
                    if channel:
                        items = channel.findall("item")
                        query_signals = []
                        for item in items[:10]:
                            title = item.findtext("title")
                            link = item.findtext("link")
                            pub_date = item.findtext("pubDate")
                            
                            dt = 0
                            if pub_date:
                                try:
                                    dt_obj = datetime.strptime(pub_date, "%a, %d %b %Y %H:%M:%S %Z")
                                    dt = dt_obj.timestamp()
                                except:
                                    dt = datetime.now().timestamp()
                            
                            query_signals.append({
                                'source': 'news',
                                'title': title,
                                'description': '',
                                'url': link,
                                'engagement': 0,
                                'created_utc': dt
                            })
                        return query_signals
            except Exception as e:
                logger.error(f"Error fetching News signals for '{query}': {e}")
            return []

        results = await asyncio.gather(*(fetch_query(q) for q in queries))
        return [item for sublist in results for item in sublist]

    def calculate_signal_strength(self, signal: Dict[str, Any]) -> float:
        # 1. Engagement score (normalized somewhat)
        engagement = signal.get('engagement', 0)
        # Cap at 500
        engagement_score = min(engagement / 5.0, 100.0) 

        # 2. Recency score. Max 100 if now, decaying over a week
        now = datetime.now(timezone.utc).timestamp()
        age_seconds = now - signal.get('created_utc', now)
        age_days = age_seconds / (3600 * 24)
        recency_score = max(100.0 - (age_days * 10), 0.0)

        # 3. Keyword Match priority. 
        title_lower = signal.get('title', '').lower()
        desc_lower = (signal.get('description') or '').lower()
        keyword_score = 0.0
        hot_keywords = ["problem", "frustrated", "hate", "wish", "startup", "ai", "saas", "paying", "revenue"]
        for kw in hot_keywords:
            if kw in title_lower or kw in desc_lower:
                keyword_score += 10.0
        keyword_score = min(keyword_score, 100.0)

        return (engagement_score * 0.4) + (recency_score * 0.4) + (keyword_score * 0.2)

    def determine_category(self, signal: Dict[str, Any]) -> str:
        text = (signal.get('title', '') + " " + (signal.get('description') or '')).lower()
        if "problem" in text or "frustrated" in text or "hate" in text or "fix" in text:
            return "problem"
        elif "launch" in text or "product" in text or "app" in text or "tool" in text:
            return "product"
        else:
            return "trend"

    async def get_market_signals(self) -> List[MarketSignal]:
        try:
            # 1. Check cache > 30 mins
            thirty_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=30)
            # Increase limit to 100 to allow for random sampling
            async_supabase = await get_async_service_client()
            result = await async_supabase.table("market_signals").select("*").order("signal_strength", desc=True).limit(100).execute()
            
            cached_signals = result.data
            
            # If we have recent signals, return them (but shuffled/sampled for variety)
            should_refresh = True
            if cached_signals:
                most_recent_str = cached_signals[0].get('created_at')
                if most_recent_str:
                    try:
                        # Postgres timestamp format
                        most_recent = datetime.fromisoformat(most_recent_str.replace("Z", "+00:00"))
                        if most_recent > thirty_mins_ago:
                            should_refresh = False
                    except Exception as e:
                        logger.warning(f"Error parsing date {most_recent_str}: {e}")

            if not should_refresh:
                import random
                # Shuffle and take a random sample of 20 to ensure variety across users/requests
                sampled = random.sample(cached_signals, min(len(cached_signals), 20))
                return [MarketSignal(**s) for s in sampled]

            # 2. Fetch new signals if cache is old or empty
            logger.info("Fetching new market signals...")
            results = await asyncio.gather(
                self.fetch_reddit_signals(),
                self.fetch_hn_signals(),
                self.fetch_news_signals()
            )
            
            all_raw = []
            for res in results:
                all_raw.extend(res)
                
            # Process and rank
            processed_signals = []
            # Use unique URLs to avoid duplicates
            seen_urls = set()
            for rp in all_raw:
                url = rp.get('url')
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                
                signal_strength = self.calculate_signal_strength(rp)
                category = self.determine_category(rp)
                
                processed_signals.append(MarketSignalCreate(
                    source=rp['source'],
                    title=rp['title'],
                    description=rp.get('description'),
                    url=url,
                    signal_strength=round(signal_strength, 2),
                    category=category
                ))
            
            # Sort by strength desc
            processed_signals.sort(key=lambda x: x.signal_strength, reverse=True)
            top_20 = processed_signals[:20]
            
            # 3. Save to Supabase
            if top_20:
                async_supabase = await get_async_service_client()
                # To keep the table small, delete old signals before inserting new ones
                await async_supabase.table("market_signals").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
                
                save_data = [s.model_dump() for s in top_20]
                resp = await async_supabase.table("market_signals").insert(save_data).execute()
                
                if resp.data:
                    return [MarketSignal(**s) for s in resp.data]
            
            return []

        except Exception as e:
            logger.error(f"Error in get_market_signals: {e}")
            # Fallback to reading whatever is in DB if fetch fails
            try:
                async_supabase = await get_async_service_client()
                result = await async_supabase.table("market_signals").select("*").order("signal_strength", desc=True).limit(20).execute()
                return [MarketSignal(**s) for s in result.data]
            except:
                return []

    async def extract_market_keywords(self, startup_idea: str, idea_id: Optional[str] = None) -> List[str]:
        """
        Use AI to extract 5–8 high-value market keywords related to the startup idea.
        Checks cache first if idea_id is provided.
        """
        try:
            # 1. Check DB Cache
            if idea_id:
                try:
                    async_supabase = await get_async_service_client()
                    cached = await async_supabase.table("market_keywords").select("keywords").eq("idea_id", idea_id).execute()
                    if cached.data:
                        logger.info(f"Using cached keywords for idea {idea_id}")
                        return cached.data[0]["keywords"]
                except Exception as db_e:
                    logger.warning(f"Failed to fetch cached keywords: {db_e}")

            # 2. Extract with AI (Using Fast Model)
            system_prompt = """You are a market research expert. 
Extract 5-8 high-value, specific search keywords that someone would use to find products, competitors, or discussions related to this startup idea.
Focus on high-intent commercial keywords and niche descriptors.

Your response MUST be ONLY a valid JSON object. No markdown. No explanations. No trailing commas.

Schema:
{
  "keywords": ["keyword1", "keyword2", ...]
}"""
            
            # Use task-aware AI router for keyword extraction
            response = await self.ai.routed_completion(
                task="keyword_extraction",
                messages=[{"role": "user", "content": f"Startup Idea: {startup_idea}"}],
                system_prompt=system_prompt,
                response_format={"type": "json_object"},
            )
            
            content = response.get('content')
            if not content:
                logger.warning("AI returned empty content for keywords")
                return []

            from app.utils.json_helper import safe_json_parse
            data = safe_json_parse(content)
            keywords = data.get('keywords', [])
            
            if idea_id and keywords:
                try:
                    async_supabase = await get_async_service_client()
                    # Table lacks UNIQUE constraint — use insert, ignore duplicates
                    await async_supabase.table("market_keywords").insert({
                        "idea_id": idea_id,
                        "keywords": keywords
                    }).execute()
                except Exception as save_e:
                    err_str = str(save_e)
                    if "duplicate" in err_str.lower() or "23505" in err_str:
                        logger.debug(f"Keywords already exist for idea {idea_id}, skipping")
                    else:
                        logger.error(f"Failed to save keywords: {save_e}")
                
            return keywords
        except Exception as e:
            logger.error(f"Error extracting keywords: {e}")
            return []

    async def detect_competitors(self, startup_idea: str, idea_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Use AI + search queries to detect existing companies solving similar problems.
        """
        try:
            # Step 1: Search for competitors using SerpApi if available, otherwise use AI knowledge
            competitors = []
            
            search_query = f"competitors for {startup_idea}"
            
            if self.serpapi_key:
                client = http_client
                params = {
                    "q": search_query,
                    "api_key": self.serpapi_key,
                    "engine": "google"
                }
                resp = await retry_request(lambda: client.get("https://serpapi.com/search", params=params))
                if resp.status_code == 200:
                    search_results = resp.json()
                    # Pass snippet data to AI to extract competitor names and details
                    organic_results = search_results.get("organic_results", [])
                    snippets = "\n".join([f"- {r.get('title')}: {r.get('snippet')}" for r in organic_results[:10]])
                    
                    system_prompt = """You are a competitive intelligence analyst. 
Based on the startup idea and the search results provided, identify the top 5 direct or indirect competitors.
For each competitor, provide: name, brief description, website (if found), and an approximate funding estimate (if known, else 'N/A').

Response MUST be ONLY a valid JSON object. No markdown. No explanations. No trailing commas.

Schema:
{
  "competitors": [
    {"company_name": "...", "description": "...", "website": "...", "funding_estimate": "..."}
  ]
}"""
                    
                    user_msg = f"Startup Idea: {startup_idea}\n\nSearch Results:\n{snippets}"
                    
                    ai_resp = await self.ai.routed_completion(
                        task="competitor_analysis",
                        messages=[{"role": "user", "content": user_msg}],
                        system_prompt=system_prompt,
                        response_format={"type": "json_object"}
                    )
                    from app.utils.json_helper import safe_json_parse
                    competitors = safe_json_parse(ai_resp['content']).get('competitors', [])
            
            if not competitors:
                # Fallback to pure AI if no SerpApi or search failed
                logger.info("Falling back to pure AI for competitor detection...")
                system_prompt = """Identify top 5 competitors for this startup idea.
Response MUST be ONLY a valid JSON object. No markdown. No explanations. No trailing commas.

Schema:
{
  "competitors": [
    {"company_name": "...", "description": "...", "website": "...", "funding_estimate": "..."}
  ]
}"""
                ai_resp = await self.ai.routed_completion(
                    task="competitor_analysis",
                    messages=[{"role": "user", "content": startup_idea}],
                    system_prompt=system_prompt,
                    response_format={"type": "json_object"},
                )
                
                from app.utils.json_helper import safe_json_parse
                competitors = safe_json_parse(ai_resp['content']).get('competitors', [])

            if idea_id and competitors:
                try:
                    db_data = []
                    for comp in competitors[:5]:
                        db_data.append({
                            "idea_id": idea_id,
                            "company_name": comp.get('company_name'),
                            "description": comp.get('description'),
                            "website": comp.get('website'),
                            "funding_estimate": comp.get('funding_estimate')
                        })
                    async_supabase = await get_async_service_client()
                    # Table may lack UNIQUE constraint — use insert, ignore duplicates
                    for comp_record in db_data:
                        try:
                            await async_supabase.table("competitor_signals").insert(comp_record).execute()
                        except Exception as comp_e:
                            err_str = str(comp_e)
                            if "duplicate" in err_str.lower() or "23505" in err_str:
                                pass  # Already exists
                            else:
                                logger.warning(f"Failed to save competitor {comp_record.get('company_name')}: {comp_e}")
                except Exception as db_e:
                    logger.error(f"Failed to save competitors: {db_e}")
                
            return competitors[:5]
        except Exception as e:
            logger.error(f"Error detecting competitors for '{startup_idea}': {e}")
            return []
