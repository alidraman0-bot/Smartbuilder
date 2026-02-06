import uuid
import json
import logging
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.core.config import settings
from app.services.signal_service import signal_service
from app.core.ai_client import get_ai_client
from app.services.memory_service import memory_service
import asyncio

logger = logging.getLogger(__name__)

class IdeaService:
    def __init__(self):
        self.client = get_ai_client()
        self.history: Dict[str, List[Dict[str, Any]]] = {}
        self.instance_id = str(uuid.uuid4())
        logger.info(f"IdeaService initialized with instance_id: {self.instance_id}")

    async def generate_ideas(self, mode: str = "discover", user_input: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Synthesize startup ideas based on live signals and mode.
        """
        run_id = str(uuid.uuid4())
        
        # --- Pre-flight: Ensure Base Project Exists (Required for FKs) ---
        project_id = "00000000-0000-0000-0000-000000000000"
        try:
            from app.core.supabase import get_service_client
            svc_client = get_service_client()
            
            proj_res = svc_client.table("projects").select("project_id").limit(1).execute()
            if not proj_res.data:
                logger.info("Initializing system with Default Genesis project.")
                # We use a static UUID for the default project to keep things predictable
                default_id = str(uuid.uuid4())
                new_proj = svc_client.table("projects").insert({
                    "project_id": default_id,
                    "name": "Default Genesis",
                    "framework": "Next.js",
                    "status": "active"
                }).execute()
                project_id = str(new_proj.data[0]["project_id"])
            else:
                project_id = str(proj_res.data[0]["project_id"])
        except Exception as pe:
             logger.warning(f"Could not ensure project existence: {pe}")

        try:
            # Fetch signals (Real or Mock)
            try:
                # Force refresh ~6% of the time (1/16) to keep signals fresh but fast
                should_refresh = (uuid.uuid4().hex[0] == "0") 
                live_signals = await signal_service.fetch_signals(force_refresh=should_refresh)
            except Exception as e:
                logger.error(f"Signal fetching failed: {e}")
                live_signals = []
            
            # Format signals for the prompt
            signals_text = json.dumps(live_signals, indent=2)

            # INJECT RANDOMNESS: Pick a "Creative Angle" to force diversity
            import random
            creative_angles = [
                "Focus heavily on unsexy, boring B2B niches with high cash flow.",
                "Prioritize consumer social apps with high viral potential.",
                "Look for 'unbundling' opportunities of major platforms (e.g. unbundling LinkedIn, Reddit).",
                "Focus on 'peace technology' and mental wellness tools.",
                "Target deep-tech, R&D heavy solutions for enterprise."
                "Focus on blue-collar workforce enablement.",
                "Look for opportunities in the silver economy (aging population).",
                "Prioritize privacy-first, local-only software architecture."
            ]
            selected_angle = random.choice(creative_angles)
            logger.info(f"Generating ideas with angle: {selected_angle}")

            system_prompt = f"""
You are Smartbuilder’s OpenAI-powered Intelligence Engine.

Your role is to perform:
- Market reasoning
- Signal synthesis
- Opportunity analysis
- Founder education

You do NOT fetch data.
You do NOT call external APIs.
You do NOT know or access API keys.

All external data has already been collected securely by the system
using authorized API keys and normalized before being passed to you.

Your sole responsibility is to THINK.

You must analyze the provided market signals and transform them into
high-quality, defensible startup ideas.

CREATIVE LENS:
{selected_angle}

You should reason like:
- A startup investor
- A product strategist
- A market researcher

---

OPENAI CORE RESPONSIBILITIES

As the OpenAI intelligence layer, you must:
1. Synthesize multiple market signals into coherent insights
2. Detect repeated patterns (not isolated events)
3. Distinguish real demand from noise
4. Explain WHY an opportunity exists
5. Educate founders through structured reasoning
6. Maintain logical consistency across all sections

You must NOT:
- Hallucinate facts
- Reference APIs, scraping, or keys
- Include marketing language
- Include calls to action
- Mention how data was collected

---

INPUT CONTEXT

The following market signals were collected securely by the system.
You are receiving only the final structured signals.

Market Signals Object:
{{MARKET_SIGNALS_OBJECT}}

---

TASK

Using only the provided market signals, generate 4–6 high-quality startup ideas.

Each idea must:
- Be grounded in observable demand or repeated pain
- Be realistic to validate with a 30-day MVP
- Avoid generic or overused concepts
- STRICTLY ADHERE to the 'Creative Lens' specified above.

---

OUTPUT STRUCTURE (STRICT JSON)

Return a JSON OBJECT with a key "ideas" containing an array of objects.
Each object MUST have these exact fields to map to the UI:

{{
  "title": "1. Idea Title (Concise name)",
  "thesis": "2. One-sentence thesis (Concise explanation of the opportunity)",
  "market_size": "3. Market Size Indicator (e.g., 'Large', '$10B+ TAM')",
  "problem_bullets": ["4. 2-3 short bullet points explaining: what is broken, who is affected, how often it happens"],
  "target_customer": {{
    "primary_user": "5. Primary user",
    "company_size": "6. Company size",
    "industry_or_role": "7. Industry or role"
  }},
  "monetization": {{
    "pricing_structure": "8. Pricing structure",
    "who_pays": "9. Who pays",
    "value_prop": "10. Why they are willing to pay"
  }},
  "why_now_bullets": ["11. 3 bullet points: Market shift, Technology inflection, Behavior change"],
  "alternatives_structured": {{
    "today": ["12. What people use today"],
    "gaps": ["13. Why those solutions are insufficient"]
  }},
  "mvp_scope_bullets": ["14. 5-7 core feature items"],
  "confidence_reasoning_bullets": ["15. Why Smartbuilder thinks this is strong (Repetition, Signal, Clarity, Feasibility)"],
  "risks_structured": {{
    "adoption": "16. Adoption risk",
    "technical": "17. Technical unknowns",
    "market": "18. Market uncertainty"
  }},
  "confidence_score": 0-100 (integer),
  "market_score": 0-100 (integer),
  "execution_complexity": 0-10 (integer)
}}

---

OUTPUT QUALITY RULES

- Analytical, not promotional
- Clear and structured
- Founder-educational
- No emojis
- No CTAs
- No API or key references
- No filler content

Your goal is to produce ideas that feel:
“Evidence-based, thoughtful, and worth building.”
""".replace("{{MARKET_SIGNALS_OBJECT}}", signals_text)

            # Optimization: For Gemini, use a focused, minimal system prompt
            if settings.AI_PROVIDER == "gemini" or settings.AI_PROVIDER == "google":
                system_prompt = f"""
You are a specialized JSON-only Startup Analyst.
Your task is to analyze market signals and return a valid JSON object containing 5 startup ideas.

Market Signals Data:
{signals_text}

OUTPUT FORMAT:
You must return a single valid JSON object.
Do NOT include any markdown formatting (like ```json ... ```).
Do NOT include any conversational text intro or outro.
Just the raw JSON string.

JSON STRUCTURE:
{{
  "ideas": [
    {{
      "title": "Short Name",
      "thesis": "One line explanation",
      "confidence_score": 85,
      "market_size": "$XM TAM",
      "problem_bullets": ["A", "B"],
      "target_customer": {{ "primary_user": "X", "company_size": "Y", "industry_or_role": "Z" }},
      "monetization": {{ "pricing_structure": "A", "who_pays": "B", "value_prop": "C" }},
      "why_now_bullets": ["T1", "T2", "T3"],
      "alternatives_structured": {{ "today": ["S1"], "gaps": ["G1"] }},
      "mvp_scope_bullets": ["F1", "F2"],
      "confidence_reasoning_bullets": ["R1"],
      "risks_structured": {{ "adoption": "low", "technical": "med", "market": "high" }},
      "market_score": 80,
      "execution_complexity": 5
    }}
  ]
}}

TASK CONSTRAINT (CREATIVE LENS):
{selected_angle}
Apply this lens strictly to all generated ideas.

STRICT RULES:
1. Return ONLY the JSON definition.
2. NO markdown code blocks.
3. NO "Here is the JSON" text.
4. If you include code blocks, the parser will fail.
REMINDER: JSON ONLY. NO TEXT.
"""


            if mode == "validate_idea":
                user_prompt = f"""
A founder has proposed the following idea:

[USER_INPUT]
{user_input}
[/USER_INPUT]

Using the market signals provided in the system prompt, validate, refine, or reposition this idea.
If the idea is weak, pivot it towards the strongest relevant signal.
Generate up to 5 refined variations or pivots.

Respond with valid JSON only.
"""
            else:
                user_prompt = "Generate 5 high-potential startup ideas based on the market signals provided. Respond with valid JSON only."

            # If no AI keys configured, use high-signal mock generator
            if not settings.has_ai_key:
                logger.info("No AI API keys configured, using high-signal mock generator.")
                fallback_ideas = self._get_mock_ideas(mode, user_input)
                self.history[run_id] = fallback_ideas
                return fallback_ideas

            try:
                response = await self.client.chat_completion(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.9
                )
                
                content = response["content"]
                
                # Robust JSON Extraction
                try:
                    # Generic cleanup
                    content = content.strip()
                    # Remove markdown blocks if present
                    if content.startswith("```"):
                        content = content.split("```", 1)[1]
                        if content.startswith("json"):
                             content = content[4:]
                        if content.endswith("```"):
                            content = content[:-3]
                    
                    # Find outer braces if there is extra text
                    start_idx = content.find("{")
                    end_idx = content.rfind("}")
                    if start_idx != -1 and end_idx != -1:
                        content = content[start_idx : end_idx + 1]
                    
                    data = json.loads(content)
                except Exception as je:
                    logger.error(f"Failed to parse AI response as JSON: {je}. Raw: {content[:200]}")
                    raise Exception("AI returned malformed JSON")
                
                # Handle potential wrapper keys defensively
                ideas_raw = []
                if isinstance(data, dict):
                    if "ideas" in data and isinstance(data["ideas"], list):
                        ideas_raw = data["ideas"]
                    else:
                        # Maybe the whole dict is one idea?
                        ideas_raw = [data]
                elif isinstance(data, list):
                    ideas_raw = data
                else:
                    logger.warning(f"Unexpected AI response format (not list or dict): {type(data)}")
                    ideas_raw = []

                validated_ideas = []
                logger.info(f"Processing {len(ideas_raw)} raw ideas from AI")
                for item in ideas_raw:
                    # Defensive check: ensure item is a dict
                    if not isinstance(item, dict):
                        logger.warning(f"Skipping non-dict idea item: {item}")
                        continue

                    # Quality Gates - Be more resilient
                    conf = item.get("confidence_score")
                    if conf is None:
                        conf = 85 # Default to high confidence if AI forgets it
                    
                    try:
                        conf = float(conf)
                    except (ValueError, TypeError):
                        conf = 85

                    if conf < 60: 
                        logger.warning(f"Idea '{item.get('title')}' rejected: confidence_score {conf} < 60")
                        continue

                    # Ensure UUIDs and defaults to prevent FE crashes
                    item["idea_id"] = item.get("idea_id", str(uuid.uuid4()))
                    item["title"] = item.get("title", "Untitled Opportunity")
                    item["confidence_score"] = int(conf)
                    
                    # Ensure base structure for new fields to prevent FE crashes
                    item["thesis"] = item.get("thesis", "No thesis provided.")
                    item["market_size"] = item.get("market_size", "Unknown")
                    item["problem_bullets"] = item.get("problem_bullets", [])
                    item["target_customer"] = item.get("target_customer", {})
                    item["monetization"] = item.get("monetization", {})
                    item["why_now_bullets"] = item.get("why_now_bullets", [])
                    item["alternatives_structured"] = item.get("alternatives_structured", {})
                    item["mvp_scope_bullets"] = item.get("mvp_scope_bullets", [])
                    item["confidence_reasoning_bullets"] = item.get("confidence_reasoning_bullets", [])
                    item["risks_structured"] = item.get("risks_structured", {})
                    validated_ideas.append(item)
                
                try:
                    # Persist ideas to Memory System
                    persisted_ideas = []
                    for idea in validated_ideas[:5]:
                        try:
                            # Use an internal try to ensure one bad save doesn't stop the loop
                            saved = await asyncio.wait_for(
                                memory_service.save_idea(project_id, idea),
                                timeout=5.0
                            )
                            persisted_ideas.append(saved)
                        except asyncio.TimeoutError:
                            logger.warning("Save idea timed out, returning raw idea.")
                            if "idea_id" not in idea: idea["idea_id"] = str(uuid.uuid4())
                            persisted_ideas.append(idea)
                        except Exception as inner_e:
                            logger.warning(f"Failed to persist individual idea: {inner_e}")
                            # Still include the idea in response even if persistence fails
                            if "idea_id" not in idea: idea["idea_id"] = str(uuid.uuid4())
                            persisted_ideas.append(idea)
                    
                    self.history[run_id] = persisted_ideas
                    return persisted_ideas

                except Exception as persistence_e:
                    logger.error(f"Persistence layer failed: {persistence_e}")
                    # Ensure ideas have IDs if they failed to save
                    for idea in validated_ideas:
                         if "idea_id" not in idea: idea["idea_id"] = str(uuid.uuid4())
                
                self.history[run_id] = validated_ideas
                return validated_ideas

            except Exception as e:
                logger.error(f"AI Generation failed: {e}")
                # Fallback to mocks
                fallback_ideas = self._get_mock_ideas(mode, user_input)
                
                # Attempt to persist mocks too, so the FE has something in history
                try:
                    for idea in fallback_ideas[:5]:
                        await memory_service.save_idea(project_id, idea)
                except: pass
                
                self.history[run_id] = fallback_ideas
                return fallback_ideas

        except Exception as e:
            logger.error(f"Global generation error: {e}", exc_info=True)
            try:
                fallback_ideas = self._get_mock_ideas(mode, user_input)
                self.history[run_id] = fallback_ideas
                return fallback_ideas
            except Exception as nested_e:
                logger.critical(f"Critical failure in mock generator: {nested_e}")
                return []

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
