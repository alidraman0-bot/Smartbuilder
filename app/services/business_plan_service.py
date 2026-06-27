"""
Business Plan Service — Institutional-Grade 25-Section Pipeline.

Generates investor-grade business plans using section-by-section AI generation
with task-aware model routing through the AIRouter.

Model Routing:
  - Strategic sections → deepseek/deepseek-r1:free
  - Financial sections → deepseek/deepseek-r1:free
  - Market sections   → deepseek/deepseek-r1:free
  - Summary sections  → qwen/qwen3-235b-a22b:free
  - Fallback          → mistralai/mistral-small-3.1-24b-instruct:free

Pipeline:
  1. Parse input + validate
  2. Generate each of 25 sections independently (parallel batches)
  3. Validate JSON for each section
  4. Assemble final business plan document
  5. Calculate confidence score
  6. Cache result
"""

import logging
import asyncio
import uuid
import json
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.core.ai_client import get_ai_client
from app.utils.json_helper import safe_json_parse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Section Definitions — 25 investor-grade sections
# ---------------------------------------------------------------------------
BUSINESS_PLAN_SECTIONS = [
    {
        "key": "executive_summary",
        "title": "Executive Summary",
        "task": "executive_summary",
        "prompt_template": """Generate the Executive Summary for an investor-grade business plan.
Include: company_overview (2-3 sentences), mission, vision (5-year), opportunity (with numbers),
business_model (how money is made), strategic_advantage (moat/unfair advantage).
Return JSON: {{"company_overview":"","mission":"","vision":"","opportunity":"","business_model":"","strategic_advantage":""}}"""
    },
    {
        "key": "company_overview",
        "title": "Company Overview",
        "task": "business_plan",
        "prompt_template": """Generate the Company Overview section.
Include: company_name, founding_story, legal_structure, headquarters,
stage (pre-seed/seed/series-a), team_size, founding_date, core_values.
Return JSON: {{"company_name":"","founding_story":"","legal_structure":"","headquarters":"","stage":"","team_size":"","core_values":[""]}}"""
    },
    {
        "key": "problem_statement",
        "title": "Problem Statement",
        "task": "business_plan",
        "prompt_template": """Generate a deep Problem Statement analysis.
Include: pain_points (3-5 specific, quantified), market_inefficiencies (2-3 structural failures),
current_solution_failures (why existing solutions fail), user_frustrations (direct complaints),
cost_of_problem (quantified annual cost to users).
Return JSON: {{"pain_points":[""],"market_inefficiencies":[""],"current_solution_failures":[""],"user_frustrations":[""],"cost_of_problem":""}}"""
    },
    {
        "key": "solution",
        "title": "Solution",
        "task": "business_plan",
        "prompt_template": """Generate the Solution section.
Include: product_description (clear technical explanation), innovation_layer (what's novel),
differentiation (vs every alternative), value_proposition, key_features (top 5),
competitive_advantage (structural advantage that compounds over time).
Return JSON: {{"product_description":"","innovation_layer":"","differentiation":"","value_proposition":"","key_features":[""],"competitive_advantage":""}}"""
    },
    {
        "key": "market_opportunity",
        "title": "Market Opportunity",
        "task": "market_analysis",
        "prompt_template": """Generate the Market Opportunity analysis using bottom-up methodology.
Include: tam (total addressable market with value and reasoning),
sam (serviceable addressable market with segment-specific logic),
som (serviceable obtainable market with 24-month realistic capture),
cagr, market_growth_trajectory, industry_trends (3-5 macro trends),
emerging_opportunities (2-3 adjacent markets).
Return JSON: {{"tam":{{"value":"$XB","reasoning":""}}, "sam":{{"value":"$XB","reasoning":""}}, "som":{{"value":"$XM","reasoning":""}}, "cagr":"X%", "industry_trends":[""], "emerging_opportunities":[""]}}"""
    },
    {
        "key": "industry_analysis",
        "title": "Industry Analysis",
        "task": "market_analysis",
        "prompt_template": """Generate a comprehensive Industry Analysis.
Include: industry_overview, market_structure (fragmented/consolidated),
key_players (top 5 with market share), regulatory_environment,
technology_trends, barriers_to_entry, industry_lifecycle_stage.
Return JSON: {{"industry_overview":"","market_structure":"","key_players":[{{"name":"","market_share":"","description":""}}],"regulatory_environment":"","technology_trends":[""],"barriers_to_entry":[""],"industry_lifecycle_stage":""}}"""
    },
    {
        "key": "competitive_analysis",
        "title": "Competitive Analysis",
        "task": "competitive_analysis",
        "prompt_template": """Generate a detailed Competitive Analysis.
Include: direct_competitors (name, strength, weakness, market_share, pricing),
indirect_competitors (name, threat_level, overlap),
market_gaps (unserved needs), strategic_positioning,
competitive_matrix_summary (where we sit vs top 3 competitors).
Return JSON: {{"direct_competitors":[{{"name":"","strength":"","weakness":"","market_share":"","pricing":""}}],"indirect_competitors":[{{"name":"","threat_level":"","overlap":""}}],"market_gaps":[""],"strategic_positioning":"","competitive_matrix_summary":""}}"""
    },
    {
        "key": "customer_segmentation",
        "title": "Customer Segmentation",
        "task": "business_plan",
        "prompt_template": """Generate Customer Segmentation analysis.
Include: primary_segments (2-3 ICPs with name, description, demographics,
behavior_patterns, pain_points, willingness_to_pay, segment_size),
segmentation_strategy, beachhead_market, expansion_path.
Return JSON: {{"primary_segments":[{{"name":"","description":"","demographics":"","behavior_patterns":[""],"pain_points":[""],"willingness_to_pay":"","segment_size":""}}],"segmentation_strategy":"","beachhead_market":"","expansion_path":""}}"""
    },
    {
        "key": "revenue_model",
        "title": "Revenue Model",
        "task": "pricing_strategy",
        "prompt_template": """Generate the Revenue Model.
Include: primary_model (SaaS/Usage/Marketplace/etc.), revenue_streams (all sources with % of revenue),
monetization_mechanics (how each stream works), pricing_tiers (3 tiers with name, price,
features, target_segment), enterprise_pricing, upsell_strategy, expansion_revenue_strategy.
Return JSON: {{"primary_model":"","revenue_streams":[{{"stream":"","percentage":"","description":""}}],"pricing_tiers":[{{"name":"","price":"","features":[""],"target_segment":""}}],"enterprise_pricing":"","upsell_strategy":"","expansion_revenue_strategy":""}}"""
    },
    {
        "key": "pricing_strategy",
        "title": "Pricing Strategy",
        "task": "pricing_strategy",
        "prompt_template": """Generate the Pricing Strategy.
Include: pricing_philosophy, pricing_model (per-seat/usage/flat/hybrid),
price_anchoring_strategy, competitive_pricing_analysis,
willingness_to_pay_research, discount_strategy, pricing_experiments_plan,
pricing_by_segment.
Return JSON: {{"pricing_philosophy":"","pricing_model":"","price_anchoring_strategy":"","competitive_pricing_analysis":"","willingness_to_pay":"","discount_strategy":"","pricing_experiments":[""]}}"""
    },
    {
        "key": "go_to_market",
        "title": "Go-To-Market Strategy",
        "task": "gtm_strategy",
        "prompt_template": """Generate the Go-To-Market Strategy.
Include: acquisition_channels (4+ with channel, strategy, expected_cac),
launch_sequence (ordered steps with timeline), partnerships (strategic partner types),
viral_loops, seo_strategy, community_building,
plg_strategy (product-led growth mechanics).
Return JSON: {{"acquisition_channels":[{{"channel":"","strategy":"","expected_cac":"$X"}}],"launch_sequence":[""],"partnerships":[""],"viral_loops":"","seo_strategy":"","community_building":"","plg_strategy":""}}"""
    },
    {
        "key": "growth_strategy",
        "title": "Growth Strategy",
        "task": "strategy",
        "prompt_template": """Generate the Growth Strategy.
Include: growth_model (PLG/Sales-led/Community-led/Hybrid),
growth_loops (self-reinforcing mechanisms), network_effects,
retention_strategy, expansion_strategy (land-and-expand),
international_expansion, growth_metrics (north star + supporting).
Return JSON: {{"growth_model":"","growth_loops":[{{"loop":"","mechanism":"","expected_impact":""}}],"network_effects":"","retention_strategy":"","expansion_strategy":"","international_expansion":"","growth_metrics":{{"north_star":"","supporting_metrics":[""]}}}}"""
    },
    {
        "key": "operations_plan",
        "title": "Operations Plan",
        "task": "business_plan",
        "prompt_template": """Generate the Operations Plan.
Include: infrastructure (technical infrastructure plan), hiring_plan (roles, timeline, priority),
org_structure, scaling_strategy, support_systems (customer support architecture),
compliance (regulatory requirements), key_processes.
Return JSON: {{"infrastructure":"","hiring_plan":[{{"role":"","timeline":"","priority":"P0|P1|P2"}}],"org_structure":"","scaling_strategy":"","support_systems":"","compliance":[""],"key_processes":[""]}}"""
    },
    {
        "key": "marketing_strategy",
        "title": "Marketing Strategy",
        "task": "gtm_strategy",
        "prompt_template": """Generate the Marketing Strategy.
Include: brand_positioning, content_strategy (types, frequency, channels),
paid_acquisition (channels, budget allocation), organic_strategy,
influencer_partnerships, event_strategy, marketing_budget_allocation,
marketing_kpis.
Return JSON: {{"brand_positioning":"","content_strategy":{{"types":[""],"frequency":"","channels":[""]}},"paid_acquisition":[{{"channel":"","budget":"","expected_roi":""}}],"organic_strategy":"","influencer_partnerships":"","event_strategy":"","budget_allocation":[{{"category":"","percentage":""}}],"kpis":[""]}}"""
    },
    {
        "key": "sales_strategy",
        "title": "Sales Strategy",
        "task": "gtm_strategy",
        "prompt_template": """Generate the Sales Strategy.
Include: sales_model (self-serve/inside/field/hybrid), sales_cycle (stages, timeline),
sales_team_structure (roles, hiring plan), quota_framework,
sales_tools, partnership_channel, enterprise_sales_motion,
sales_metrics.
Return JSON: {{"sales_model":"","sales_cycle":{{"stages":[""],"avg_length":""}},"team_structure":[{{"role":"","count":"","timeline":""}}],"quota_framework":"","sales_tools":[""],"partnership_channel":"","enterprise_motion":"","metrics":[""]}}"""
    },
    {
        "key": "product_roadmap",
        "title": "Product Roadmap",
        "task": "business_plan",
        "prompt_template": """Generate the Product Roadmap.
Include: mvp_features (V1 must-haves), v2_features (post-launch),
v3_features (6-12 months), enterprise_features,
timeline (week-by-week for first 12 weeks), prioritization_framework.
Return JSON: {{"mvp_features":[""],"v2_features":[""],"v3_features":[""],"enterprise_features":[""],"timeline":[{{"phase":"","duration":"","deliverables":[""]}}],"prioritization_framework":""}}"""
    },
    {
        "key": "financial_forecasts",
        "title": "Financial Forecasts",
        "task": "financial_forecast",
        "prompt_template": """Generate detailed 3-year Financial Forecasts.
Include: year_1/2/3_revenue, operating_costs (monthly burn with breakdown),
cac, ltv, ltv_cac_ratio, burn_rate, runway_months, profitability_timeline,
funding_requirements, key_assumptions.
Return JSON: {{"year_1_revenue":"$X","year_2_revenue":"$X","year_3_revenue":"$X","monthly_burn":"$X","cost_breakdown":[{{"category":"","amount":"$X/mo"}}],"cac":"$X","ltv":"$X","ltv_cac_ratio":"X:1","runway_months":"X","profitability_timeline":"","funding_requirements":"$X","key_assumptions":[""]}}"""
    },
    {
        "key": "unit_economics",
        "title": "Unit Economics",
        "task": "financial_forecast",
        "prompt_template": """Generate Unit Economics analysis.
Include: cac (by channel), ltv (by segment), ltv_cac_ratio,
payback_period, gross_margin, contribution_margin,
magic_number, burn_multiple, revenue_per_employee,
efficiency_metrics.
Return JSON: {{"cac_by_channel":[{{"channel":"","cac":"$X"}}],"ltv_by_segment":[{{"segment":"","ltv":"$X"}}],"blended_ltv_cac":"X:1","payback_period_months":N,"gross_margin":"X%","contribution_margin":"X%","magic_number":"X","burn_multiple":"X","revenue_per_employee":"$X"}}"""
    },
    {
        "key": "risk_analysis",
        "title": "Risk Analysis",
        "task": "risk_analysis",
        "prompt_template": """Generate comprehensive Risk Analysis.
Include: risks (6+ with category technical/business/market/legal/operational,
risk description, probability high/medium/low, impact high/medium/low,
mitigation strategy). Each risk must be specific and actionable.
Return JSON: {{"risks":[{{"category":"","risk":"","probability":"","impact":"","mitigation":"","contingency":""}}],"overall_risk_level":"","risk_adjusted_confidence":0-100}}"""
    },
    {
        "key": "swot_analysis",
        "title": "SWOT Analysis",
        "task": "strategy",
        "prompt_template": """Generate SWOT Analysis.
Include: strengths (3-4 with factor, description, impact level),
weaknesses (3-4 with factor, description, mitigation),
opportunities (3-4 with factor, description, timeline, potential_value),
threats (3-4 with factor, description, probability, mitigation).
Return JSON: {{"strengths":[{{"factor":"","description":"","impact":""}}],"weaknesses":[{{"factor":"","description":"","mitigation":""}}],"opportunities":[{{"factor":"","description":"","timeline":"","potential_value":""}}],"threats":[{{"factor":"","description":"","probability":"","mitigation":""}}],"strategic_implications":""}}"""
    },
    {
        "key": "investor_attractiveness",
        "title": "Investor Attractiveness",
        "task": "funding_analysis",
        "prompt_template": """Generate Investor Attractiveness analysis as a VC partner would evaluate it.
Include: investment_score (0-100), investment_thesis (one-liner),
key_attractions (why invest), key_concerns (why not invest),
comparable_exits (similar companies that exited), valuation_range,
ideal_investor_profile, fundraising_timeline.
Return JSON: {{"investment_score":0-100,"investment_thesis":"","key_attractions":[""],"key_concerns":[""],"comparable_exits":[{{"company":"","exit_value":"","year":"","relevance":""}}],"valuation_range":"$XM-$XM","ideal_investor_profile":[""],"fundraising_timeline":""}}"""
    },
    {
        "key": "scalability_analysis",
        "title": "Scalability Analysis",
        "task": "strategy",
        "prompt_template": """Generate Scalability Analysis.
Include: technical_scalability (infrastructure scaling plan),
operational_scalability (process scaling), market_scalability (geographic/segment expansion),
team_scalability (organizational growth), unit_economics_at_scale,
bottlenecks (current scaling constraints), scaling_milestones.
Return JSON: {{"technical_scalability":"","operational_scalability":"","market_scalability":"","team_scalability":"","unit_economics_at_scale":"","bottlenecks":[""],"scaling_milestones":[{{"milestone":"","trigger":"","action":""}}]}}"""
    },
    {
        "key": "funding_strategy",
        "title": "Funding Strategy",
        "task": "funding_analysis",
        "prompt_template": """Generate the Funding Strategy.
Include: current_stage, recommended_raise, use_of_funds (with allocations),
target_investors (types and names where possible), fundraising_timeline,
milestones_before_raise, valuation_expectations, funding_alternatives,
cap_table_strategy.
Return JSON: {{"current_stage":"","recommended_raise":"$X","use_of_funds":[{{"category":"","allocation":"X%","amount":"$X"}}],"target_investors":[""],"fundraising_timeline":"","milestones_before_raise":[""],"valuation_expectations":"","funding_alternatives":[""],"cap_table_strategy":""}}"""
    },
    {
        "key": "exit_strategy",
        "title": "Exit Strategy",
        "task": "strategy",
        "prompt_template": """Generate the Exit Strategy.
Include: potential_exit_paths (IPO/M&A/Secondary), timeline_to_exit,
potential_acquirers, valuation_multiples, comparable_exits,
factors_driving_exit_value.
Return JSON: {{"exit_paths":[{{"type":"","likelihood":"","timeline":"","estimated_value":"","reasoning":""}}],"potential_acquirers":[""],"valuation_multiples":"X-Xx revenue","comparable_exits":[{{"company":"","acquirer":"","value":"","multiple":""}}],"value_drivers":[""]}}"""
    },
    {
        "key": "ai_strategic_recommendations",
        "title": "AI Strategic Recommendations",
        "task": "strategy",
        "prompt_template": """Generate AI Strategic Recommendations as a combined McKinsey + YC + Sequoia advisor.
Include: verdict (BUILD/PIVOT/ABANDON with reasoning), confidence_score (0-100),
top_3_priorities (with rationale, timeline, expected_impact),
90_day_milestones (with success metrics),
critical_assumptions_to_validate, recommended_experiments,
warning_signals (triggers to pivot or kill).
Return JSON: {{"verdict":{{"decision":"BUILD|PIVOT|ABANDON","confidence":0-100,"reasoning":"","one_liner":""}},
"top_3_priorities":[{{"priority":"","rationale":"","timeline":"","expected_impact":""}}],
"90_day_milestones":[{{"milestone":"","metric":"","deadline":""}}],
"critical_assumptions":[""],"recommended_experiments":[""],
"warning_signals":[""]}}"""
    },
]


class BusinessPlanService:
    """
    Investor-Grade 25-Section Business Plan Intelligence Engine.

    Generates McKinsey/YC-quality business plans through a section-by-section
    pipeline with task-aware model routing, structured JSON validation,
    and automatic fallback to high-quality mock data.
    """

    def __init__(self):
        self.client = get_ai_client()
        self.plan_store: Dict[str, Dict[str, Any]] = {}

    async def _generate_section(
        self,
        section_def: Dict[str, Any],
        idea: Dict[str, Any],
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate a single business plan section using routed AI completion."""
        section_key = section_def["key"]
        task = section_def["task"]

        prompt = f"""{section_def['prompt_template']}

Startup Idea: {json.dumps(idea, default=str)}
Additional Context: {json.dumps(context, default=str)}

RULES:
- Be specific, quantified, and realistic
- NO generic filler or motivational language
- Use real industry benchmarks where applicable
- Label low-confidence estimates explicitly
- Output must feel like a $50K consulting deliverable
- Return ONLY valid JSON. No markdown wrapping."""

        try:
            response = await self.client.routed_completion(
                task=task,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2500,
                response_format={"type": "json_object"},
            )
            content = response.get("content", "{}")
            parsed = safe_json_parse(content)

            # If the parsed result has an "error" key, it failed
            if isinstance(parsed, dict) and "error" in parsed and len(parsed) <= 2:
                logger.warning(f"Section {section_key} returned error JSON, using empty dict")
                return {}

            return parsed
        except Exception as e:
            logger.error(f"Section '{section_key}' generation failed: {e}")
            return {}

    async def generate_business_plan(
        self,
        idea: Dict[str, Any],
        research: Optional[Dict[str, Any]] = None,
        run_id: Optional[str] = None,
        industry: str = "",
        target_market: str = "",
        business_model: str = "",
        region: str = "",
        depth: str = "investor",
    ) -> Dict[str, Any]:
        """
        Generate a full 25-section investor-grade business plan.

        Uses parallel batch generation with task-aware model routing.
        Each section is generated independently for reliability and
        validated before assembly.
        """
        if not run_id:
            run_id = f"BP-{uuid.uuid4().hex[:8]}"

        # Return cached result if available
        if run_id in self.plan_store:
            existing = self.plan_store[run_id]
            if existing.get("status") in ["COMPLETE", "RUNNING"]:
                return existing

        # Mark as running
        self.plan_store[run_id] = {"run_id": run_id, "status": "RUNNING"}

        # Build enriched context for prompts
        context = {
            "industry": industry or idea.get("industry", "Technology"),
            "target_market": target_market or idea.get("target_market", ""),
            "business_model": business_model or idea.get("business_model", "SaaS"),
            "region": region or idea.get("region", "Global"),
            "depth": depth,
            "research": research or {},
        }

        # Determine sections based on depth
        if depth == "basic":
            section_keys = [
                "executive_summary", "problem_statement", "solution",
                "market_opportunity", "competitive_analysis", "revenue_model",
                "go_to_market", "financial_forecasts", "risk_analysis",
                "ai_strategic_recommendations",
            ]
        elif depth == "advanced":
            section_keys = [
                "executive_summary", "company_overview", "problem_statement",
                "solution", "market_opportunity", "industry_analysis",
                "competitive_analysis", "customer_segmentation", "revenue_model",
                "pricing_strategy", "go_to_market", "growth_strategy",
                "financial_forecasts", "unit_economics", "risk_analysis",
                "swot_analysis", "product_roadmap", "ai_strategic_recommendations",
            ]
        else:  # investor (full 25 sections)
            section_keys = [s["key"] for s in BUSINESS_PLAN_SECTIONS]

        # Filter sections
        sections_to_generate = [
            s for s in BUSINESS_PLAN_SECTIONS if s["key"] in section_keys
        ]

        # Generate all sections in parallel, letting ai_limiter handle concurrency
        aggregated_plan: Dict[str, Any] = {}
        
        tasks = [
            self._generate_section(section_def, idea, context)
            for section_def in sections_to_generate
        ]

        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for section_def, result in zip(sections_to_generate, results):
                if isinstance(result, Exception):
                    logger.error(f"Section {section_def['key']} raised: {result}")
                    aggregated_plan[section_def["key"]] = {}
                elif isinstance(result, dict) and result:
                    aggregated_plan[section_def["key"]] = result
                else:
                    aggregated_plan[section_def["key"]] = {}
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            for section_def in sections_to_generate:
                aggregated_plan[section_def["key"]] = {}

        # Calculate confidence score
        filled_sections = sum(
            1 for v in aggregated_plan.values()
            if isinstance(v, dict) and len(v) > 0
        )
        total_sections = len(sections_to_generate)
        confidence = int((filled_sections / max(total_sections, 1)) * 100)

        # Build section order metadata
        section_order = [
            {"key": s["key"], "title": s["title"]}
            for s in sections_to_generate
        ]

        result = {
            "run_id": run_id,
            "idea_id": idea.get("id") or idea.get("idea_id"),
            "status": "COMPLETE",
            "depth": depth,
            "total_sections": total_sections,
            "completed_sections": filled_sections,
            "confidence_score": confidence,
            "section_order": section_order,
            "business_plan": aggregated_plan,
        }

        self.plan_store[run_id] = result
        return result

    def get_business_plan(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve stored business plan by run_id."""
        return self.plan_store.get(run_id)


# Module-level singleton
business_plan_service = BusinessPlanService()
