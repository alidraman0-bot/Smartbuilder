import os
import logging
import asyncio
from typing import Dict, Any, List, Optional
from supabase import create_client, Client, AsyncClient
from app.core.supabase import get_async_service_client

logger = logging.getLogger(__name__)

class SupabaseService:
    """
    Service for interacting with Supabase.
    Used for persisting research reports, projects, and other system data.
    """
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL", "")
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY", "")
        # Table name can be overridden via env var for flexibility (e.g., during migrations)
        self.table_name = os.getenv("SUPABASE_RESEARCH_TABLE", "research_reports")
        
        if not self.url or not self.key:
            logger.warning("Supabase credentials missing. Persistence will be disabled.")
            self.client = None
        else:
            try:
                self.client: Client = create_client(self.url, self.key)
                logger.info("Supabase sync client initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.client = None

    async def save_research_report(self, report_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Saves a generated research report to the 'research_reports' table.
        """
        async_client = await get_async_service_client()
        if not async_client:
            logger.warning("Supabase async client not available. Report not saved.")
            return None

        try:
            payload = {
                "id": report_data.get("run_id"),
                "idea": report_data.get("idea_original"),
                "mode": report_data.get("mode"),
                "confidence_score": report_data.get("confidence_score"),
                "summary": report_data.get("summary"),
                "full_report": report_data,
                "created_at": "now()",
            }
            
            result = await asyncio.wait_for(
                async_client.table(self.table_name).upsert(payload).execute(),
                timeout=10.0 # Strict 10s timeout for DB persistence
            )
            
            if result:
                logger.info(f"Research report successfully persisted to Supabase: {report_data.get('run_id')}")
            return result.data[0] if result and result.data else None
            
        except asyncio.TimeoutError:
            logger.error("Supabase persistence timed out after 10s. Continuing research workflow.")
            return None
        except Exception as e:
            logger.error(f"Error in save_research_report: {e}")
            return None

    async def save_market_signals(self, signals: List[Dict[str, Any]], idea_id: str):
        """
        Saves a batch of market signals linked to an idea.
        """
        async_client = await get_async_service_client()
        if not async_client or not signals:
            return

        try:
            payload = []
            for sig in signals:
                payload.append({
                    "idea_id": idea_id,
                    "title": sig.get("title") or sig.get("name") or "Market Signal",
                    "description": sig.get("description") or sig.get("summary") or str(sig),
                    "signal_strength": sig.get("signal_strength", 70),
                    "category": sig.get("category", "General"),
                    "created_at": "now()"
                })
            await async_client.table("market_signals").insert(payload).execute()
        except Exception as e:
            logger.error(f"Supabase save_market_signals error: {e}")

    async def get_reports(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Retrieves recent research reports.
        """
        if not self.client:
            return []

        try:
            async_client = await get_async_service_client()
            result = await async_client.table(self.table_name) \
                .select("*") \
                .order("created_at", desc=True) \
                .limit(limit) \
                .execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching reports from Supabase: {e}")
            return []

    async def get_report_by_idea(self, idea: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a research report matching the given idea/query string.
        """
        async_client = await get_async_service_client()
        if not async_client:
            return None

        try:
            clean_idea = idea.strip()
            # Try exact match first
            result = await async_client.table(self.table_name) \
                .select("*") \
                .eq("idea", clean_idea) \
                .limit(1) \
                .execute()
            if result and result.data:
                logger.info(f"Supabase exact cache hit for idea: '{clean_idea}'")
                return result.data[0]["full_report"]

            # Fallback to loose case-insensitive match
            result = await async_client.table(self.table_name) \
                .select("*") \
                .ilike("idea", f"%{clean_idea}%") \
                .limit(1) \
                .execute()
            if result and result.data:
                logger.info(f"Supabase ilike cache hit for idea: '{clean_idea}'")
                return result.data[0]["full_report"]
        except Exception as e:
            logger.error(f"Error fetching report by idea from Supabase: {e}")
        return None
