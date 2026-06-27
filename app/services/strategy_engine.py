"""
Strategy Engine — Institutional-Grade AI Strategic Planning Intelligence.

Provides:
  - Financial forecasting (revenue, CAC, LTV, burn, runway)
  - Market sizing (TAM/SAM/SOM with bottom-up logic)
  - SWOT analysis
  - Competitive moat & defensibility analysis
  - Investment attractiveness scoring
  - AI strategic recommendations

All outputs are routed through the AIRouter for task-aware model selection:
  - Strategic reasoning → deepseek/deepseek-r1:free
  - Financial modeling  → deepseek/deepseek-r1:free
  - Technical analysis  → meta-llama/llama-3.3-70b-instruct:free
"""

import logging
import json
import asyncio
from typing import Dict, Any, Optional, List

from app.core.ai_client import get_ai_client
from app.utils.json_helper import safe_json_parse

logger = logging.getLogger(__name__)


class StrategyEngine:
    """
    Institutional-grade strategy intelligence engine.
    Combines market analysis, financial modeling, competitive intelligence,
    and AI-driven recommendations into a unified strategic output.
    """

    def __init__(self):
        self.client = get_ai_client()

    # ------------------------------------------------------------------
    # Financial Forecasting
    # ------------------------------------------------------------------
    async def generate_financial_forecast(
        self, idea: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate 3-year financial projections with unit economics."""
        prompt = f"""You are a senior financial analyst at a top-tier VC firm.
Generate a detailed 3-year financial forecast for the following startup idea.

Startup Idea: {json.dumps(idea, default=str)}
Context: {json.dumps(context, default=str)}

Return ONLY a JSON object with this structure:
{{
  "revenue_projections": {{
    "year_1": {{"revenue": "$X", "customers": N, "arpu": "$X"}},
    "year_2": {{"revenue": "$X", "customers": N, "arpu": "$X"}},
    "year_3": {{"revenue": "$X", "customers": N, "arpu": "$X"}}
  }},
  "unit_economics": {{
    "cac": "$X",
    "ltv": "$X",
    "ltv_cac_ratio": "X:1",
    "payback_period_months": N,
    "gross_margin": "X%",
    "contribution_margin": "X%"
  }},
  "operating_costs": {{
    "monthly_burn": "$X",
    "breakdown": [
      {{"category": "Engineering", "amount": "$X/mo", "headcount": N}},
      {{"category": "Sales & Marketing", "amount": "$X/mo", "headcount": N}},
      {{"category": "Infrastructure", "amount": "$X/mo"}},
      {{"category": "G&A", "amount": "$X/mo"}}
    ]
  }},
  "runway_analysis": {{
    "seed_raise": "$X",
    "runway_months": N,
    "break_even_month": N,
    "profitability_timeline": "description"
  }},
  "assumptions": ["assumption 1", "assumption 2", "assumption 3"],
  "confidence_score": 0-100
}}

Be specific and realistic. Use industry benchmarks. No placeholders."""
        try:
            response = await self.client.routed_completion(
                task="financial_forecast",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=3000,
                response_format={"type": "json_object"},
            )
            return safe_json_parse(response.get("content", "{}"))
        except Exception as e:
            logger.error(f"Financial forecast generation failed: {e}")
            return {"error": "Financial forecast generation failed", "confidence_score": 0}

    # ------------------------------------------------------------------
    # Market Sizing (TAM / SAM / SOM)
    # ------------------------------------------------------------------
    async def generate_market_sizing(
        self, idea: Dict[str, Any], industry: str, region: str
    ) -> Dict[str, Any]:
        """Generate bottom-up TAM/SAM/SOM with reasoning and assumptions."""
        prompt = f"""You are a market research analyst at McKinsey & Company.
Generate a rigorous bottom-up market sizing analysis.

Startup Idea: {json.dumps(idea, default=str)}
Industry: {industry}
Region: {region}

Return ONLY a JSON object:
{{
  "tam": {{
    "value": "$XB",
    "methodology": "Bottom-up calculation methodology",
    "reasoning": "Step-by-step sizing logic with data sources",
    "data_points": ["key data point 1", "key data point 2"]
  }},
  "sam": {{
    "value": "$XB",
    "methodology": "Segment-specific filtering methodology",
    "reasoning": "How SAM was derived from TAM",
    "filters_applied": ["geographic filter", "segment filter"]
  }},
  "som": {{
    "value": "$XM",
    "methodology": "Realistic capture methodology",
    "reasoning": "24-month realistic capture estimate",
    "capture_rate": "X%",
    "assumptions": ["assumption 1", "assumption 2"]
  }},
  "cagr": "X%",
  "growth_drivers": ["driver 1", "driver 2", "driver 3"],
  "market_maturity": "emerging|growing|mature|declining",
  "regional_adjustments": "Regional factors affecting sizing",
  "confidence_score": 0-100,
  "confidence_reasoning": "Why this confidence level"
}}

Use real industry data and benchmarks. Label estimates explicitly."""
        try:
            response = await self.client.routed_completion(
                task="market_analysis",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2500,
                response_format={"type": "json_object"},
            )
            return safe_json_parse(response.get("content", "{}"))
        except Exception as e:
            logger.error(f"Market sizing generation failed: {e}")
            return {"error": "Market sizing generation failed", "confidence_score": 0}

    # ------------------------------------------------------------------
    # SWOT Analysis
    # ------------------------------------------------------------------
    async def generate_swot(
        self, idea: Dict[str, Any], context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate institutional-grade SWOT analysis."""
        prompt = f"""You are a senior strategy consultant. Generate a SWOT analysis.

Startup Idea: {json.dumps(idea, default=str)}
Context: {json.dumps(context, default=str)}

Return ONLY a JSON object:
{{
  "strengths": [
    {{"factor": "strength name", "description": "detailed explanation", "impact": "high|medium|low"}}
  ],
  "weaknesses": [
    {{"factor": "weakness name", "description": "detailed explanation", "impact": "high|medium|low", "mitigation": "how to address"}}
  ],
  "opportunities": [
    {{"factor": "opportunity name", "description": "detailed explanation", "timeline": "short|medium|long-term", "potential_value": "$X"}}
  ],
  "threats": [
    {{"factor": "threat name", "description": "detailed explanation", "probability": "high|medium|low", "mitigation": "defensive strategy"}}
  ],
  "strategic_implications": "Summary of key strategic takeaways",
  "confidence_score": 0-100
}}

Be specific, quantified where possible, and actionable."""
        try:
            response = await self.client.routed_completion(
                task="strategy",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2500,
                response_format={"type": "json_object"},
            )
            return safe_json_parse(response.get("content", "{}"))
        except Exception as e:
            logger.error(f"SWOT generation failed: {e}")
            return {"error": "SWOT generation failed", "confidence_score": 0}

    # ------------------------------------------------------------------
    # Competitive Moat & Defensibility
    # ------------------------------------------------------------------
    async def generate_moat_analysis(
        self, idea: Dict[str, Any], competitors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze competitive moats, defensibility, and strategic positioning."""
        prompt = f"""You are a venture capital partner at Sequoia Capital.
Analyze the defensibility and competitive moats of this startup.

Startup Idea: {json.dumps(idea, default=str)}
Known Competitors: {json.dumps(competitors[:5], default=str) if competitors else "Not yet identified"}

Return ONLY a JSON object:
{{
  "moat_types": [
    {{"type": "Network Effects|Switching Costs|Data Moat|Brand|Scale|IP|Regulatory", "strength": "strong|moderate|weak", "description": "how this moat manifests", "time_to_build": "X months"}}
  ],
  "defensibility_score": 0-100,
  "defensibility_reasoning": "Why this score",
  "competitive_advantages": [
    {{"advantage": "name", "sustainability": "high|medium|low", "timeline": "when this kicks in"}}
  ],
  "vulnerabilities": [
    {{"vulnerability": "name", "risk_level": "high|medium|low", "mitigation": "strategy"}}
  ],
  "strategic_positioning": "Where this company sits in the competitive landscape",
  "execution_difficulty": "easy|moderate|hard|very_hard",
  "execution_reasoning": "Why this difficulty level",
  "investment_attractiveness": {{
    "score": 0-100,
    "reasoning": "Why an investor would or wouldn't invest",
    "key_risks_for_investors": ["risk 1", "risk 2"],
    "key_attractions": ["attraction 1", "attraction 2"]
  }}
}}

Think like a VC partner evaluating a Series A deal."""
        try:
            response = await self.client.routed_completion(
                task="strategy",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2500,
                response_format={"type": "json_object"},
            )
            return safe_json_parse(response.get("content", "{}"))
        except Exception as e:
            logger.error(f"Moat analysis generation failed: {e}")
            return {"error": "Moat analysis generation failed", "confidence_score": 0}

    # ------------------------------------------------------------------
    # AI Strategic Recommendations
    # ------------------------------------------------------------------
    async def generate_strategic_recommendations(
        self,
        idea: Dict[str, Any],
        business_plan: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate AI-powered strategic recommendations."""
        # Trim business plan to avoid token limits
        bp_summary = {}
        for key in ["executive_summary", "market_opportunity", "competitive_analysis",
                     "revenue_model", "financial_forecasts", "risk_analysis"]:
            if key in business_plan:
                bp_summary[key] = business_plan[key]

        prompt = f"""You are an elite AI strategy advisor combining McKinsey, YC, and Sequoia expertise.
Based on the analysis below, generate actionable strategic recommendations.

Idea: {json.dumps(idea, default=str)}
Business Plan Summary: {json.dumps(bp_summary, default=str)}

Return ONLY a JSON object:
{{
  "top_3_priorities": [
    {{"priority": "name", "rationale": "why this matters most", "timeline": "X weeks/months", "expected_impact": "description"}}
  ],
  "go_no_go_verdict": {{
    "decision": "GO|CONDITIONAL_GO|PIVOT|NO_GO",
    "confidence": 0-100,
    "reasoning": "Detailed reasoning for the verdict",
    "conditions": ["condition for success 1", "condition 2"]
  }},
  "strategic_pivots_to_consider": [
    {{"pivot": "description", "trigger": "when to consider this", "expected_outcome": "what changes"}}
  ],
  "90_day_milestones": [
    {{"milestone": "description", "metric": "success metric", "deadline": "week X"}}
  ],
  "key_hires": [
    {{"role": "title", "why": "rationale", "timeline": "when to hire", "priority": "P0|P1|P2"}}
  ],
  "funding_strategy": {{
    "recommended_raise": "$X",
    "stage": "Pre-seed|Seed|Series A",
    "use_of_funds": [{{"category": "name", "allocation": "X%", "amount": "$X"}}],
    "timeline": "when to raise",
    "target_investors": ["investor type 1", "investor type 2"]
  }}
}}

Be specific, actionable, and data-driven. No generic advice."""
        try:
            response = await self.client.routed_completion(
                task="strategy",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=3000,
                response_format={"type": "json_object"},
            )
            return safe_json_parse(response.get("content", "{}"))
        except Exception as e:
            logger.error(f"Strategic recommendations failed: {e}")
            return {"error": "Strategic recommendations generation failed"}


# Module-level singleton
strategy_engine = StrategyEngine()
