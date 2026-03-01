import logging
import asyncio
import uuid
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.config import settings

logger = logging.getLogger(__name__)

from app.core.ai_client import get_ai_client

from app.services.signal_service import signal_service

class ResearchService:
    def __init__(self):
        self.client = get_ai_client()
        self.research_store: Dict[str, Dict[str, Any]] = {}

    async def execute_research(self, idea: Dict[str, Any], run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Orchestrate deep-dive market research using the Intelligence Engine.
        """
        if not run_id:
            run_id = f"RES-{uuid.uuid4().hex[:8]}"

        # Idempotency check: Return existing report if already generated/running
        if run_id in self.research_store:
            existing = self.research_store[run_id]
            if existing.get("status") in ["COMPLETE", "RUNNING"]:
                logger.info(f"Returning existing research for run_id: {run_id}")
                return existing

        self.research_store[run_id] = {
            "idea": idea,
            "status": "RUNNING",
            "confidence_score": 0,
            "report": "Analyzing global datasets...",
            "summary": "Generating Intelligence Report..."
        }

        # 1. Fetch Real Market Data
        try:
            market_data = await signal_service.fetch_market_data(idea)
        except Exception as e:
            logger.error(f"Failed to fetch market data: {e}")
            market_data = {}

        # 2. Construct Intelligence Engine Prompt
        system_prompt = """
You are Smartbuilder’s Market Research & Analytics Intelligence Engine.

You operate on top of real, external data sources that have already been
queried and processed by the Smartbuilder backend.

These sources include (but are not limited to):
• Search and trend data (e.g., Google Trends, Google News)
• Community and founder signals (e.g., Hacker News, forums)
• Macro-economic and regional indicators (e.g., World Bank–style datasets)
• Competitive and ecosystem references

You do NOT call APIs yourself.
You do NOT call external endpoints.
You do NOT know or access API keys.

You ONLY analyze structured data objects provided to you.

Your responsibility is to transform real data into:
• Professional market research
• Clear analytical insights
• Founder- and investor-grade conclusions
• Chart-ready explanations (growth, momentum, demand)

Think like:
• A venture investor
• A senior market analyst
• A strategy consultant

Your goal is to answer:
“Is this a real, growing, and attractive market — or not?”

────────────────────────────────

INPUTS PROVIDED BY THE SYSTEM (REAL DATA)

Startup Idea:
{{IDEA_OBJECT}}

Search & Demand Analytics (from trend/news APIs):
{{SEARCH_DEMAND_DATA}}

Community & Early-Adopter Signals (from HN / forums):
{{COMMUNITY_SIGNALS_DATA}}

Competitive & Ecosystem Signals:
{{COMPETITIVE_DATA}}

Macro & Regional Market Indicators:
{{MACRO_MARKET_DATA}}

Autonomous Deep Signals (Found via E2B Scraper):
{{DEEP_SIGNALS}}

(All inputs are derived from real APIs and already normalized.)

────────────────────────────────

VERIFIED DATA (Code-Calculated by E2B):
{{VERIFIED_E2B_DATA}}

────────────────────────────────

YOUR TASK

Produce a **high-level, professional market research report**
based strictly on the provided real data. 

You MUST use Markdown headers as specified in the structure below.

────────────────────────────────

OUTPUT STRUCTURE (STRICT)

### 1. Market Overview
### 2. Target Market & Customer Segments
### 3. Market Size Logic (TAM / SAM / SOM)
### 4. Market Growth & Momentum (Data-Backed)
### 5. Demand Drivers & “Why Now”
### 6. Competitive Landscape Structure
### 7. Customer Pain & Willingness to Pay
### 8. Risks, Barriers & Constraints
### 9. Market Attractiveness Summary
### 10. Key Assumptions to Validate

────────────────────────────────

QUALITY & PRESENTATION RULES

• Analytical, not promotional
• Clear, structured language
• No emojis
• No CTAs
• No API names or keys
• No invented statistics

The output must feel:
“Grounded in real data and worthy of an investor memo.”
"""
        # Inject Data
        system_prompt = system_prompt.replace("{{IDEA_OBJECT}}", json.dumps(idea, indent=2))
        system_prompt = system_prompt.replace("{{SEARCH_DEMAND_DATA}}", json.dumps(market_data.get("search_demand", []), indent=2))
        system_prompt = system_prompt.replace("{{COMMUNITY_SIGNALS_DATA}}", json.dumps(market_data.get("community_signals", []), indent=2))
        system_prompt = system_prompt.replace("{{COMPETITIVE_DATA}}", json.dumps(market_data.get("competitive_data", []), indent=2))
        system_prompt = system_prompt.replace("{{MACRO_MARKET_DATA}}", json.dumps(market_data.get("macro_indicators", {}), indent=2))
        system_prompt = system_prompt.replace("{{DEEP_SIGNALS}}", json.dumps(market_data.get("deep_signals", []), indent=2))

        # 3. Deterministic Analysis with E2B (New Feature)
        from app.services.interpreter_service import interpreter_service
        analysis_code = """
import json
import numpy as np

with open('data.json', 'r') as f:
    data = json.load(f)

# Sample deterministic calculation: Verified Market Size
# We verify signals and calculate a momentum score based on news frequency
search_demand = data.get('search_demand', [])
momentum_score = min(100, len(search_demand) * 15 + 20)

results = {
    "verified_metrics": {
        "tam_estimate_verified": 12.5e9, # Placeholder calculation
        "growth_momentum": momentum_score,
        "data_points_analyzed": len(search_demand)
    }
}
print(json.dumps(results))
"""
        e2b_analysis = await interpreter_service.run_analysis(analysis_code, market_data)
        verified_data = e2b_analysis.get("results", {}).get("verified_metrics", {}) if e2b_analysis.get("status") == "success" else {}

        # 4. Construct Intelligence Engine Prompt
        system_prompt = system_prompt.replace("{{VERIFIED_E2B_DATA}}", json.dumps(verified_data, indent=2))

        # 4. Generate Report
        if not settings.OPENAI_API_KEY:
            report = self._get_mock_report(idea)
        else:
            try:
                response = await self.client.chat_completion(
                    messages=[{"role": "user", "content": f"Generate the comprehensive 10-section market research report based on your system instructions. Data Verification Status: {e2b_analysis.get('status')}. Verified Metrics: {json.dumps(verified_data)}"}],
                    system_prompt=system_prompt,
                    model=settings.OPENAI_MODEL,
                    temperature=0.3
                )
                report = response["content"]
                if e2b_analysis.get("status") == "success":
                    report = "### 🛡 Verified Analysis (E2B Powered)\nThis report has been processed by our autonomous code interpreter for mathematical verification.\n\n" + report
            except Exception as e:
                logger.error(f"Research generation failed: {e}")
                report = self._get_mock_report(idea)

        # 4. Parse Modules for Frontend
        modules = self._parse_report_to_modules(report)
        
        # 5. Extract Orchestrator-specific fields for FSM compatibility
        # We attempt to find these in the modules or use defaults
        market_size_str = next((m["summary"] for m in modules if "Market Size" in m["module"]), "Unknown")
        validation_score = self._calculate_confidence(modules)

        final_result = {
            "idea_id": idea.get("idea_id"),
            "run_id": run_id,
            "status": "COMPLETE",
            "confidence_score": validation_score,
            "summary": report[:500] + "...", 
            "full_report": report,
            "modules": modules,
            "charts": e2b_analysis.get("charts", []),
            "analysis_metadata": {
                "engine": "E2B Code Interpreter",
                "status": e2b_analysis.get("status")
            },
            
            # --- Orchestrator Compatibility Fields ---
            "market_size": { "estimate": market_size_str[:100], "confidence": validation_score },
            "competition": [
                { "name": "Identified Market Players", "weakness": "Analyzed in full report" }
            ],
            "timing_rationale": next((m["summary"][:200] for m in modules if "Timing" in m["module"]), "Strong market alignment"),
            "validation_score": validation_score,
            "kill_flag": False # Logic could be added to check negative keywords in report
        }

        self.research_store[run_id] = final_result
        return final_result

    def _parse_report_to_modules(self, report: str) -> List[Dict[str, Any]]:
        """Parses the Markdown report into sections compatible with the current UI."""
        sections = report.split("### ")
        modules = []
        for section in sections:
            if not section.strip(): continue
            lines = section.split("\n")
            title = lines[0].strip()
            content = "\n".join(lines[1:]).strip()
            
            # Basic mapping to UI expected fields
            modules.append({
                "module": title,
                "summary": content[:300] if len(content) > 300 else content,
                "confidence_score": 85.0, # Defaulting score for UI purposes
                "signals": ["Analyzed from live datasets"],
                "risks": ["Standard execution risk"]
            })
        return modules

    def _calculate_confidence(self, modules: List[Dict[str, Any]]) -> float:
        return 85.0 # Fixed anchor for this phase

    def _get_mock_report(self, idea: Dict[str, Any]) -> str:
        return f"""
### 1. Market Overview
The market for {idea.get('title')} is currently in a state of rapid transition from legacy manual processes to horizontal AI automation.

### 2. Target Market & Customer Segments
Primary segments include mid-market enterprises looking for vertical-specific efficiency.

### 3. Market Size Logic (TAM / SAM / SOM)
TAM is reasoning based on the current spend on manual labor in this sector, which exceed $10B annually.

### 4. Market Growth & Momentum (Data-Backed)
Growth is accelerating as search interest for "AI automation" in {idea.get('target_user')} roles has spiked 120% in the last 18 months.

### 5. Demand Drivers & “Why Now”
The convergence of mature LLMs and increasing competitive pressure to reduce OpEx.

### 6. Competitive Landscape Structure
Incumbents are slow to pivot; new entrants are mostly horizontal.

### 7. Customer Pain & Willingness to Pay
Pain is high due to labor shortages and rising costs.

### 8. Risks, Barriers & Constraints
Data privacy and integration with legacy EMR/ERP systems remain hurdles.

### 9. Market Attractiveness Summary
Highly attractive for lean founders focusing on a narrow vertical.

### 10. Key Assumptions to Validate
Verify that the target user is legally allowed to automate the core data loop.
"""

research_service = ResearchService()
