import logging
import asyncio
import uuid
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.ai_client import get_ai_client

logger = logging.getLogger(__name__)

class PRDService:
    """
    PRD (Product Requirements Document) Intelligence Layer Service
    
    Converts approved business plans into machine-readable execution contracts
    with strict feature constraints and pre-code blueprints.
    """
    
    def __init__(self):
        self.client = get_ai_client()
        self.prd_store: Dict[str, Dict[str, Any]] = {}

    async def generate_prd(
        self, 
        idea: Dict[str, Any], 
        business_plan: Dict[str, Any],
        run_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive PRD with execution-ready specifications.
        
        Returns structured data matching the PRDData TypeScript interface.
        """
        if not run_id:
            run_id = f"PRD-{uuid.uuid4().hex[:8]}"

        # Idempotency check: Return existing PRD if already generated
        if run_id in self.prd_store:
            existing = self.prd_store[run_id]
            if existing.get("status") in ["COMPLETE", "RUNNING"]:
                logger.info(f"Returning existing PRD for run_id: {run_id}")
                return existing

        # System prompt for PRD generation
        system_prompt = """
You are Smartbuilder's PRD (Product Requirements Document) Intelligence Engine.

You convert business strategy into executable specifications with:
• Single, immutable product objective
• Operational personas (not marketing personas)
• Demand-to-feature mapping (every feature links to revenue)
• MVP feature set with execution contract
• Explicit non-goals (enforced constraints)
• Pre-code user flows
• Technical assumptions for stack selection
• Behavioral success metrics

You think like:
• A senior product manager at a top tech company
• An engineering lead planning sprints
• A technical founder building their first MVP

────────────────────────────────

INPUTS PROVIDED:

Startup Idea:
{{IDEA_OBJECT}}

Business Plan:
{{BUSINESS_PLAN}}

────────────────────────────────

YOUR TASK:

Generate a comprehensive PRD in JSON format with the following structure:

{
  "product_objective": {
    "statement": "Single paragraph that defines the product's core purpose",
    "immutable": true,
    "ripple_effect_warning": "Any change to this objective requires full plan re-evaluation"
  },
  "target_users": [
    {
      "persona_name": "Operational persona name",
      "trigger_moment": "What causes them to seek this solution",
      "job_to_be_done": "What they're trying to accomplish",
      "failure_consequence": "What happens if they fail",
      "usage_frequency": "Daily | Weekly | Monthly"
    }
  ],
  "core_use_cases": [
    {
      "use_case_id": "UC-001",
      "title": "Use case title",
      "problem_id": "Links back to problem statement",
      "market_signal": "Evidence this use case matters",
      "revenue_implication": "How this drives revenue",
      "user_story": "As a [user], I want [action] so that [benefit]",
      "acceptance_criteria": ["Specific, testable criteria"]
    }
  ],
  "mvp_feature_set": {
    "features": [
      {
        "feature_id": "F-001",
        "name": "Feature name",
        "description": "What it does",
        "priority": "P0 | P1 | P2",
        "build_complexity": "Low | Medium | High",
        "dependencies": ["F-002"],
        "kill_criteria": "When to remove this feature",
        "links_to_use_case": "UC-001",
        "links_to_revenue": "How this feature drives monetization"
      }
    ],
    "feature_limit_enforced": true,
    "max_features": 12
  },
  "explicit_non_goals": {
    "excluded_features": [
      {
        "feature": "Feature name",
        "reason": "Why it's excluded",
        "earliest_consideration": "When to reconsider (e.g., After Series A)"
      }
    ],
    "enforcement_rule": "Any attempt to add features must override this document"
  },
  "user_flows": [
    {
      "flow_id": "UF-001",
      "name": "Flow name",
      "trigger": "What starts this flow",
      "steps": [
        {
          "step_number": 1,
          "action": "User action",
          "system_response": "What the system does",
          "ui_requirements": "Visual/UX requirements",
          "api_requirements": "Backend requirements"
        }
      ],
      "success_state": "What success looks like",
      "failure_states": ["Possible failure points"]
    }
  ],
  "technical_assumptions": {
    "stack_recommendations": {
      "frontend": "Recommended framework",
      "backend": "Recommended framework",
      "database": "Recommended database",
      "hosting": "Recommended platform",
      "rationale": "Why these choices"
    },
    "integration_requirements": ["External services needed"],
    "performance_targets": {
      "page_load_time_ms": 0,
      "api_response_time_ms": 0,
      "concurrent_users": 0
    },
    "trade_offs": [
      {
        "choice": "Technical decision",
        "benefit": "What we gain",
        "cost": "What we lose"
      }
    ]
  },
  "success_metrics": {
    "primary_metric": {
      "name": "Main metric to track",
      "definition": "How to measure it",
      "target": "Success threshold",
      "measurement_frequency": "How often to measure"
    },
    "secondary_metrics": [
      {
        "name": "Metric name",
        "definition": "How to measure",
        "behavior_tracked": "What user behavior this indicates"
      }
    ],
    "kill_criteria": "When to stop building and pivot/abandon"
  },
  "readiness_status": {
    "research_sufficient": true,
    "scope_constrained": true,
    "risks_known": true,
    "ready_for_mvp_builder": true,
    "blockers": []
  },
  "metadata": {
    "generated_at": "ISO timestamp",
    "model_version": "gpt-4",
    "based_on_business_plan_run_id": "BP-xxx"
  }
}

────────────────────────────────

CRITICAL RULES:

1. Product objective must be a single, clear paragraph
2. Every feature must link to a use case and revenue driver
3. MVP should have 5-12 features maximum
4. Non-goals are as important as goals
5. User flows must be detailed enough to convert to code
6. Success metrics must be behavioral and actionable
7. Output ONLY valid JSON, no markdown formatting
8. Be specific, constrained, and execution-ready
9. Think "what can ship in 2 weeks" not "what's the vision"
10. JSON ONLY. No Markdown. No ```json blocks.
"""

        # Inject data
        system_prompt = system_prompt.replace("{{IDEA_OBJECT}}", json.dumps(idea, indent=2))
        system_prompt = system_prompt.replace("{{BUSINESS_PLAN}}", json.dumps(business_plan, indent=2))

        # Generate PRD
        if not settings.OPENAI_API_KEY:
            prd_data = self._get_mock_prd(idea, business_plan)
        else:
            try:
                response = await self.client.chat_completion(
                    messages=[{"role": "user", "content": "Generate the comprehensive PRD in JSON format based on the provided idea and business plan."}],
                    system_prompt=system_prompt,
                    model="gpt-4o-mini",
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
                prd_data = json.loads(response["content"])
            except Exception as e:
                logger.error(f"PRD generation failed: {e}")
                prd_data = self._get_mock_prd(idea, business_plan)

        # Store and return
        result = {
            "run_id": run_id,
            "idea_id": idea.get("idea_id"),
            "status": "COMPLETE",
            "prd": prd_data
        }
        
        self.prd_store[run_id] = result
        return result

    def _get_mock_prd(self, idea: Dict[str, Any], business_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock PRD for development/testing."""
        idea_title = idea.get('title', 'AI Automation Platform')
        target_user = idea.get('target_user', 'Business professionals')
        
        return {
            "product_objective": {
                "statement": f"{idea_title} is an AI-native automation platform that enables {target_user} to eliminate manual data workflows through intelligent automation. The product wins by providing end-to-end workflow automation instead of point solutions, prioritizing speed to value over feature breadth. Success is measured by time saved per user per week.",
                "immutable": True,
                "ripple_effect_warning": "Changing this objective invalidates the business plan, feature set, and technical architecture"
            },
            "target_users": [
                {
                    "persona_name": "Operations Manager",
                    "trigger_moment": "Facing quarterly deadline with manual data reconciliation backlog",
                    "job_to_be_done": "Consolidate data from multiple sources without manual intervention",
                    "failure_consequence": "Missed deadlines, inaccurate reports, team burnout",
                    "usage_frequency": "Daily"
                },
                {
                    "persona_name": "Small Business Owner",
                    "trigger_moment": "Spending evenings on administrative tasks instead of growing business",
                    "job_to_be_done": "Automate routine business operations",
                    "failure_consequence": "Opportunity cost, slower growth, competitive disadvantage",
                    "usage_frequency": "Weekly"
                }
            ],
            "core_use_cases": [
                {
                    "use_case_id": "UC-001",
                    "title": "Automated Data Aggregation",
                    "problem_id": "Manual data collection from multiple sources",
                    "market_signal": "85% of users report this as primary pain point",
                    "revenue_implication": "Core value prop - justifies premium pricing",
                    "user_story": "As an Operations Manager, I want data automatically pulled from all my tools so that I can focus on analysis instead of collection",
                    "acceptance_criteria": [
                        "User can connect 3+ data sources",
                        "Data syncs automatically every hour",
                        "User receives notification on sync completion/failure",
                        "Data is normalized into unified format"
                    ]
                },
                {
                    "use_case_id": "UC-002",
                    "title": "Intelligent Workflow Automation",
                    "problem_id": "Repetitive manual tasks",
                    "market_signal": "Research shows 10hrs/week spent on automatable tasks",
                    "revenue_implication": "Key differentiation from competitors",
                    "user_story": "As a user, I want AI to suggest and implement workflow automations so that I save time without technical setup",
                    "acceptance_criteria": [
                        "System analyzes user patterns and suggests automations",
                        "User can approve/reject suggestions with one click",
                        "Automations run reliably without supervision",
                        "User can see time saved metrics"
                    ]
                },
                {
                    "use_case_id": "UC-003",
                    "title": "Real-time Reporting Dashboard",
                    "problem_id": "Outdated reports and delayed insights",
                    "market_signal": "Decision-makers need real-time visibility",
                    "revenue_implication": "Drives team plan upgrades",
                    "user_story": "As a manager, I want real-time dashboards so that I can make informed decisions quickly",
                    "acceptance_criteria": [
                        "Dashboard updates in real-time as data changes",
                        "User can customize metrics and visualizations",
                        "Dashboard is shareable with team members",
                        "Mobile-responsive design"
                    ]
                }
            ],
            "mvp_feature_set": {
                "features": [
                    {
                        "feature_id": "F-001",
                        "name": "Data Source Connectors",
                        "description": "Pre-built integrations for common business tools (Google Sheets, Airtable, Notion, etc.)",
                        "priority": "P0",
                        "build_complexity": "High",
                        "dependencies": [],
                        "kill_criteria": "If integration reliability is below 95%",
                        "links_to_use_case": "UC-001",
                        "links_to_revenue": "Enables core product value"
                    },
                    {
                        "feature_id": "F-002",
                        "name": "Automated Data Sync Engine",
                        "description": "Background service that pulls and normalizes data on schedule",
                        "priority": "P0",
                        "build_complexity": "High",
                        "dependencies": ["F-001"],
                        "kill_criteria": "If sync failures exceed 5%",
                        "links_to_use_case": "UC-001",
                        "links_to_revenue": "Core technical capability"
                    },
                    {
                        "feature_id": "F-003",
                        "name": "AI Automation Suggestions",
                        "description": "ML model that identifies automation opportunities from user behavior",
                        "priority": "P0",
                        "build_complexity": "High",
                        "dependencies": ["F-002"],
                        "kill_criteria": "If suggestion acceptance rate is below 20%",
                        "links_to_use_case": "UC-002",
                        "links_to_revenue": "Key differentiator"
                    },
                    {
                        "feature_id": "F-004",
                        "name": "One-Click Automation Deployment",
                        "description": "User can approve and deploy suggested automations without coding",
                        "priority": "P0",
                        "build_complexity": "Medium",
                        "dependencies": ["F-003"],
                        "kill_criteria": "If deployment success rate is below 90%",
                        "links_to_use_case": "UC-002",
                        "links_to_revenue": "Reduces onboarding friction"
                    },
                    {
                        "feature_id": "F-005",
                        "name": "Real-time Dashboard",
                        "description": "Customizable dashboard with real-time data visualization",
                        "priority": "P0",
                        "build_complexity": "Medium",
                        "dependencies": ["F-002"],
                        "kill_criteria": "If page load time exceeds 2 seconds",
                        "links_to_use_case": "UC-003",
                        "links_to_revenue": "Drives team plan upgrades"
                    },
                    {
                        "feature_id": "F-006",
                        "name": "Team Collaboration",
                        "description": "Share dashboards and automations with team members",
                        "priority": "P1",
                        "build_complexity": "Low",
                        "dependencies": ["F-005"],
                        "kill_criteria": "If less than 10% of users invite team members",
                        "links_to_use_case": "UC-003",
                        "links_to_revenue": "Enables team pricing tier"
                    },
                    {
                        "feature_id": "F-007",
                        "name": "Usage Analytics",
                        "description": "Show users time saved and productivity gains",
                        "priority": "P1",
                        "build_complexity": "Low",
                        "dependencies": ["F-002", "F-004"],
                        "kill_criteria": "If metrics don't correlate with retention",
                        "links_to_use_case": "UC-002",
                        "links_to_revenue": "Retention driver"
                    },
                    {
                        "feature_id": "F-008",
                        "name": "Mobile App (View-only)",
                        "description": "iOS/Android app for viewing dashboards on the go",
                        "priority": "P2",
                        "build_complexity": "Medium",
                        "dependencies": ["F-005"],
                        "kill_criteria": "If mobile usage is below 15%",
                        "links_to_use_case": "UC-003",
                        "links_to_revenue": "Nice-to-have for executives"
                    }
                ],
                "feature_limit_enforced": True,
                "max_features": 12
            },
            "explicit_non_goals": {
                "excluded_features": [
                    {
                        "feature": "Custom workflow builder (drag-and-drop interface)",
                        "reason": "Increases complexity and onboarding friction. AI suggestions serve this need better.",
                        "earliest_consideration": "After validating AI suggestion quality (6 months post-launch)"
                    },
                    {
                        "feature": "Advanced reporting (custom SQL queries)",
                        "reason": "Not needed for MVP. Pre-built dashboards cover 90% of use cases.",
                        "earliest_consideration": "When enterprise customers request it (Series A)"
                    },
                    {
                        "feature": "White-label / self-hosted deployment",
                        "reason": "Adds operational complexity and support burden.",
                        "earliest_consideration": "Post Product-Market Fit with dedicated enterprise team"
                    },
                    {
                        "feature": "AI chatbot interface",
                        "reason": "Not core to value prop. Automation suggestions are sufficient.",
                        "earliest_consideration": "If user research shows demand (12 months post-launch)"
                    }
                ],
                "enforcement_rule": "Adding excluded features requires business plan re-approval"
            },
            "user_flows": [
                {
                    "flow_id": "UF-001",
                    "name": "New User Onboarding",
                    "trigger": "User signs up for account",
                    "steps": [
                        {
                            "step_number": 1,
                            "action": "User enters email and creates password",
                            "system_response": "Creates account, sends verification email",
                            "ui_requirements": "Clean signup form with social auth options",
                            "api_requirements": "POST /auth/signup endpoint"
                        },
                        {
                            "step_number": 2,
                            "action": "User selects role and use case",
                            "system_response": "Personalizes onboarding flow",
                            "ui_requirements": "Visual role selector with icons",
                            "api_requirements": "PATCH /users/profile endpoint"
                        },
                        {
                            "step_number": 3,
                            "action": "User connects first data source",
                            "system_response": "OAuth flow, fetches initial data",
                            "ui_requirements": "Grid of popular integrations with search",
                            "api_requirements": "GET /integrations, POST /connections endpoint"
                        },
                        {
                            "step_number": 4,
                            "action": "User sees first automation suggestion",
                            "system_response": "AI analyzes connected data and suggests automation",
                            "ui_requirements": "Card with suggestion explanation and one-click approve",
                            "api_requirements": "GET /suggestions endpoint"
                        },
                        {
                            "step_number": 5,
                            "action": "User approves suggestion",
                            "system_response": "Deploys automation, shows success state",
                            "ui_requirements": "Success animation and dashboard redirect",
                            "api_requirements": "POST /automations/deploy endpoint"
                        }
                    ],
                    "success_state": "User has connected 1+ data sources and deployed 1+ automation",
                    "failure_states": [
                        "User abandons during OAuth flow",
                        "No automation suggestions available",
                        "Automation deployment fails"
                    ]
                },
                {
                    "flow_id": "UF-002",
                    "name": "Dashboard Viewing",
                    "trigger": "User wants to check current metrics",
                    "steps": [
                        {
                            "step_number": 1,
                            "action": "User navigates to dashboard",
                            "system_response": "Loads latest data and renders visualizations",
                            "ui_requirements": "Grid layout with customizable widgets",
                            "api_requirements": "GET /dashboard/data endpoint"
                        },
                        {
                            "step_number": 2,
                            "action": "User customizes metrics shown",
                            "system_response": "Updates dashboard configuration",
                            "ui_requirements": "Drag-and-drop widget arrangement",
                            "api_requirements": "PATCH /dashboard/config endpoint"
                        },
                        {
                            "step_number": 3,
                            "action": "User shares dashboard with team",
                            "system_response": "Creates shareable link or sends invites",
                            "ui_requirements": "Share modal with permissions controls",
                            "api_requirements": "POST /dashboard/share endpoint"
                        }
                    ],
                    "success_state": "User views up-to-date metrics and makes informed decision",
                    "failure_states": [
                        "Data is stale or missing",
                        "Page load time exceeds 3 seconds"
                    ]
                }
            ],
            "technical_assumptions": {
                "stack_recommendations": {
                    "frontend": "Next.js 14 with TypeScript and Tailwind CSS",
                    "backend": "FastAPI (Python) with async support",
                    "database": "PostgreSQL for relational data, Redis for caching",
                    "hosting": "Vercel (frontend), Railway/Fly.io (backend)",
                    "rationale": "Modern, scalable stack with excellent DX. FastAPI enables rapid iteration. Next.js provides SSR and edge capabilities."
                },
                "integration_requirements": [
                    "OAuth 2.0 for third-party integrations",
                    "Stripe for payments",
                    "OpenAI API for AI suggestions",
                    "Resend/SendGrid for transactional emails",
                    "Sentry for error tracking"
                ],
                "performance_targets": {
                    "page_load_time_ms": 1500,
                    "api_response_time_ms": 300,
                    "concurrent_users": 1000
                },
                "trade_offs": [
                    {
                        "choice": "Using serverless architecture",
                        "benefit": "Zero infrastructure management, auto-scaling",
                        "cost": "Cold start latency, vendor lock-in risk"
                    },
                    {
                        "choice": "PostgreSQL over NoSQL",
                        "benefit": "Strong consistency, relational integrity",
                        "cost": "More complex schema migrations"
                    },
                    {
                        "choice": "OpenAI API vs self-hosted model",
                        "benefit": "Best-in-class AI without ML ops overhead",
                        "cost": "API costs scale with usage"
                    }
                ]
            },
            "success_metrics": {
                "primary_metric": {
                    "name": "Weekly Active Automations per User",
                    "definition": "Number of automations running successfully per user per week",
                    "target": "3+ automations per user",
                    "measurement_frequency": "Daily"
                },
                "secondary_metrics": [
                    {
                        "name": "Time to First Automation",
                        "definition": "Time from signup to first deployed automation",
                        "behavior_tracked": "Onboarding effectiveness"
                    },
                    {
                        "name": "Automation Success Rate",
                        "definition": "Percentage of automation runs that complete without error",
                        "behavior_tracked": "Technical reliability"
                    },
                    {
                        "name": "Dashboard View Frequency",
                        "definition": "Number of times user opens dashboard per week",
                        "behavior_tracked": "Product stickiness"
                    },
                    {
                        "name": "Team Invite Rate",
                        "definition": "Percentage of users who invite team members",
                        "behavior_tracked": "Viral growth potential"
                    }
                ],
                "kill_criteria": "If primary metric is below 1 automation per user after 3 months, or if retention is below 40% at 30 days"
            },
            "readiness_status": {
                "research_sufficient": True,
                "scope_constrained": True,
                "risks_known": True,
                "ready_for_mvp_builder": True,
                "blockers": []
            },
            "metadata": {
                "generated_at": "2024-01-16T12:00:00Z",
                "model_version": "gpt-4",
                "based_on_business_plan_run_id": business_plan.get("metadata", {}).get("run_id", "BP-xxx")
            }
        }

    def get_prd(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve stored PRD by run_id."""
        return self.prd_store.get(run_id)


prd_service = PRDService()
