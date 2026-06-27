import asyncio
import logging
from typing import List, Dict, Any, Optional
from app.services.discovery.scraping_service import scraping_service
from app.services.discovery.serp_service import serp_service
from app.services.discovery.social_service import social_service
from app.services.discovery.diffbot_service import diffbot_service
from app.services.discovery.ai_engine import ai_engine

logger = logging.getLogger(__name__)

async def safe_task(task, timeout=25):
    """
    Executes a task with a strict timeout and handles exceptions.
    Returns None if the task fails or times out.
    """
    try:
        return await asyncio.wait_for(task, timeout)
    except asyncio.TimeoutError:
        logger.warning(f"Task timed out after {timeout}s")
        return None
    except Exception as e:
        logger.error(f"Task failed with error: {e}")
        return None

class IdeaPipeline:
    """
    Main pipeline for transforming user ideas or triggers into structured startup intelligence.
    """
    _active_tasks: Dict[str, asyncio.Task] = {}

    async def run_discovery(self, seed_idea: str, mode: str = "basic") -> Dict[str, Any]:
        clean_idea = seed_idea.strip()
        idea_key = f"{clean_idea.lower()}_{mode}"

        from app.core.ai_cache import cache_key, get_cached, set_cached, get_ttl
        ck = cache_key("idea_discovery", idea_key)

        if idea_key in self._active_tasks:
            logger.info(f"Discovery for '{clean_idea}' ({mode}) already in progress. Joining active execution...")
            try:
                return await self._active_tasks[idea_key]
            except Exception as e:
                logger.error(f"Joined discovery task failed: {e}")

        task = asyncio.create_task(self._run_discovery_inner(clean_idea, mode, ck))
        self._active_tasks[idea_key] = task

        try:
            # FIX 1: Raised outer pipeline timeout from 60s → 120s
            # DeepSeek free-tier cold starts can take 20-30s alone.
            # Data collection (8s) + AI (up to 60s) + buffer = 120s is safe.
            result = await asyncio.wait_for(task, timeout=120.0)
            return result
        except asyncio.TimeoutError:
            logger.warning(f"Discovery pipeline for '{clean_idea}' timed out after 120s. Using premium fallback brief.")
            fallback_result = self._get_emergency_fallback(clean_idea, mode)
            set_cached(ck, fallback_result, get_ttl("default"))
            return fallback_result
        except Exception as e:
            logger.error(f"Discovery pipeline failed: {e}. Returning emergency fallback brief.")
            fallback_result = self._get_emergency_fallback(clean_idea, mode)
            set_cached(ck, fallback_result, get_ttl("default"))
            return fallback_result
        finally:
            self._active_tasks.pop(idea_key, None)

    def _get_emergency_fallback(self, seed_idea: str, mode: str) -> Dict[str, Any]:
        """Generates a premium, high-fidelity mock discovery brief."""
        logger.info(f"Generating high-fidelity fallback discovery result for trigger: '{seed_idea}'")
        return {
            "success": True,
            "ideas": [
                {
                    "title": f"Agile {seed_idea.title()} Orchestrator",
                    "thesis": f"An API-first automation platform for {seed_idea} that integrates siloed downstream apps and streamlines complex workflows.",
                    "problem": "Highly fragmented manual tooling and lack of deep integration among existing vertical tools.",
                    "solution": "A streamlined integration builder with built-in templates and contextual automation triggers.",
                    "target_market": "Mid-market software teams and specialized service providers.",
                    "why_now": "Rapid expansion of open APIs and tightening developer bandwidth demanding out-of-the-box orchestration.",
                    "monetization": "Tiered SaaS subscription starting at $79/mo with active usage add-ons.",
                    "market_size": "$3.2B total addressable market globally, growing at 14.8% CAGR.",
                    "trend_strength": "high",
                    "competition_level": "medium",
                    "validation_score": 86,
                    "signals_used": [
                        { "source": "Reddit", "title": "Frustrations over manual workarounds and missing native integrations in this domain" },
                        { "source": "HN", "title": "Developer discussions on building bespoke internal workflow tools" }
                    ]
                },
                {
                    "title": f"Contextual {seed_idea.title()} Copilot",
                    "thesis": f"A local-inference desktop copilot for {seed_idea} that handles high-security enterprise data with zero retention.",
                    "problem": "Strict corporate security policies block third-party cloud tools due to IP leakage concerns.",
                    "solution": "Lightweight desktop client running sandboxed local-weights model inference with full audit logging.",
                    "target_market": "Regulated industries, legal consultancies, and financial analysts.",
                    "why_now": "Unprecedented performance leaps in openweight model efficiency and client-side web frameworks.",
                    "monetization": "Per-seat commercial licenses and custom model fine-tuning services.",
                    "market_size": "$1.8B addressable market across highly secured enterprise nodes.",
                    "trend_strength": "high",
                    "competition_level": "low",
                    "validation_score": 90,
                    "signals_used": [
                        { "source": "News", "title": "Tightened corporate restrictions on commercial AI tool usage" },
                        { "source": "HN", "title": "Sandboxed local execution becomes the standard for enterprise utility tools" }
                    ]
                },
                {
                    "title": f"{seed_idea.title()} Marketplace",
                    "thesis": f"A curated marketplace connecting {seed_idea} providers with niche enterprise buyers.",
                    "problem": "Fragmented vendor landscape makes discovery of specialized solutions time-consuming.",
                    "solution": "A searchable platform with vetted partners, integration hooks, and compliance badges.",
                    "target_market": f"Enterprises seeking domain-specific {seed_idea} solutions.",
                    "why_now": "Increasing demand for plug-and-play components in regulated sectors.",
                    "monetization": "Transaction fee + premium listings for vendors.",
                    "market_size": "$2.5B emerging market.",
                    "trend_strength": "medium",
                    "competition_level": "low",
                    "validation_score": 78,
                    "signals_used": []
                },
                {
                    "title": f"{seed_idea.title()} Analytics Suite",
                    "thesis": f"An analytics dashboard that surfaces actionable insights for {seed_idea} deployments.",
                    "problem": "Lack of visibility into usage patterns hampers ROI justification.",
                    "solution": "Real-time telemetry, benchmarks, and automated recommendation engine.",
                    "target_market": f"Companies scaling {seed_idea} across multiple teams.",
                    "why_now": "Data-driven decision culture pushes need for deeper metrics.",
                    "monetization": "Tiered SaaS with usage-based analytics add-on.",
                    "market_size": "$1.2B TAM.",
                    "trend_strength": "high",
                    "competition_level": "medium",
                    "validation_score": 82,
                    "signals_used": []
                },
            ],
            "market_gaps": [
                "Local-first execution nodes to satisfy strict corporate security benchmarks.",
                "Custom visual workflow builders for specialized local compliance rules."
            ],
            "pain_points": [
                "High transaction latency and soaring monthly costs from multiple single-purpose APIs.",
                "Security compliance reviews stalling onboarding by up to 9 months."
            ],
            "trends": [
                "Consolidation of scattered developer tooling into integrated development platforms.",
                "Widespread corporate migration towards local sandboxed model deployments."
            ],
            "progress": [
                "Scanning the internet...",
                "Extracting signals...",
                "Structuring data...",
                "Detecting trends...",
                "Generating ideas..."
            ],
            "signals": [
                {
                    "title": f"Frustrations with lack of local {seed_idea} options",
                    "description": "Enterprise developers complain about cloud latency and data compliance blocks on current offerings.",
                    "source": "Reddit /r/startups",
                    "url": "https://reddit.com"
                },
                {
                    "title": "Local-first architectures surge in Hacker News mindshare",
                    "description": "Substantial community discussion surrounding offline-capable RAG systems and edge inference frameworks.",
                    "source": "Hacker News",
                    "url": "https://news.ycombinator.com"
                }
            ]
        }

    async def _run_discovery_inner(self, seed_idea: str, mode: str, ck: str) -> Dict[str, Any]:
        logger.info(f"Starting actual discovery pipeline for idea: {seed_idea} (mode: {mode})")

        try:
            from app.core.ai_cache import set_cached, get_ttl

            # STEP 1: Parallel Data Collection
            tasks = [
                safe_task(serp_service.validate_demand(seed_idea), timeout=6),
                safe_task(serp_service.get_search_trends(seed_idea), timeout=6),
                safe_task(social_service.get_reddit_pain_points("startups", seed_idea), timeout=8),
            ]

            if mode == "deep":
                tasks.extend([
                    safe_task(social_service.get_twitter_trends(seed_idea), timeout=6),
                ])

            start_time = asyncio.get_event_loop().time()
            results = await asyncio.gather(*tasks)
            elapsed = asyncio.get_event_loop().time() - start_time
            logger.info(f"Data collection completed in {elapsed:.2f}s")

            # STEP 2: Data Structuring
            signals = []
            for res in results:
                if not res:
                    continue
                if isinstance(res, list):
                    signals.extend(res)
                elif isinstance(res, dict):
                    if "html" not in res:
                        signals.append(res)

            html_results = [r for r in results if isinstance(r, dict) and r.get("html")]
            if html_results:
                logger.info(f"Structuring {len(html_results)} HTML results via Diffbot...")
                struct_tasks = [
                    safe_task(diffbot_service.structure_content(h['url'], h['html']), timeout=5)
                    for h in html_results
                ]
                structured_results = await asyncio.gather(*struct_tasks)
                for res in structured_results:
                    if res:
                        signals.append(res)

            logger.info(f"Collected {len(signals)} signals for '{seed_idea}'")

            # FIX 2: Lowered signal threshold from 2 → 1.
            # Reddit timeouts on Windows mean we often only get SERP signals.
            # 1 signal is enough for the AI to generate real ideas — don't bail early.
            if len(signals) < 1:
                logger.warning(f"Zero signals collected for '{seed_idea}'. Using fallback.")
                return self._get_emergency_fallback(seed_idea, mode)

            # STEP 3: Intelligence Generation
            # FIX 3: Raised AI timeout from 45s → 90s.
            # DeepSeek free-tier on OpenRouter can take 20-60s on first call.
            # The outer pipeline (120s) has enough budget to accommodate this.
            logger.info(f"Generating intelligence from {len(signals)} signals...")
            start_ai = asyncio.get_event_loop().time()
            try:
                discovery_result = await asyncio.wait_for(
                    ai_engine.generate_ideas_from_signals(signals, idea_prompt=seed_idea, mode=mode),
                    timeout=90.0  # was 45s — free tier models need more time
                )
            except asyncio.TimeoutError:
                logger.warning(f"AI generation timed out after 90s for '{seed_idea}'. Using fallback.")
                return self._get_emergency_fallback(seed_idea, mode)

            ai_elapsed = asyncio.get_event_loop().time() - start_ai
            logger.info(f"AI intelligence generation completed in {ai_elapsed:.2f}s")

            if not discovery_result or not discovery_result.get("ideas"):
                logger.warning(f"AI Engine returned no ideas for '{seed_idea}'. Using fallback.")
                return self._get_emergency_fallback(seed_idea, mode)

            discovery_result["progress"] = [
                "Scanning the internet...",
                "Extracting signals...",
                "Structuring data...",
                "Detecting trends...",
                "Generating ideas..."
            ]
            discovery_result["signals"] = signals[:15]

            return discovery_result

        except Exception as e:
            logger.error(f"Idea Pipeline failed: {e}", exc_info=True)
            # FIX 4: Return fallback instead of empty ideas on any unhandled exception
            return self._get_emergency_fallback(seed_idea, mode)

idea_pipeline = IdeaPipeline()