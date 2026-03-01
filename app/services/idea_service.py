import uuid
import json
import logging
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.core.config import settings
from app.services.signal_service import signal_service
from app.core.ai_client import get_ai_client
from app.services.memory_service import memory_service
from app.services.seed_generator_service import seed_generator_service
from app.services.interpreter_service import interpreter_service
import asyncio

logger = logging.getLogger(__name__)

class IdeaService:
    def __init__(self):
        self.client = get_ai_client()
        self.history: Dict[str, List[Dict[str, Any]]] = {}
        self.instance_id = str(uuid.uuid4())
        logger.info(f"IdeaService initialized with instance_id: {self.instance_id}")

    async def generate_ideas(self, mode: str = "discover", user_input: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Synthesize startup ideas based on live signals and mode.
        Legacy method used as fallback.
        """
        logger.info(f"generate_ideas called (fallback method) - mode: {mode}")
        run_id = str(uuid.uuid4())
        
        # This is a fallback method, so just return mock ideas
        fallback_ideas = self._get_mock_ideas(mode, user_input)
        self.history[run_id] = fallback_ideas
        return fallback_ideas

    def _get_mock_ideas(self, mode: str, user_input: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Returns high-quality mock ideas for demonstration.
        """
        base_ideas = [
            {
                "title": "SmartLegal Audit AI",
                "thesis": "Automating high-volume contract compliance for mid-market law firms.",
                "market_size": "$2.4B Mid-Market Legal Segment",
                "problem_bullets": [
                    "Manual contract auditing consumes 30% of billable hours",
                    "GDPR/CCPA compliance requires deep domain expertise to check manually",
                    "Errors in compliance go unnoticed until audit failures"
                ],
                "target_customer": {
                    "primary_user": "Legal Operations Managers",
                    "company_size": "50-200 Employees",
                    "industry_or_role": "Mid-sized Law Firms"
                },
                "monetization": {
                    "pricing_structure": "$500/mo per seat",
                    "who_pays": "Managing Partners",
                    "value_prop": "3x reduction in billable hour loss for compliance tasks"
                },
                "why_now_bullets": [
                    "Rapid increase in privacy regulation across jurisdictions",
                    "LLM accuracy for legal text has reached production threshold",
                    "Mid-market firms are falling behind enterprise tech adoption"
                ],
                "alternatives_structured": {
                    "today": ["Manual review by paralegals", "Legacy enterprise CLM (Ironclad)"],
                    "gaps": ["Manual review is prone to human error", "Enterprise tools are too complex and expensive for mid-market"]
                },
                "mvp_scope_bullets": [
                    "PDF/Docx contract uploader",
                    "Autonomous compliance checklist extractor",
                    "Discrepancy detection engine",
                    "Summary report generator",
                    "Basic seat management"
                ],
                "confidence_reasoning_bullets": [
                    "Strong signal repetition in legal tech forums",
                    "Clear ROI driven by labor cost reduction",
                    "High execution feasibility for focused vertical AI"
                ],
                "risks_structured": {
                    "adoption": "Lawyers being slow to trust AI-generated audits",
                    "technical": "Ensuring 99%+ accuracy for legal clauses",
                    "market": "Consolidation of legal tech vendors"
                },
                "confidence_score": 92,
                "market_score": 88,
                "execution_complexity": 5
            },
            {
                "title": "FleetMind Optimization",
                "thesis": "Real-time predictive routing for last-mile logistics at a fraction of enterprise cost.",
                "market_size": "$800M+ Last-Mile Service Economy",
                "problem_bullets": [
                    "Inefficient routing causes 15% revenue loss in wasted fuel and time",
                    "Real-time traffic changes are currently handled manually or reactively",
                    "Drivers lose focus toggling between multiple navigation apps"
                ],
                "target_customer": {
                    "primary_user": "Logistics Dispatchers",
                    "company_size": "SMB to Mid-market Logistics",
                    "industry_or_role": "Local Delivery and Courier Services"
                },
                "monetization": {
                    "pricing_structure": "Usage-based per active driver",
                    "who_pays": "Fleet Owners",
                    "value_prop": "Immediate reduction in fuel costs and improved delivery SLA"
                },
                "why_now_bullets": [
                    "Explosive growth in e-commerce and local delivery demand",
                    "Real-time traffic APIs are now granular enough for street-level prediction",
                    "Fuel prices are increasingly volatile, making efficiency a survival metric"
                ],
                "alternatives_structured": {
                    "today": ["Google Maps", "Generic route planners (Onfleet)"],
                    "gaps": ["No predictive context for future traffic patterns", "High cost for advanced optimization features"]
                },
                "mvp_scope_bullets": [
                    "Dispatcher dashboard with live driver tracking",
                    "Core routing optimization algorithm",
                    "Driver mobile interface",
                    "Fuel savings calculator",
                    "Integration with major e-commerce platforms"
                ],
                "confidence_reasoning_bullets": [
                    "High demand velocity in the logistics sector",
                    "Significant market gap for affordable optimization tools",
                    "Verified pain point for fleet margins"
                ],
                "risks_structured": {
                    "adoption": "Driver resistance to new tracking apps",
                    "technical": "High concurrency support for real-time updates",
                    "market": "Platform risk from Google or Amazon internal tools"
                },
                "confidence_score": 96,
                "market_score": 94,
                "execution_complexity": 6
            },
            {
                "title": "EduFlow AI",
                "thesis": "Personalized learning paths for corporate upskilling using proprietary knowledge bases.",
                "market_size": "$4B Corporate L&D Market",
                "problem_bullets": [
                    "Static training videos have <10% completion rates",
                    "New employees take 6+ months to reach full productivity",
                    "Knowledge is trapped in Slack and scattered Notion docs"
                ],
                "target_customer": {
                    "primary_user": "HR Managers",
                    "company_size": "Mid-market Tech (100-500 employees)",
                    "industry_or_role": "Technology & Professional Services"
                },
                "monetization": {
                    "pricing_structure": "$15/user per month",
                    "who_pays": "L&D Department",
                    "value_prop": "50% reduction in ramp-up time for new hires"
                },
                "why_now_bullets": [
                    "Remote work makes organic knowledge transfer difficult",
                    "RAG (Retrieval-Augmented Generation) makes company data queryable",
                    "Skills gap is widening in rapidly evolving tech roles"
                ],
                "alternatives_structured": {
                    "today": ["LMS platforms (Loomly, Teachable)", "Static onboarding docs"],
                    "gaps": ["One-size-fits-all content doesn't adapt to user level", "Docs are quickly outdated"]
                },
                "mvp_scope_bullets": [
                    "Notion/Slack integration for knowledge ingestion",
                    "AI-generated quiz and path engine",
                    "Progress tracking dashboard",
                    "Interactive 'Mentor' chatbot",
                    "Feedback loop for content owners"
                ],
                "confidence_reasoning_bullets": [
                    "Strong corporate demand for efficient upskilling",
                    "Clear pain point in knowledge management",
                    "High stickiness potential"
                ],
                "risks_structured": {
                    "adoption": "Engagement decay after first month",
                    "technical": "Ensuring AI doesn't hallucinate company policies",
                    "market": "Incumbents like LinkedIn Learning adding AI features"
                },
                "confidence_score": 89,
                "market_score": 85,
                "execution_complexity": 4
            },
            {
                "title": "HealthSync Wellness",
                "thesis": "AI-driven preventative health monitoring for senior care facilities.",
                "market_size": "$12B Senior Living & Care",
                "problem_bullets": [
                    "Caregivers are overwhelmed and miss early warning signs",
                    "Hospital readmissions cost facilities $18k+ per event",
                    "Vital stats are recorded manually and inconsistently"
                ],
                "target_customer": {
                    "primary_user": "Care Facility Administrators",
                    "company_size": "Regional Elder Care Groups",
                    "industry_or_role": "Healthcare & Assisted Living"
                },
                "monetization": {
                    "pricing_structure": "$2,000/mo per facility",
                    "who_pays": "Facility Operations",
                    "value_prop": "30% reduction in avoidable hospitalizations"
                },
                "why_now_bullets": [
                    "Aging population is putting unprecedented strain on facilities",
                    "IoT health sensors are finally affordable for volume deployment",
                    "Medicare shifts toward value-based care models"
                ],
                "alternatives_structured": {
                    "today": ["Periodic nurse rounds", "Basic panic buttons"],
                    "gaps": ["Reactive rather than proactive monitoring", "Labor-intensive data collection"]
                },
                "mvp_scope_bullets": [
                    "Integration with common wearable sensors",
                    "Predictive alert dashboard",
                    "Caregiver mobile app",
                    "Weekly health trend reporting",
                    "Direct family update portal"
                ],
                "confidence_reasoning_bullets": [
                    "Critical healthcare labor shortage",
                    "High financial incentive for readmission reduction",
                    "Growing consumer demand for senior safety"
                ],
                "risks_structured": {
                    "adoption": "Resistance from tech-averse nursing staff",
                    "technical": "HIPAA compliance and data security",
                    "market": "Varying regulations across different states"
                },
                "confidence_score": 91,
                "market_score": 90,
                "execution_complexity": 7
            },
            {
                "title": "RetailRadar AI",
                "thesis": "Predictive inventory management for independent boutique retailers.",
                "market_size": "$5B Boutique Retail Segment",
                "problem_bullets": [
                    "Overstocking locks up $50k+ in capital per store",
                    "Stockouts lead to 15% missed revenue",
                    "Inventory decisions are made by 'gut feeling' instead of data"
                ],
                "target_customer": {
                    "primary_user": "Boutique Owners",
                    "company_size": "Independent Retailers / 1-3 Locations",
                    "industry_or_role": "Fashion and Lifestyle Retail"
                },
                "monetization": {
                    "pricing_structure": "$199/mo per location",
                    "who_pays": "Owner/Manager",
                    "value_prop": "25% improvement in stock-turn efficiency"
                },
                "why_now_bullets": [
                    "Modern POS systems (Shopify/Square) offer open APIs for data",
                    "Consumer trends are shifting faster than ever due to social media",
                    "Margin pressure from e-commerce makes overhead reduction critical"
                ],
                "alternatives_structured": {
                    "today": ["Spreadsheets", "POS native reports"],
                    "gaps": ["POS reports only show the past, not the future", "Spreadsheets are time-consuming and error-prone"]
                },
                "mvp_scope_bullets": [
                    "Shopify/Square integration",
                    "Demand forecasting visualization",
                    "Reorder point automation",
                    "Trend analysis from social signals",
                    "Financial impact simulator"
                ],
                "confidence_reasoning_bullets": [
                    "Strong demand from efficiency-minded SMB owners",
                    "High data availability via modern integrations",
                    "Direct measurable impact on bottom-line profit"
                ],
                "risks_structured": {
                    "adoption": "Convincing owners to trust AI over 'buying eye'",
                    "technical": "Accuracy of forecasts in seasonal markets",
                    "market": "Consolidation of retail tech"
                },
                "confidence_score": 87,
                "market_score": 82,
                "execution_complexity": 3
            },
            {
                "title": "CleanCurrents Monitoring",
                "thesis": "IoT-driven water quality monitoring for sustainable aquaculture farms.",
                "market_size": "$3.2B Global Aquaculture Tech",
                "problem_bullets": [
                    "Undetected pH shifts can kill an entire pond's stock in hours",
                    "Manual testing is only done once per day, missing spikes",
                    "Regulatory reporting for wastewater is labor-intensive"
                ],
                "target_customer": {
                    "primary_user": "Farm Operations Managers",
                    "company_size": "SMB Aquaculture Farms",
                    "industry_or_role": "Sustainable Seafood Production"
                },
                "monetization": {
                    "pricing_structure": "$100/mo per sensor node",
                    "who_pays": "Farm Owners",
                    "value_prop": "90% reduction in catastrophic stock loss risk"
                },
                "why_now_bullets": [
                    "Stricter environmental regulations on aquaculture runoff",
                    "Low-power wide-area networks (LoRaWAN) make large-scale sensing cheap",
                    "Rising global demand for sustainable protein sources"
                ],
                "alternatives_structured": {
                    "today": ["Handheld probe testing", "No monitoring"],
                    "gaps": ["High labor cost for frequent testing", "No real-time alerts for 2 AM failures"]
                },
                "mvp_scope_bullets": [
                    "LoRaWAN gateway integration",
                    "Submersible sensor node (pH, DO, Temp)",
                    "Real-time SMS alerting system",
                    "Historical trending dashboard",
                    "Automated compliance report generator"
                ],
                "confidence_reasoning_bullets": [
                    "Direct correlation between monitoring and profit protection",
                    "Growing vertical with clear regulatory tailwinds",
                    "High technical defensibility through sensor calibration"
                ],
                "risks_structured": {
                    "adoption": "Initial hardware setup cost barrier",
                    "technical": "Sensor fouling in saltwater environments",
                    "market": "Fluctuating seafood commodity prices"
                },
                "confidence_score": 84,
                "market_score": 78,
                "execution_complexity": 6
            },
            {
                "title": "TalentTrace AI",
                "thesis": "Automated skill-matching for the 'Fractional Exec' market.",
                "market_size": "$1.5B High-End Gig Economy",
                "problem_bullets": [
                    "Finding a vetted part-time CFO or CMO takes weeks of networking",
                    "Vetting quality for specialized roles is difficult for non-experts",
                    "Fractional roles often lack clear scoping and milestones"
                ],
                "target_customer": {
                    "primary_user": "Founder/CEO",
                    "company_size": "Seed to Series B Startups",
                    "industry_or_role": "Fast-growing Venture-backed Companies"
                },
                "monetization": {
                    "pricing_structure": "15% placement fee + platform subscription",
                    "who_pays": "Hiring Company",
                    "value_prop": "Hire elite talent in 48 hours instead of 4 weeks"
                },
                "why_now_bullets": [
                    "Massive shift toward fractional and contract-to-hire leadership",
                    "Tech layoffs have flooded the market with high-quality part-time talent",
                    "Startups need to extend runway by avoiding high full-time salaries"
                ],
                "alternatives_structured": {
                    "today": ["Upwork (too low quality)", "Executive Search (too slow/expensive)"],
                    "gaps": ["High noise-to-signal ratio on generic platforms", "Lack of milestone-based tracking for legal/finance roles"]
                },
                "mvp_scope_bullets": [
                    "LinkedIn-integrated talent importer",
                    "AI skill-vetting engine (via portfolio analysis)",
                    "Smart matching dashboard",
                    "Milestone-based contract management",
                    "Automated escrow and payments"
                ],
                "confidence_reasoning_bullets": [
                    "Significant market tailwinds for fractional work",
                    "High average order value with recurring potential",
                    "Clear pain point for fast-scaling founders"
                ],
                "risks_structured": {
                    "adoption": "Keeping high-quality talent on the platform long-term",
                    "technical": "Building a fair and accurate AI vetting model",
                    "market": "Economic downturn reducing overall hiring"
                },
                "confidence_score": 88,
                "market_score": 85,
                "execution_complexity": 4
            }
        ]
        
        import random
        random.shuffle(base_ideas)
        # Return a random subset (3 to 5 ideas) to ensure variety
        count = random.randint(3, len(base_ideas))
        selected_ideas = base_ideas[:count]
        
        # Add IDs
        for i, idea in enumerate(selected_ideas):
            idea["idea_id"] = f"mock-{i}-{uuid.uuid4()}"

        return selected_ideas

    async def generate_ideas_with_seeds(
        self, 
        project_id: str,
        user_id: Optional[str] = None,
        mode: str = "discover", 
        user_input: Optional[str] = None,
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """
        PRODUCTION METHOD: Generate ideas using seed-based generation.
        
        This method:
        1. Reserves unique seeds atomically
        2. Batches all 5 ideas into a single AI call (80% cost reduction)
        3. Maps ideas back to seeds
        4. Implements retry logic with seed release
        5. Enforces per-project + per-user uniqueness
        """
        run_id = str(uuid.uuid4())
        reserved_seeds = []
        
        try:
            # STEP 1: Reserve seeds atomically
            logger.info(f"Reserving {count} seeds for project {project_id[:8]}...")
            try:
                reserved_seeds = await seed_generator_service.generate_seed_batch(
                    project_id=project_id,
                    user_id=user_id,
                    count=count
                )
            except Exception as seed_error:
                logger.error(f"Seed reservation failed: {seed_error}")
                # Fallback to original generation method
                return await self.generate_ideas(mode=mode, user_input=user_input)
            
            # STEP 2: Get dimension details for each seed
            seed_constraints = []
            for seed in reserved_seeds:
                details = await seed_generator_service.get_dimension_details(seed)
                seed_constraints.append(details)
            
            # STEP 3: Fetch market signals
            try:
                # Force refresh ~6% of the time (1/16) to keep signals fresh but fast
                should_refresh = (uuid.uuid4().hex[0] == "0") 
                live_signals = await signal_service.fetch_signals(force_refresh=should_refresh)
                
                # Shuffle and sample signals for variety
                import random
                random.shuffle(live_signals)
                sampled_signals = live_signals[:10]  # Take a random subset of 10
                signals_text = json.dumps(sampled_signals, indent=2)

                # INJECT RANDOMNESS: Pick a "Creative Angle"
                creative_angles = [
                    "Focus heavily on unsexy, boring B2B niches with high cash flow.",
                    "Prioritize consumer social apps with high viral potential.",
                    "Look for 'unbundling' opportunities of major platforms (e.g. unbundling LinkedIn, Reddit).",
                    "Focus on 'peace technology' and mental wellness tools.",
                    "Target deep-tech, R&D heavy solutions for enterprise.",
                    "Focus on blue-collar workforce enablement.",
                    "Look for opportunities in the silver economy (aging population).",
                    "Prioritize privacy-first, local-only software architecture."
                ]
                selected_angle = random.choice(creative_angles)
                logger.info(f"Generating ideas with angle: {selected_angle}")
            except Exception as e:
                logger.error(f"Signal fetching failed in seed-based gen: {e}", exc_info=True)
                signals_text = "[]"
                selected_angle = "Focus on generalized high-impact startup opportunities."
                live_signals = [] # Ensure live_signals is defined for below
            
            # STEP 4: Construct batch AI prompt with diversity constraints
            logger.info("Constructing AI prompt...")

            # Step 4: AI Synthesis (Pass 1)
            system_prompt = """
You are Smartbuilder, an elite AI co-founder.
Your role is to convert real market signals into high-potential, defensible startup ideas.

OUTPUT SCHEMA (STRICT JSON):
Return a JSON object with key "ideas" containing an array of exactly {count} objects.
Each object MUST have these exact fields and structure:

{
  "title": "Short, catchy name",
  "thesis": "One-sentence investment thesis",
  "market_size": "e.g. $10B TAM / Rapid Growth",
  "problem_bullets": ["Major pain point 1", "Major pain point 2"],
  "target_customer": {
    "primary_user": "Who uses it?",
    "company_size": "e.g. SMB, Enterprise, Individual",
    "industry_or_role": "Specific niche"
  },
  "monetization": {
    "pricing_structure": "e.g. SaaS, Commision, Usage-based",
    "who_pays": "e.g. Department Head, End User",
    "value_prop": "Short benefit statement"
  },
  "why_now_bullets": ["Signal or market shift 1", "Signal or market shift 2"],
  "alternatives_structured": {
    "today": ["Manual process", "Legacy tool"],
    "gaps": ["High cost", "Poor integration"]
  },
  "mvp_scope_bullets": ["Feature 1", "Feature 2"],
  "confidence_reasoning_bullets": ["Why this matches signals", "Why it is defensible"],
  "risks_structured": {
    "adoption": "Main adoption risk",
    "technical": "Main technical risk",
    "market": "Main market risk"
  },
  "confidence_score": 85,
  "market_score": 80,
  "execution_complexity": 5
}

RULES:
- Base ideas strictly on the provided signals.
- Focus on SaaS, AI, fintech, and scalable internet businesses.
- Every idea must be realistic to build an MVP in under 30 days.
- Return ONLY valid JSON. No markdown code blocks. No other text.
"""
            
            # Format seed constraints for prompt
            constraints_text = ""
            for i, constraint in enumerate(seed_constraints):
                constraints_text += f"Idea {i+1} Constraints:\n"
                for dim, val in constraint.items():
                    constraints_text += f"- {dim.replace('_', ' ').title()}: {val}\n"
                constraints_text += "\n"

            user_prompt = f"""
Using the following market signals, generate exactly {count} strong startup ideas.

CREATIVE LENS:
{selected_angle}

SEED-BASED CONSTRAINTS:
Each idea in your response MUST strictly follow the corresponding constraint below:
{constraints_text}

Market Signals:
{signals_text}
"""
            
            if mode == "validate_idea" and user_input:
                user_prompt = f"""
Using the following market signals, validate, refine, or reposition this proposal: {user_input}
Generate exactly {count} variations.

CREATIVE LENS:
{selected_angle}

SEED-BASED CONSTRAINTS:
Each variation MUST strictly follow the corresponding constraint below:
{constraints_text}

Market Signals:
{signals_text}
"""
            
            # STEP 5: Single batch AI call (1 call for 5 ideas)
            if not settings.has_ai_key:
                logger.info("No AI keys, using mock ideas")
                await seed_generator_service.release_seeds([s['id'] for s in reserved_seeds])
                return self._get_mock_ideas(mode, user_input)
            
            max_retries = 3
            for retry_attempt in range(max_retries):
                try:
                    logger.info(f"AI batch generation attempt {retry_attempt + 1}/{max_retries}")
                    
                    try:
                        # Add specific timeout for the entire generation call (90s)
                        response = await asyncio.wait_for(
                            self.client.chat_completion(
                                messages=[
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": user_prompt}
                                ],
                                response_format={"type": "json_object"},
                                temperature=0.9
                            ),
                            timeout=90.0
                        )
                    except asyncio.TimeoutError:
                        logger.error(f"AI generation timed out after 90s (Attempt {retry_attempt+1})")
                        raise Exception("AI generation timed out")
                    
                    content = response["content"]
                    
                    # Parse JSON with robust cleaning
                    content = content.strip()
                    
                    # Remove markdown code blocks
                    if content.startswith("```"):
                        content = content.split("```", 1)[1]
                        if content.startswith("json"):
                            content = content[4:]
                        if content.endswith("```"):
                            content = content[:-3]
                    
                    # Find JSON boundaries
                    start_idx = content.find("{")
                    end_idx = content.rfind("}")
                    if start_idx != -1 and end_idx != -1:
                        content = content[start_idx:end_idx+1]
                    
                    try:
                        data = json.loads(content)
                    except Exception as json_err:
                        logger.warning(f"Initial JSON parse failed: {json_err}. Attempting robust recovery...")
                        # Try to extract just the first valid JSON object
                        lines = content.split('\n')
                        brace_count = 0
                        json_lines = []
                        for line in lines:
                            json_lines.append(line)
                            brace_count += line.count('{') - line.count('}')
                            if brace_count == 0 and len(json_lines) > 1:
                                break
                        content = '\n'.join(json_lines)
                        data = json.loads(content)
                    # Extract ideas array
                    ideas_raw = []
                    logger.info(f"Successfully parsed JSON. Data type: {type(data)}")
                    if isinstance(data, dict):
                        logger.info(f"JSON keys: {list(data.keys())}")
                        if "ideas" in data:
                            ideas_raw = data["ideas"]
                            logger.info(f"Found {len(ideas_raw)} ideas in 'ideas' key")
                        else:
                            # Try to find any key that looks like it contains a list of ideas
                            for key, value in data.items():
                                if isinstance(value, list) and len(value) > 0:
                                    logger.info(f"Falling back to key: {key}")
                                    ideas_raw = value
                                    break
                    elif isinstance(data, list):
                        ideas_raw = data
                        logger.info(f"Found {len(ideas_raw)} ideas in top-level list")
                    
                    if not ideas_raw:
                        logger.error(f"Failed to find ideas in data: {data}")
                        raise Exception("No ideas in AI response")
                    
                    # Pass 2: Scoring and Filtering (Step 5 in PRD)
                    scored_ideas = await self._score_and_filter_ideas(ideas_raw)
                    
                    # Map to final schema
                    validated_ideas = []
                    for i, idea_data in enumerate(scored_ideas):
                        # Ensure fields match requested schema
                        # Ensure defaults to prevent FE crashes
                        if not isinstance(idea_data, dict):
                            logger.warning(f"AI returned non-dict idea at index {i}: {type(idea_data)}")
                            continue
                        
                        idea_data["thesis"] = idea_data.get("thesis", "No thesis provided.")
                        if not isinstance(idea_data.get("problem_bullets"), list): idea_data["problem_bullets"] = []
                        if not isinstance(idea_data.get("why_now_bullets"), list): idea_data["why_now_bullets"] = []
                        if not isinstance(idea_data.get("mvp_scope_bullets"), list): idea_data["mvp_scope_bullets"] = []
                        if not isinstance(idea_data.get("confidence_reasoning_bullets"), list): idea_data["confidence_reasoning_bullets"] = []

                        # Anti-Untitled Logic - If title is weak, generate better one
                        title = idea_data.get("title", "").strip()
                        if not title or "untitled" in title.lower() or "startup idea" in title.lower():
                             logger.warning(f"AI returned weak title '{title}'. Regenerating title...")
                             # Fallback title generation based on thesis
                             # If thesis is also empty, try problem
                             thesis = idea_data.get("thesis", "") 
                             if not thesis or thesis == "No thesis provided.":
                                  if idea_data.get("problem_bullets") and len(idea_data["problem_bullets"]) > 0:
                                       thesis = idea_data["problem_bullets"][0]
                             
                             if thesis and thesis != "No thesis provided.":
                                  # Simple heuristic: first 3 words of thesis + " AI"
                                  words = thesis.split()
                                  clean_words = [w for w in words if len(w) > 3] # Filter small words
                                  if len(clean_words) >= 2:
                                      title = f"{clean_words[0]} {clean_words[1]} AI"
                                  elif len(words) >= 2:
                                      title = f"{words[0]} {words[1]} AI"
                                  else:
                                      title = "New Venture AI"
                             else:
                                  title = "New Venture Opportunity"
                             
                             title = title.title()
                        
                        idea_data["title"] = title
                        idea_data["idea_id"] = str(uuid.uuid4())
                        idea_data["seed_id"] = reserved_seeds[i]['id'] if i < len(reserved_seeds) else None
                        validated_ideas.append(idea_data)
                    
                    if not validated_ideas:
                        raise Exception("No validated ideas after quality gates")
                    
                    # STEP 7: Persist to database (using ideas_v2 table)
                    persisted_ideas = []
                    from app.core.supabase import get_service_client
                    svc_client = get_service_client()
                    
                    for idea in validated_ideas:
                        try:
                            # Save to ideas_v2 table
                            idea_record = {
                                "project_id": project_id,
                                "user_id": user_id,
                                "seed_id": idea.get("seed_id"),
                                "title": idea["title"],
                                "thesis": idea.get("thesis", idea.get("problem", ""))[:250],
                                "source": "ai_generated",
                                "confidence_score": int(float(idea.get("score", 8.0) or 8.0) * 10),
                                "content": idea,
                                "status": "draft"
                            }
                            
                            # Try to insert into ideas_v2
                            try:
                                response = svc_client.table("ideas_v2").insert(idea_record).execute()
                                if response.data:
                                    saved_idea = response.data[0]
                                    idea["id"] = saved_idea["id"]
                                    persisted_ideas.append(idea)
                            except Exception as db_err:
                                # Handle collision by adding random suffix and trying once more
                                db_msg = str(db_err).lower()
                                logger.info(f"DB Insert Error into ideas_v2: {db_msg}")
                                if "unique constraint" in db_msg or "duplicate key" in db_msg or "23505" in db_msg:
                                    logger.info(f"Title collision for '{idea['title']}', adding entropy...")
                                    import random
                                    new_title = f"{idea['title']} #{random.randint(1000, 9999)}"
                                    idea_record["title"] = new_title
                                    try:
                                        response = svc_client.table("ideas_v2").insert(idea_record).execute()
                                        if response.data:
                                            logger.info(f"Successfully saved idea with entropy: {new_title}")
                                            saved_idea = response.data[0]
                                            idea["id"] = saved_idea["id"]
                                            persisted_ideas.append(idea)
                                            continue
                                    except Exception as retry_err:
                                        logger.warning(f"Retry insert failed: {retry_err}")
                                
                                # Fallback to old ideas table if ideas_v2 fails
                                logger.warning(f"ideas_v2 insert failed, trying legacy table: {db_err}")
                                saved = await memory_service.save_idea(project_id, idea)
                                persisted_ideas.append(saved)
                            
                        except Exception as save_err:
                            logger.warning(f"Failed to persist idea: {save_err}")
                            # Still include in response
                            if "id" not in idea:
                                idea["id"] = str(uuid.uuid4())
                            persisted_ideas.append(idea)
                    
                    # STEP 8: Mark seeds as used
                    used_seed_ids = [idea.get("seed_id") for idea in persisted_ideas if idea.get("seed_id")]
                    if used_seed_ids:
                        await seed_generator_service.mark_seeds_as_used(used_seed_ids)
                    
                    logger.info(f"✅ Batch generation SUCCESS: {len(persisted_ideas)} ideas with {len(used_seed_ids)} seeds")
                    self.history[run_id] = persisted_ideas
                    return persisted_ideas
                    
                except Exception as ai_error:
                    logger.error(f"AI generation attempt {retry_attempt + 1} failed: {ai_error}")
                    if retry_attempt < max_retries - 1:
                        await asyncio.sleep(1)  # Brief delay before retry
                        continue
                    else:
                        # Final retry failed, release seeds and fallback
                        logger.error("All AI generation attempts failed")
                        await seed_generator_service.release_seeds([s['id'] for s in reserved_seeds])
                        return await self.generate_ideas(mode=mode, user_input=user_input, user_id=user_id)
            
        except Exception as global_error:
            logger.error(f"Global error in seed-based generation: {global_error}", exc_info=True)
            # Release any reserved seeds
            if reserved_seeds:
                await seed_generator_service.release_seeds([s['id'] for s in reserved_seeds])
            # Fallback to original method
            return await self.generate_ideas(mode=mode, user_input=user_input, user_id=user_id)

    async def _cluster_signals(self, signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Use E2B Code Interpreter to deduplicate, cluster, and rank signals."""
        if not signals:
            return []

        cluster_code = """
import json
from collections import Counter

with open('data.json', 'r') as f:
    signals = json.load(f)

# Step 1: Extract patterns
patterns = [s.get("pattern", "") for s in signals if s.get("pattern")]

# Step 2: Simple frequency clustering
counts = Counter(patterns)

# Step 3: Create structured signal clusters
# In a real scenario, we'd use NLP/Embeddings here for better clustering
clusters = []
for pattern, count in counts.most_common(25):
    # Find original signal to get meta
    orig = next((s for s in signals if s.get("pattern") == pattern), {})
    clusters.append({
        "source": orig.get("source", "Multiple"),
        "category": orig.get("category", "General"),
        "pattern": pattern,
        "audience": orig.get("audience", "General"),
        "frequency": "High" if count > 2 else "Medium",
        "urgency": orig.get("urgency", "Medium"),
        "evidence_count": count
    })

print(json.dumps(clusters))
"""
        try:
            analysis = await interpreter_service.run_analysis(cluster_code, signals)
            if analysis.get("status") == "success":
                return analysis.get("results", [])
            return signals[:25] # Fallback
        except Exception as e:
            logger.error(f"E2B Clustering failed: {e}")
            return signals[:25]

    async def _score_and_filter_ideas(self, ideas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Pass 2: Score each idea and filter out those below 8/10."""
        if not ideas:
            return []

        scoring_prompt = """
You are a YC-grade Startup Analyst. 
Score each of the following startup ideas from 1.0 to 10.0 on:
- Market Demand (Real signals matching the idea)
- Clarity of Pain (How acute is the problem?)
- Speed to MVP (Can it be built in < 30 days?)
- Monetization Strength (Is there high willingness to pay?)

Return a JSON object with key "scores" containing an array of objects:
{
  "idea_id": "uuid",
  "market_demand": 8.5,
  "clarity_pain": 9.0,
  "speed_to_mvp": 7.5,
  "monetization": 8.0,
  "final_score": 8.25
}
"""
        try:
            response = await self.client.chat_completion(
                messages=[
                    {"role": "system", "content": scoring_prompt},
                    {"role": "user", "content": f"Score these ideas: {json.dumps(ideas)}"}
                ],
                response_format={"type": "json_object"}
            )
            
            try:
                score_data = json.loads(response["content"])
            except:
                logger.error(f"Failed to parse scoring JSON: {response['content'][:200]}")
                score_data = {}
                
            raw_scores = score_data.get("scores")
            if not isinstance(raw_scores, list):
                raw_scores = []
                
            scores_map = {}
            for s in raw_scores:
                if isinstance(s, dict) and "idea_id" in s:
                    scores_map[s["idea_id"]] = s
            
            # Apply threshold (8/10 as per PRD)
            filtered = []
            for idea in ideas:
                if not isinstance(idea, dict):
                    continue
                    
                s = scores_map.get(idea.get("idea_id"), {})
                final_score = s.get("final_score")
                try:
                    final_score = float(final_score) if final_score is not None else 8.0
                except (TypeError, ValueError):
                    final_score = 8.0
                    
                if final_score >= 8.0:
                    idea["score"] = final_score
                    try:
                        market_demand = float(s.get("market_demand") or 8.5)
                    except (TypeError, ValueError):
                        market_demand = 8.5
                    try:
                        speed_to_mvp = float(s.get("speed_to_mvp") or 7.5)
                    except (TypeError, ValueError):
                        speed_to_mvp = 7.5
                    idea["market_score"] = int(market_demand * 10)
                    idea["execution_complexity"] = int(10 - speed_to_mvp) # Complexity is inverse of speed
                    idea["confidence_label"] = "High" if final_score >= 9.0 else "Medium"
                    # Add reasoning if missing
                    if "reasoning" not in idea:
                        idea["reasoning"] = [f"High market demand ({market_demand}/10)", f"Strong monetization potential"]
                    filtered.append(idea)
            
            return filtered
        except Exception as e:
            logger.error(f"Scoring pass failed: {e}")
            # Fallback: add default scores and return all
            for idea in ideas:
                idea["score"] = idea.get("confidence_score", 85) / 10.0
                idea["confidence_label"] = "High"
            return ideas

    def promote_idea(self, idea_id: str) -> Dict[str, Any]:
        """
        Promote a specific idea to the Research stage.
        """
        print(f"[{self.instance_id}] Searching for idea_id: {idea_id} in history (Current runs: {list(self.history.keys())})")
        # Use a copy of items to avoid RuntimeError: dictionary changed size during iteration
        for run_id, ideas in list(self.history.items()):
            for idea in ideas:
                if idea["idea_id"] == idea_id:
                    print(f"[{self.instance_id}] Idea found in run_id: {run_id}")
                    return {"status": "success", "idea": idea, "next_stage": "Research"}
        print(f"[{self.instance_id}] Idea {idea_id} NOT found in history.")
        return {"status": "error", "message": "Idea not found"}

idea_service = IdeaService()
