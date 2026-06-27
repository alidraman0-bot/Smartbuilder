"""
PRD Service — Enterprise-Grade 25-Section Product Requirements Pipeline.

Generates production-grade PRDs that behave like output from:
  - Senior Product Manager (user flows, stories, features)
  - Technical Architect (system design, API specs, database schema)
  - Startup CTO (engineering roadmap, deployment, scalability)
  - Systems Designer (permissions, error handling, analytics)

Model Routing:
  - Product sections     → qwen/qwen3-235b-a22b:free (best long-form)
  - Technical sections   → meta-llama/llama-3.3-70b-instruct:free (structured reasoning)
  - Architecture sections → meta-llama/llama-3.3-70b-instruct:free
  - Fallback             → mistralai/mistral-small-3.1-24b-instruct:free

Pipeline:
  1. Parse product idea + context
  2. Generate each of 25 sections independently (parallel batches)
  3. Validate JSON for each section
  4. Assemble final PRD document
  5. Calculate confidence score
  6. Cache result
"""

import logging
import asyncio
import uuid
import json
from typing import Dict, Any, Optional

from app.core.config import settings
from app.core.ai_client import get_ai_client
from app.utils.json_helper import safe_json_parse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Section Definitions — 25 enterprise-grade PRD sections
# ---------------------------------------------------------------------------
PRD_SECTIONS = [
    {
        "key": "product_overview",
        "title": "Product Overview",
        "task": "prd_generation",
        "prompt_template": """Generate the Product Overview for an enterprise-grade PRD.
Include: product_name, vision (5-year product vision), mission,
strategic_purpose (why this product must exist now), target_audience,
product_type (web/mobile/saas/ai), core_value_proposition.
Return JSON: {{"product_name":"","vision":"","mission":"","strategic_purpose":"","target_audience":"","product_type":"","core_value_proposition":""}}"""
    },
    {
        "key": "product_vision",
        "title": "Product Vision",
        "task": "prd_generation",
        "prompt_template": """Generate the Product Vision section.
Include: long_term_vision (3-5 year), product_principles (5 guiding principles),
success_definition, market_position_target, innovation_thesis.
Return JSON: {{"long_term_vision":"","product_principles":[""],"success_definition":"","market_position_target":"","innovation_thesis":""}}"""
    },
    {
        "key": "objectives",
        "title": "Objectives",
        "task": "prd_generation",
        "prompt_template": """Generate Product Objectives using OKR framework.
Include: business_goals (3-4 measurable goals with metrics),
technical_goals (3-4 engineering goals), user_goals (3-4 user outcome goals),
success_metrics (north star metric + supporting metrics), anti_goals (what we're NOT building).
Return JSON: {{"business_goals":[{{"goal":"","metric":"","target":"","timeline":""}}],"technical_goals":[{{"goal":"","metric":"","target":""}}],"user_goals":[{{"goal":"","metric":"","target":""}}],"north_star_metric":"","supporting_metrics":[""],"anti_goals":[""]}}"""
    },
    {
        "key": "user_personas",
        "title": "User Personas",
        "task": "prd_generation",
        "prompt_template": """Generate 3 detailed User Personas.
Each persona: name, role, demographics, pain_points (3+), goals (3+),
tech_savviness (High/Medium/Low), current_workflow, frustrations,
success_criteria, quote (representative user quote).
Return JSON: {{"personas":[{{"name":"","role":"","demographics":"","pain_points":[""],"goals":[""],"tech_savviness":"","current_workflow":"","frustrations":[""],"success_criteria":"","quote":""}}]}}"""
    },
    {
        "key": "user_stories",
        "title": "User Stories",
        "task": "prd_generation",
        "prompt_template": """Generate User Stories organized by flow type.
Include: primary_flows (5+ core user stories with acceptance criteria),
edge_cases (3+ with handling strategy), admin_flows (3+ admin stories).
Format each: "As a [user], I want [goal] so that [benefit]"
Return JSON: {{"primary_flows":[{{"story":"","acceptance_criteria":[""],"priority":"P0|P1|P2"}}],"edge_cases":[{{"story":"","handling":"","priority":""}}],"admin_flows":[{{"story":"","acceptance_criteria":[""]}}]}}"""
    },
    {
        "key": "user_flows",
        "title": "User Flows",
        "task": "prd_generation",
        "prompt_template": """Generate User Flow diagrams (as structured descriptions).
Include: onboarding_flow (step-by-step), core_workflow (primary user journey),
payment_flow (if applicable), error_recovery_flow.
Each flow has: flow_name, steps (ordered), decision_points, success_state, failure_state.
Return JSON: {{"flows":[{{"flow_name":"","description":"","steps":[""],"decision_points":[""],"success_state":"","failure_state":"","estimated_time":""}}]}}"""
    },
    {
        "key": "functional_requirements",
        "title": "Functional Requirements",
        "task": "prd_generation",
        "prompt_template": """Generate Functional Requirements.
Include 8+ requirements, each with: id, title, description,
priority (P0/P1/P2), acceptance_criteria, business_justification,
dependencies, estimated_effort.
Return JSON: {{"requirements":[{{"id":"FR-001","title":"","description":"","priority":"","acceptance_criteria":[""],"business_justification":"","dependencies":[""],"estimated_effort":""}}]}}"""
    },
    {
        "key": "non_functional_requirements",
        "title": "Non-Functional Requirements",
        "task": "technical_spec",
        "prompt_template": """Generate Non-Functional Requirements.
Include: performance (latency, throughput, concurrent users),
reliability (uptime SLA, MTTR, RTO/RPO), security (compliance, encryption),
scalability (horizontal/vertical scaling), accessibility (WCAG compliance),
maintainability, observability.
Return JSON: {{"performance":{{"latency_p99":"","throughput":"","concurrent_users":"","page_load_time":""}},"reliability":{{"uptime_sla":"","mttr":"","rto":"","rpo":""}},"security":[""],"scalability":"","accessibility":"","maintainability":"","observability":""}}"""
    },
    {
        "key": "feature_specifications",
        "title": "Feature Specifications",
        "task": "prd_generation",
        "prompt_template": """Generate detailed Feature Specifications for 5 core features.
Each feature: name, description, priority (P0/P1/P2), business_value,
technical_logic (how it works), user_flow (step-by-step),
api_interactions (endpoints used), edge_cases, validation_rules,
estimated_effort (in story points or weeks).
Return JSON: {{"features":[{{"name":"","description":"","priority":"","business_value":"","technical_logic":"","user_flow":[""],"api_interactions":[""],"edge_cases":[""],"validation_rules":[""],"estimated_effort":""}}]}}"""
    },
    {
        "key": "database_architecture",
        "title": "Database Architecture",
        "task": "database_design",
        "prompt_template": """Generate Database Architecture.
Include: tables (5+ with name, columns with name/type/constraints, indexes),
relationships (foreign key descriptions), scalability_strategy
(sharding, partitioning, replication), migration_strategy,
data_retention_policy.
Return JSON: {{"tables":[{{"name":"","columns":[{{"name":"","type":"","constraints":""}}],"indexes":[""]}}],"relationships":[""],"scalability_strategy":"","migration_strategy":"","data_retention_policy":""}}"""
    },
    {
        "key": "api_specifications",
        "title": "API Specifications",
        "task": "api_design",
        "prompt_template": """Generate API Specifications (RESTful).
Include 8+ endpoints with: method, path, description, request_body,
response (schema), auth (required/optional/admin), rate_limit,
error_codes.
Return JSON: {{"base_url":"/api/v1","authentication":"Bearer JWT","endpoints":[{{"method":"GET|POST|PUT|DELETE","path":"","description":"","request_body":"","response":"","auth":"","rate_limit":"","error_codes":[""]}}],"versioning_strategy":"","pagination_strategy":""}}"""
    },
    {
        "key": "authentication_flow",
        "title": "Authentication Flow",
        "task": "security_design",
        "prompt_template": """Generate Authentication & Authorization Flow.
Include: auth_strategy (OAuth2/JWT/Session), providers (email, Google, GitHub),
token_management (access/refresh token strategy), mfa_support,
session_management, password_policy, rate_limiting_on_auth.
Return JSON: {{"auth_strategy":"","providers":[""],"token_management":{{"access_token_ttl":"","refresh_token_ttl":"","rotation_strategy":""}},"mfa_support":"","session_management":"","password_policy":"","auth_rate_limiting":""}}"""
    },
    {
        "key": "permissions_model",
        "title": "Permissions Model",
        "task": "security_design",
        "prompt_template": """Generate Permissions & Access Control Model.
Include: rbac_model (roles with permissions), resource_level_permissions,
row_level_security, api_key_management, tenant_isolation_strategy,
audit_trail_requirements.
Return JSON: {{"rbac_roles":[{{"role":"","permissions":[""],"description":""}}],"resource_permissions":"","row_level_security":"","api_key_management":"","tenant_isolation":"","audit_trail":""}}"""
    },
    {
        "key": "integrations",
        "title": "Integrations",
        "task": "prd_generation",
        "prompt_template": """Generate Integration Requirements.
Include: third_party_integrations (5+ with name, purpose, api_type, priority),
webhook_system, oauth_connections, data_sync_strategy,
integration_monitoring.
Return JSON: {{"integrations":[{{"name":"","purpose":"","api_type":"REST|GraphQL|Webhook","priority":"P0|P1|P2","data_exchanged":""}}],"webhook_system":"","oauth_connections":[""],"data_sync_strategy":"","monitoring":""}}"""
    },
    {
        "key": "system_architecture",
        "title": "System Architecture",
        "task": "architecture_design",
        "prompt_template": """Generate High-Level System Architecture.
Include: architecture_pattern (monolith/microservices/serverless/hybrid),
component_diagram (major components and their interactions),
data_flow (how data moves through the system),
technology_decisions (with rationale), communication_patterns
(sync/async, event-driven), caching_strategy.
Return JSON: {{"architecture_pattern":"","components":[{{"name":"","responsibility":"","technology":"","dependencies":[""]}}],"data_flow":"","technology_decisions":[{{"decision":"","rationale":"","alternatives_considered":[""]}}],"communication_patterns":"","caching_strategy":""}}"""
    },
    {
        "key": "frontend_architecture",
        "title": "Frontend Architecture",
        "task": "architecture_design",
        "prompt_template": """Generate Frontend Architecture.
Include: framework (with version), key_libraries, state_management,
rendering_strategy (SSR/CSR/ISR), component_structure,
design_system, performance_optimizations, testing_strategy.
Return JSON: {{"framework":"","key_libraries":[""],"state_management":"","rendering_strategy":"","component_structure":"","design_system":"","performance_optimizations":[""],"testing_strategy":"","accessibility":""}}"""
    },
    {
        "key": "backend_architecture",
        "title": "Backend Architecture",
        "task": "architecture_design",
        "prompt_template": """Generate Backend Architecture.
Include: framework, language, key_services (list),
api_pattern (REST/GraphQL/gRPC), database_strategy,
queue_system (for async processing), background_jobs,
logging_strategy, error_handling_pattern.
Return JSON: {{"framework":"","language":"","key_services":[""],"api_pattern":"","database_strategy":"","queue_system":"","background_jobs":"","logging_strategy":"","error_handling_pattern":"","health_checks":""}}"""
    },
    {
        "key": "security_requirements",
        "title": "Security Requirements",
        "task": "security_design",
        "prompt_template": """Generate Security Requirements.
Include: authentication (strategy), authorization (RBAC/ABAC),
encryption (at rest + in transit), input_validation,
abuse_prevention (rate limiting, injection prevention),
compliance (SOC2/GDPR/HIPAA as applicable),
security_testing, incident_response.
Return JSON: {{"authentication":"","authorization":"","encryption":{{"at_rest":"","in_transit":""}},"input_validation":[""],"abuse_prevention":[""],"compliance":[""],"security_testing":"","incident_response":"","data_privacy":""}}"""
    },
    {
        "key": "scalability_plan",
        "title": "Scalability Plan",
        "task": "architecture_design",
        "prompt_template": """Generate Scalability Plan.
Include: horizontal_scaling, vertical_scaling, caching_strategy,
cdn_strategy, database_scaling (read replicas, sharding),
queue_system, edge_architecture, load_testing_strategy,
scaling_triggers (auto-scaling rules).
Return JSON: {{"horizontal_scaling":"","vertical_scaling":"","caching_strategy":"","cdn_strategy":"","database_scaling":"","queue_system":"","edge_architecture":"","load_testing":"","auto_scaling_rules":[""]}}"""
    },
    {
        "key": "performance_requirements",
        "title": "Performance Requirements",
        "task": "technical_spec",
        "prompt_template": """Generate Performance Requirements.
Include: latency_targets (p50, p95, p99), throughput_targets,
concurrent_user_targets, page_load_targets, api_response_targets,
database_query_targets, performance_budget, monitoring_strategy.
Return JSON: {{"latency":{{"p50":"","p95":"","p99":""}},"throughput":"","concurrent_users":"","page_load":{{"first_contentful_paint":"","time_to_interactive":"","largest_contentful_paint":""}},"api_response":"","database_queries":"","performance_budget":"","monitoring":""}}"""
    },
    {
        "key": "error_handling",
        "title": "Error Handling",
        "task": "technical_spec",
        "prompt_template": """Generate Error Handling Strategy.
Include: error_classification (categories), error_response_format,
retry_strategy (exponential backoff), circuit_breaker_pattern,
graceful_degradation, user_facing_error_messages,
error_logging, alerting_thresholds.
Return JSON: {{"error_classification":[{{"category":"","http_codes":"","handling":""}}],"response_format":{{"structure":"","example":""}},"retry_strategy":"","circuit_breaker":"","graceful_degradation":"","user_messages":"","logging":"","alerting_thresholds":[""]}}"""
    },
    {
        "key": "analytics_requirements",
        "title": "Analytics Requirements",
        "task": "prd_generation",
        "prompt_template": """Generate Analytics & Telemetry Requirements.
Include: product_analytics (events to track), business_metrics,
technical_metrics, dashboards (key dashboards to build),
experimentation_framework (A/B testing), data_pipeline,
privacy_compliance (GDPR/CCPA for analytics).
Return JSON: {{"product_events":[{{"event":"","properties":[""],"trigger":""}}],"business_metrics":[""],"technical_metrics":[""],"dashboards":[{{"name":"","metrics":[""],"audience":""}}],"experimentation":"","data_pipeline":"","privacy_compliance":""}}"""
    },
    {
        "key": "deployment_architecture",
        "title": "Deployment Architecture",
        "task": "architecture_design",
        "prompt_template": """Generate Deployment Architecture.
Include: ci_cd_pipeline (stages), hosting_strategy,
containerization (Docker/K8s), environment_strategy
(dev/staging/production), infrastructure_as_code,
monitoring_stack, disaster_recovery, rollback_strategy.
Return JSON: {{"ci_cd":{{"stages":[""],"tools":[""],"triggers":""}},"hosting":"","containerization":"","environments":[{{"name":"","purpose":"","config":""}}],"iac":"","monitoring_stack":"","disaster_recovery":"","rollback_strategy":"","blue_green_deployment":""}}"""
    },
    {
        "key": "technical_risks",
        "title": "Technical Risks",
        "task": "risk_analysis",
        "prompt_template": """Generate Technical Risk Assessment.
Include 5+ risks with: risk_id, title, description, probability,
impact, category (infrastructure/security/performance/scalability/integration),
mitigation_strategy, contingency_plan, owner.
Return JSON: {{"risks":[{{"risk_id":"TR-001","title":"","description":"","probability":"high|medium|low","impact":"high|medium|low","category":"","mitigation":"","contingency":"","owner":""}}],"overall_technical_risk":"","risk_mitigation_budget":""}}"""
    },
    {
        "key": "engineering_roadmap",
        "title": "Engineering Roadmap",
        "task": "prd_generation",
        "prompt_template": """Generate Engineering Roadmap.
Include: phase_1_mvp (weeks 1-4, features and milestones),
phase_2_beta (weeks 5-8), phase_3_launch (weeks 9-12),
phase_4_growth (months 4-6), team_requirements (by phase),
technology_debt_strategy, testing_strategy.
Return JSON: {{"phases":[{{"name":"","duration":"","features":[""],"milestones":[""],"team_size":"","key_deliverables":[""]}}],"team_requirements":[{{"role":"","when":"","count":""}}],"tech_debt_strategy":"","testing_strategy":{{"unit_tests":"","integration_tests":"","e2e_tests":"","performance_tests":""}},"definition_of_done":[""]}}"""
    },
]


class PRDService:
    """
    Enterprise-Grade 25-Section PRD Intelligence Engine.

    Generates production-grade Product Requirement Documents through a
    section-by-section pipeline with task-aware model routing:
      - Product sections → qwen/qwen3-235b-a22b:free
      - Technical sections → meta-llama/llama-3.3-70b-instruct:free
      - Security sections → meta-llama/llama-3.3-70b-instruct:free
    """

    def __init__(self):
        self.client = get_ai_client()
        self.prd_store: Dict[str, Dict[str, Any]] = {}

    async def _generate_section(
        self,
        section_def: Dict[str, Any],
        idea: Dict[str, Any],
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate a single PRD section using routed AI completion."""
        section_key = section_def["key"]
        task = section_def["task"]

        prompt = f"""{section_def['prompt_template']}

Product Idea: {json.dumps(idea, default=str)}
Context: {json.dumps(context, default=str)}

RULES:
- Be deeply technical and specific
- Every feature must have business justification
- Use real-world technology choices with rationale
- No filler, no placeholders, no generic content
- Output must feel like a senior PM at a top tech company wrote it
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

            if isinstance(parsed, dict) and "error" in parsed and len(parsed) <= 2:
                logger.warning(f"PRD section {section_key} returned error JSON")
                return {}

            return parsed
        except Exception as e:
            logger.error(f"PRD section '{section_key}' generation failed: {e}")
            return {}

    async def generate_prd(
        self,
        idea: Dict[str, Any],
        business_plan: Optional[Dict[str, Any]] = None,
        run_id: Optional[str] = None,
        product_name: str = "",
        platform: str = "web",
        complexity: str = "medium",
        mode: str = "production",
    ) -> Dict[str, Any]:
        """
        Generate a full 25-section enterprise-grade PRD.

        Uses parallel batch generation with task-aware model routing.
        Product/UX sections route to Qwen 235B, technical/architecture
        sections route to Llama 3.3 70B.
        """
        if not run_id:
            run_id = f"PRD-{uuid.uuid4().hex[:8]}"

        # Return cached result if available
        if run_id in self.prd_store:
            existing = self.prd_store[run_id]
            if existing.get("status") in ["COMPLETE", "RUNNING"]:
                return existing

        # Mark as running
        self.prd_store[run_id] = {"run_id": run_id, "status": "RUNNING"}

        # Build enriched context
        context = {
            "product_name": product_name or idea.get("title", idea.get("product_name", "")),
            "platform": platform,
            "complexity": complexity,
            "mode": mode,
            "business_plan_summary": {},
        }

        # Extract relevant business plan context (trimmed to avoid token limits)
        if business_plan and isinstance(business_plan, dict):
            bp_data = business_plan.get("business_plan", business_plan)
            for key in ["executive_summary", "solution", "market_opportunity",
                         "revenue_model", "customer_segmentation", "competitive_analysis"]:
                if key in bp_data:
                    context["business_plan_summary"][key] = bp_data[key]

        # Determine sections based on complexity
        if complexity == "simple":
            section_keys = [
                "product_overview", "objectives", "user_personas",
                "user_stories", "feature_specifications", "api_specifications",
                "database_architecture", "engineering_roadmap",
            ]
        elif complexity == "medium":
            section_keys = [
                "product_overview", "product_vision", "objectives",
                "user_personas", "user_stories", "user_flows",
                "functional_requirements", "feature_specifications",
                "database_architecture", "api_specifications",
                "system_architecture", "security_requirements",
                "deployment_architecture", "engineering_roadmap",
            ]
        else:  # enterprise (full 25 sections)
            section_keys = [s["key"] for s in PRD_SECTIONS]

        # Filter sections
        sections_to_generate = [
            s for s in PRD_SECTIONS if s["key"] in section_keys
        ]

        # Generate all sections in parallel, letting ai_limiter handle concurrency
        aggregated_prd: Dict[str, Any] = {}

        tasks = [
            self._generate_section(section_def, idea, context)
            for section_def in sections_to_generate
        ]

        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for section_def, result in zip(sections_to_generate, results):
                if isinstance(result, Exception):
                    logger.error(f"PRD section {section_def['key']} raised: {result}")
                    aggregated_prd[section_def["key"]] = {}
                elif isinstance(result, dict) and result:
                    aggregated_prd[section_def["key"]] = result
                else:
                    aggregated_prd[section_def["key"]] = {}
        except Exception as e:
            logger.error(f"PRD generation failed: {e}")
            for section_def in sections_to_generate:
                aggregated_prd[section_def["key"]] = {}

        # Calculate confidence score
        filled_sections = sum(
            1 for v in aggregated_prd.values()
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
            "complexity": complexity,
            "mode": mode,
            "platform": platform,
            "total_sections": total_sections,
            "completed_sections": filled_sections,
            "confidence_score": confidence,
            "section_order": section_order,
            "prd": aggregated_prd,
        }

        self.prd_store[run_id] = result
        return result

    def get_prd(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve stored PRD by run_id."""
        return self.prd_store.get(run_id)


# Module-level singleton
prd_service = PRDService()
