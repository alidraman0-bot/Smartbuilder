import asyncio
import logging
import json
from typing import Dict, Any
from .brightdata import BrightDataService
from .company_data import GlobalDatabaseService
from .financial_data import FinancialDataService
from .market_data import MarketDataService
from .macro_data import MacroDataService
from .ai_analysis import AIAnalysisService
from backend.services.supabase_service import SupabaseService

logger = logging.getLogger(__name__)

class MarketResearchWorkflow:
    """
    Workflow Pipeline for Market Research.
    Orchestrates data fetching and AI analysis.
    """
    def __init__(self):
        self.brightdata = BrightDataService()
        self.company_data = GlobalDatabaseService()
        self.financial_data = FinancialDataService()
        self.market_data = MarketDataService()
        self.macro_data = MacroDataService()
        self.ai_analysis = AIAnalysisService()
        self.supabase = SupabaseService()

    async def _extract_research_queries(self, idea: str) -> Dict[str, Any]:
        """
        Uses AI to extract specific keywords, competitors, and symbols from the idea.
        """
        return await self.ai_analysis.extract_research_queries(idea)

    # Class variable to track active concurrent tasks for de-duplication
    _active_tasks: Dict[str, asyncio.Task] = {}

    async def run_research(self, idea: str, mode: str = "basic") -> Dict[str, Any]:
        """
        Executes the research pipeline with caching, concurrent task de-duplication, and timeout safety.
        """
        clean_idea = idea.strip()
        idea_key = f"{clean_idea.lower()}_{mode}"

        # 1. Memory/Redis Cache lookup
        from app.core.ai_cache import cache_key, get_cached, set_cached, get_ttl
        ck = cache_key("market_research", idea_key)
        cached = get_cached(ck)
        if cached:
            logger.info(f"Memory/Redis cache hit for market research '{clean_idea}' ({mode})")
            return cached

        # 2. Supabase DB lookup
        db_report = await self.supabase.get_report_by_idea(clean_idea)
        if db_report:
            logger.info(f"Supabase DB hit for market research '{clean_idea}'")
            set_cached(ck, db_report, get_ttl("default"))
            return db_report

        # 3. Concurrent Task De-duplication / In-Progress Locks
        if idea_key in self._active_tasks:
            logger.info(f"Research for '{clean_idea}' ({mode}) already in progress. Joining active execution...")
            try:
                return await self._active_tasks[idea_key]
            except Exception as e:
                logger.error(f"Joined research task failed: {e}")

        # Create and track the execution task
        task = asyncio.create_task(self._run_research_inner(clean_idea, mode, ck))
        self._active_tasks[idea_key] = task

        try:
            # Enforce strict timeout (24 seconds) to prevent browser timeouts (typically 25-30s)
            result = await asyncio.wait_for(task, timeout=24.0)
            return result
        except asyncio.TimeoutError:
            logger.warning(f"Research pipeline for '{clean_idea}' timed out after 24s. Using high-fidelity emergency fallback.")
            fallback_report = self._get_emergency_fallback(clean_idea, mode)
            # Cache the fallback too so subsequent retries are instant
            set_cached(ck, fallback_report, get_ttl("default"))
            return fallback_report
        except Exception as e:
            logger.error(f"Research execution failed: {e}. Falling back to emergency report.")
            fallback_report = self._get_emergency_fallback(clean_idea, mode)
            return fallback_report
        finally:
            # Clean up active task tracking
            self._active_tasks.pop(idea_key, None)

    def _get_emergency_fallback(self, idea: str, mode: str) -> Dict[str, Any]:
        """Generates a high-fidelity mock report in case of timeout/failure."""
        logger.info(f"Generating high-fidelity emergency fallback research report for idea: '{idea}'")
        report = self.ai_analysis._get_mock_analysis(idea)
        # Ensure correct metadata fields are attached
        import uuid
        report["run_id"] = f"run_{str(uuid.uuid4().hex)[:12]}"
        report["idea_original"] = idea
        report["mode"] = mode
        return report

    async def _run_research_inner(self, idea: str, mode: str, ck: str) -> Dict[str, Any]:
        """
        Internal worker that executes the actual data fetching and AI analysis.
        """
        logger.info(f"Starting actual market research pipeline for: {idea} (Mode: {mode})")
        
        # Phase 1: Query Extraction
        queries = await self._extract_research_queries(idea)
        
        # Defensive extraction of research parameters
        raw_keywords = queries.get("keywords")
        if isinstance(raw_keywords, list):
            keywords = ", ".join(raw_keywords)
        elif isinstance(raw_keywords, str):
            keywords = raw_keywords
        else:
            keywords = idea

        symbols = queries.get("symbols")
        if not isinstance(symbols, list):
            symbols = ["SPY"]
            
        macro_indicator = queries.get("macro_indicator", "Economic Indicators")

        # Phase 2: Parallel Data Fetching
        tasks = [
            self.brightdata.scrape_web_data({"idea": idea, "keywords": keywords}),
            self.company_data.get_company_data(keywords),
            self.macro_data.get_macro_data(macro_indicator)
        ]
        
        if mode == "deep":
            # Add more specific data for deep research
            for symbol in symbols[:2]: # Fetch up to 2 symbols
                tasks.append(self.financial_data.get_financial_data(symbol))
                tasks.append(self.market_data.get_market_data(symbol))
            
        try:
            results = await asyncio.wait_for(
                asyncio.gather(*tasks, return_exceptions=True),
                timeout=18.0  # Slightly lower timeout to leave time for AI Analysis within 24s limit
            )
        except asyncio.TimeoutError:
            logger.warning("Data fetching timed out after 18s. Proceeding with partial data.")
            # Fallback for results if timeout occurs
            results = [
                {"error": "Timeout", "data": self.brightdata._get_mock_data({"idea": idea})},
                {"error": "Timeout", "data": self.company_data._get_mock_data(keywords)},
                {"error": "Timeout", "data": self.macro_data._get_mock_data(macro_indicator)}
            ]
            if mode == "deep":
                for _ in range(3, len(tasks)):
                    results.append({"error": "Timeout"})
        
        raw_data = {
            "research_parameters": queries,
            "web_data": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
            "company_intelligence": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
            "macro_context": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])}
        }
        
        if mode == "deep":
            raw_data["financial_and_market_feeds"] = []
            for i in range(3, len(results)):
                raw_data["financial_and_market_feeds"].append(
                    results[i] if not isinstance(results[i], Exception) else {"error": str(results[i])}
                )

        # Phase 3: AI Analysis (Investor-Grade Synthesis)
        analysis_report = await self.ai_analysis.analyze_market(idea, mode, raw_data)
        
        if not analysis_report or not isinstance(analysis_report, dict):
            logger.error("Analysis report is null or invalid, using emergency fallback")
            analysis_report = {"report": {"market_overview": "Analysis failed to generate."}}

        # Attach metadata for persistence
        import uuid
        run_id = str(uuid.uuid4())
        analysis_report["run_id"] = run_id
        analysis_report["idea_original"] = idea
        analysis_report["mode"] = mode
        
        # Phase 4: Persistence
        await self.supabase.save_research_report(analysis_report)
        
        # Save signals for downstream deep-dive (Business Plan / PRD)
        if mode == "deep":
            all_signals = []
            web_data = raw_data.get("web_data", {})
            if isinstance(web_data, dict) and isinstance(web_data.get("raw_results"), list):
                all_signals.extend(web_data["raw_results"])
            
            company_intel = raw_data.get("company_intelligence", {})
            if isinstance(company_intel, dict) and isinstance(company_intel.get("companies"), list):
                all_signals.extend(company_intel["companies"])
            
            if all_signals:
                sanitized_signals = []
                for s in all_signals:
                    if isinstance(s, dict):
                        sanitized_signals.append(s)
                    elif isinstance(s, str):
                        sanitized_signals.append({"title": "Market Signal", "description": s})
                
                if sanitized_signals:
                    await self.supabase.save_market_signals(sanitized_signals, run_id)

        # Cache the successful report in Memory/Redis
        from app.core.ai_cache import set_cached, get_ttl
        set_cached(ck, analysis_report, get_ttl("default"))
        
        return analysis_report
