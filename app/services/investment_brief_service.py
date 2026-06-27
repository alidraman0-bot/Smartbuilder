import logging
import json
from typing import Dict, Any, Optional, List
from app.core.ai_client import get_ai_client
from app.core.config import settings
from app.services.market_signal_aggregator import MarketSignalAggregator
from app.models.investment_brief import InvestmentBriefResponse

logger = logging.getLogger(__name__)

class InvestmentBriefService:
    def __init__(self):
        self.ai = get_ai_client()
        self.aggregator = MarketSignalAggregator()

    async def generate_brief(self, idea_data: Dict[str, Any], mode: str = "basic", user_id: Optional[str] = None) -> InvestmentBriefResponse:
        """
        Generates a structured investment brief for a startup idea.
        """
        # Extract meaningful text for signal searching
        title = idea_data.get("title", "")
        problem = idea_data.get("problem", "")
        solution = idea_data.get("solution", idea_data.get("summary", ""))
        
        idea_text = f"{title}: {problem}. Solution: {solution}"
        idea_id = idea_data.get("id")

        # 0. Ensure parent idea exists in DB (Fixes FK violations in child tables)
        if idea_id:
            try:
                from app.core.supabase import get_service_client
                supabase = get_service_client()
                
                # Check if it exists in the main 'ideas' table
                res = supabase.table("ideas").select("id").eq("id", idea_id).execute()
                if not res.data:
                    logger.info(f"Idea {idea_id} not in DB. Persisting to 'ideas' table FIRST.")
                    
                    # Try to get project_id from idea_data or find a default
                    project_id = idea_data.get("project_id")
                    if not project_id:
                        # Try to find at least one project to link to
                        proj_res = supabase.table("projects").select("project_id").limit(1).execute()
                        if proj_res.data:
                            project_id = proj_res.data[0]["project_id"]
                        else:
                            # If no projects exist, we might need to create a dummy one or fail
                            logger.warning("No projects found in DB for persistence fallback.")
                    
                    supabase.table("ideas").insert({
                        "id": idea_id,
                        "project_id": project_id,
                        "title": title,
                        "thesis": solution,
                        "idea_text": idea_text,
                        "user_id": user_id,
                        "status": "researching"
                    }).execute()
            except Exception as e:
                logger.warning(f"Failed to ensure idea persistence: {e}")

        # 1. Aggregate market signals
        logger.info(f"Aggregating signals for brief: {title} (mode: {mode})")
        signals = await self.aggregator.aggregate_market_data(idea_text, idea_id)

        # 2. Prepare AI prompt
        system_prompt = """
You are a Senior AI Investment Analyst at a top-tier venture capital firm.
Your task is to generate a deep, structured, investor-grade analysis for a startup idea.

THINKING STYLE:
- VC Analyst: Focus on scalability, market size, and ROI.
- Startup Founder: Focus on MVP, execution, and product-market fit.
- Product Strategist: Focus on trends, timing, and differentiation.

AI ANALYSIS INSTRUCTIONS:
1. CONFIDENCE SCORE: 0-100 based on signal strength, pain point frequency, and demand.
2. MARKET SIZE: Estimate range (e.g. "$1B - $5B") and source logic.
3. COMPLEXITY: Score 0-10 and level (low/medium/high).
4. WHY SMARTBUILDER CONFIDENT: Crucial. Link used signals to the reasoning.
5. GROUND TRUTH ADHERENCE: You MUST prioritize the real-world signals provided. If competitors are listed in the GROUND TRUTH, analyze them specifically. If search growth is provided, use it in your timing analysis.
6. NO GENERIC FLUFF: Avoid vague statements. Use the provided data points to build a concrete, evidence-backed case.
7. CONTRARIAN & SPECIFIC: Do not just summarize. Provide a unique "Investment Thesis" that highlights why this is a non-obvious opportunity. Mention specific signal names (e.g., "A Reddit thread in r/startups regarding...") to ground your analysis.

OUTPUT STRUCTURE (STRICT JSON):
{
  "title": "Professional Brief Title",
  "confidence_score": 0-100,
  "market_size": {
    "estimate": "$X.X Billion",
    "range": "$A - $B",
    "source_logic": "Based on..."
  },
  "complexity": {
    "score": 0-10,
    "level": "low | medium | high",
    "reason": "..."
  },
  "problem": {
    "summary": "...",
    "pain_points": []
  },
  "target_customers": {
    "primary": "...",
    "secondary": [],
    "geography": "..."
  },
  "monetization": {
    "model": "...",
    "pricing_examples": [],
    "revenue_streams": []
  },
  "why_now": {
    "summary": "...",
    "trends": [],
    "timing_reason": "..."
  },
  "market_gaps_today": [],
  "mvp_scope": {
    "core_features": [],
    "tech_stack": [],
    "build_time_estimate": "3-5 weeks"
  },
  "why_smartbuilder_confident": {
    "signals_used": [],
    "data_points": [],
    "reasoning": "..."
  },
  "risks_to_validate": [
    {
      "risk": "...",
      "type": "market | technical | behavioral",
      "validation_method": "..."
    }
  ]
}
"""
        
        if mode == "deep":
            system_prompt += "\nPERFORM DEEP ANALYSIS: Provide extensive reasoning, more signals analysis, and higher validation rigour."
        else:
            system_prompt += "\nPERFORM BASIC ANALYSIS: Be brilliant but concise."

        system_prompt += "\nResponse MUST be ONLY a valid JSON object. No markdown. No explanations. No trailing commas."

        user_message = f"""
STARTUP IDEA:
{json.dumps(idea_data, indent=2)}

REAL-WORLD MARKET SIGNALS (GROUND TRUTH - USE THESE):
{json.dumps(signals, indent=2)}

IMPORTANT: The user wants to see evidence of REAL data. Explicitly mention at least two specific data points or competitors from the GROUND TRUTH section in your analysis.

Generate the Investment Brief now:
"""

        # 3. Call AI via task-aware router
        logger.info(f"Generating brief via AI router (task=investment_brief, mode={mode})...")
        response = await self.ai.routed_completion(
            task="investment_brief",
            messages=[{"role": "user", "content": user_message}],
            system_prompt=system_prompt,
            response_format={"type": "json_object"},
            max_tokens=3000 if mode == "deep" else 2000
        )

        # 4. Parse and return
        try:
            content = response.get("content", "{}")
            
            # Robust JSON extraction using safe_json_parse
            from app.utils.json_helper import safe_json_parse
            brief_data = safe_json_parse(content)
            
            # Defensive check: if it's completely empty or not a dict, use fallback
            if not brief_data or not isinstance(brief_data, dict):
                logger.warning(f"AI returned invalid or empty brief data. Using fallback. Raw content: {content[:500]}...")
                return self._get_fallback_brief(title or "Investment Brief")
                
            # Clean and defensively merge brief data with standard schema defaults to ensure all required Pydantic fields are populated
            cleaned_brief_data = self._clean_and_fill_brief_data(brief_data, title or "Investment Brief")
            return InvestmentBriefResponse(**cleaned_brief_data)
        except Exception as e:
            logger.error(f"Failed to parse or validate Investment Brief: {e}")
            logger.debug(f"Raw content: {response.get('content')}")
            return self._get_fallback_brief(title or "Investment Brief")

    def _clean_and_fill_brief_data(self, data: Dict[str, Any], default_title: str) -> Dict[str, Any]:
        """
        Defensively processes and fills missing/incomplete fields from AI generation
        to guarantee successful parsing into an InvestmentBriefResponse.
        """
        cleaned = {}
        
        # 1. title
        cleaned["title"] = str(data.get("title") or default_title)
        
        # 2. confidence_score
        try:
            val = float(data.get("confidence_score", 70))
            cleaned["confidence_score"] = max(0.0, min(100.0, val))
        except (ValueError, TypeError):
            cleaned["confidence_score"] = 70.0
            
        # 3. market_size
        ms = data.get("market_size") or {}
        if not isinstance(ms, dict):
            ms = {}
        cleaned["market_size"] = {
            "estimate": str(ms.get("estimate") or "$1.5B"),
            "range": str(ms.get("range") or "$1B - $3B"),
            "source_logic": str(ms.get("source_logic") or "Aggregated market estimates.")
        }
        
        # 4. complexity
        c = data.get("complexity") or {}
        if not isinstance(c, dict):
            c = {}
        try:
            c_score = float(c.get("score", 5))
            c_score = max(0.0, min(10.0, c_score))
        except (ValueError, TypeError):
            c_score = 5.0
            
        c_level = c.get("level")
        if c_level not in ["low", "medium", "high"]:
            c_level = "medium"
            
        cleaned["complexity"] = {
            "score": c_score,
            "level": c_level,
            "reason": str(c.get("reason") or "Standard SaaS complexity.")
        }
        
        # 5. problem
        prob = data.get("problem") or {}
        if not isinstance(prob, dict):
            prob = {}
        cleaned["problem"] = {
            "summary": str(prob.get("summary") or "Identified gaps in the current market workflow."),
            "pain_points": list(prob.get("pain_points") or ["High workflow friction", "Lack of specialized automation"])
        }
        
        # 6. target_customers
        tc = data.get("target_customers") or {}
        if not isinstance(tc, dict):
            tc = {}
        cleaned["target_customers"] = {
            "primary": str(tc.get("primary") or "Professional users & small businesses"),
            "secondary": list(tc.get("secondary") or ["Mid-market teams"]),
            "geography": str(tc.get("geography") or "Global")
        }
        
        # 7. monetization
        mon = data.get("monetization") or {}
        if not isinstance(mon, dict):
            mon = {}
        cleaned["monetization"] = {
            "model": str(mon.get("model") or "B2B SaaS Subscription"),
            "pricing_examples": list(mon.get("pricing_examples") or ["$29/mo starter tier", "$99/mo professional tier"]),
            "revenue_streams": list(mon.get("revenue_streams") or ["Monthly software subscriptions", "Enterprise custom contracts"])
        }
        
        # 8. why_now
        wn = data.get("why_now") or {}
        if not isinstance(wn, dict):
            wn = {}
        cleaned["why_now"] = {
            "summary": str(wn.get("summary") or "Accelerating digital workflows and automation adoption."),
            "trends": list(wn.get("trends") or ["Increased demand for specialized tools", "API-driven ecosystem growth"]),
            "timing_reason": str(wn.get("timing_reason") or "Market demand is at a tipping point.")
        }
        
        # 9. market_gaps_today
        cleaned["market_gaps_today"] = list(data.get("market_gaps_today") or ["Current solutions are generic and not specialized enough."])
        
        # 10. mvp_scope
        mvp = data.get("mvp_scope") or {}
        if not isinstance(mvp, dict):
            mvp = {}
        cleaned["mvp_scope"] = {
            "core_features": list(mvp.get("core_features") or ["User dashboard", "Core processing engine", "Integration API"]),
            "tech_stack": list(mvp.get("tech_stack") or ["Next.js", "FastAPI", "PostgreSQL"]),
            "build_time_estimate": str(mvp.get("build_time_estimate") or "3-5 weeks")
        }
        
        # 11. why_smartbuilder_confident
        wsc = data.get("why_smartbuilder_confident") or {}
        if not isinstance(wsc, dict):
            wsc = {}
        cleaned["why_smartbuilder_confident"] = {
            "signals_used": list(wsc.get("signals_used") or ["Reddit demand signals", "Google Trends growth"]),
            "data_points": list(wsc.get("data_points") or ["High engagement on related startup forums"]),
            "reasoning": str(wsc.get("reasoning") or "Strong real-world signal combination showing high user intent and pain points.")
        }
        
        # 12. risks_to_validate
        risks = data.get("risks_to_validate")
        if not isinstance(risks, list):
            risks = []
        
        cleaned_risks = []
        for r in risks:
            if isinstance(r, dict):
                cleaned_risks.append({
                    "risk": str(r.get("risk") or "User acquisition challenge"),
                    "type": str(r.get("type") or "market"),
                    "validation_method": str(r.get("validation_method") or "Run targeted search/social ads to test CTR")
                })
        
        if not cleaned_risks:
            cleaned_risks = [{
                "risk": "Customer onboarding friction",
                "type": "behavioral",
                "validation_method": "User testing with prototype MVP"
            }]
        cleaned["risks_to_validate"] = cleaned_risks
        
        return cleaned

    def _get_fallback_brief(self, title: str) -> InvestmentBriefResponse:
        """
        Returns a valid InvestmentBriefResponse mock when AI fails.
        """
        return InvestmentBriefResponse(
            title=f"{title} (Synthetic Analysis)",
            confidence_score=50,
            market_size={
                "estimate": "Data Unavailable",
                "range": "N/A",
                "source_logic": "Fallback generated due to AI service unavailability."
            },
            complexity={
                "score": 5,
                "level": "medium",
                "reason": "Default fallback analysis."
            },
            problem={
                "summary": "The requested analysis is currently in offline mode.",
                "pain_points": ["AI Provider Quota Exhausted"]
            },
            target_customers={
                "primary": "Undetermined",
                "secondary": [],
                "geography": "Global"
            },
            monetization={
                "model": "TBD",
                "pricing_examples": [],
                "revenue_streams": []
            },
            why_now={
                "summary": "Market timing analysis unavailable.",
                "trends": [],
                "timing_reason": "N/A"
            },
            market_gaps_today=[],
            mvp_scope={
                "core_features": ["Intelligence Placeholder"],
                "tech_stack": ["Wait for AI Service"],
                "build_time_estimate": "3-5 weeks"
            },
            why_smartbuilder_confident={
                "signals_used": [],
                "data_points": [],
                "reasoning": "This is a placeholder brief generated because the AI service is currently unreachable or out of credits."
            },
            risks_to_validate=[
                {
                    "risk": "AI Connection Failure",
                    "type": "technical",
                    "validation_method": "Check API Keys & Balance"
                }
            ]
        )

investment_brief_service = InvestmentBriefService()
