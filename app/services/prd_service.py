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
    "objective": "Single paragraph that defines the product's core purpose",
    "is_immutable": true,
    "ripple_effects": ["Any change to this objective requires full plan re-evaluation"]
  },
  "target_users": {
    "personas": [
      {
        "name": "Operational persona name",
        "trigger_moment": "What causes them to seek this solution",
        "job_to_be_done": "What they're trying to accomplish",
        "failure_consequence": "What happens if they fail"
      }
    ]
  },
  "core_use_cases": {
    "use_cases": [
      {
        "use_case": "Use case title",
        "problem_id": "Links back to problem statement",
        "market_signal": "Evidence this use case matters",
        "revenue_implication": "How this drives revenue"
      }
    ]
  },
  "mvp_feature_set": {
    "features": [
      {
        "name": "Feature name",
        "description": "What it does",
        "priority": "P0 | P1 | P2",
        "build_complexity": 1-10,
        "dependencies": ["F-002"],
        "kill_criteria": "When to remove this feature"
      }
    ]
  },
  "explicit_non_goals": {
    "non_goals": ["Feature name"],
    "enforcement_enabled": true
  },
  "user_flows": {
    "flows": [
      {
        "flow_name": "Flow name",
        "steps": ["Step 1 description", "Step 2 description"],
        "can_convert_to_ui": true,
        "can_convert_to_api": true,
        "can_convert_to_tests": true
      }
    ]
  },
  "technical_assumptions": {
    "assumptions": [
      {
        "assumption": "Technical decision",
        "feeds_into": ["MVP Builder"],
        "includes": {
          "stack_choices": ["Choice 1"],
          "infra_shortcuts": ["Shortcut 1"],
          "trade_offs": ["Trade-off 1"]
        }
      }
    ]
  },
  "success_metrics": {
    "metrics": [
      {
        "metric": "Main metric to track",
        "type": "Minimal | Behavioral | Actionable",
        "answers": "Should we keep building?"
      }
    ]
  },
  "readiness_status": {
    "gates": [
      {
        "gate_name": "Research Sufficient | Scope Constrained | Risks Known",
        "passed": true,
        "details": "Details about why it passed/failed"
      }
    ],
    "is_ready": true,
    "mvp_builder_unlocked": true
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
                "objective": f"{idea_title} is an AI-native automation platform that enables {target_user} to eliminate manual data workflows through intelligent automation. The product wins by providing end-to-end workflow automation instead of point solutions, prioritizing speed to value over feature breadth. Success is measured by time saved per user per week.",
                "is_immutable": True,
                "ripple_effects": ["Changing this objective invalidates the business plan, feature set, and technical architecture"]
            },
            "target_users": {
                "personas": [
                    {
                        "name": "Operations Manager",
                        "trigger_moment": "Facing quarterly deadline with manual data reconciliation backlog",
                        "job_to_be_done": "Consolidate data from multiple sources without manual intervention",
                        "failure_consequence": "Missed deadlines, inaccurate reports, team burnout"
                    },
                    {
                        "name": "Small Business Owner",
                        "trigger_moment": "Spending evenings on administrative tasks instead of growing business",
                        "job_to_be_done": "Automate routine business operations",
                        "failure_consequence": "Opportunity cost, slower growth, competitive disadvantage"
                    }
                ]
            },
            "core_use_cases": {
                "use_cases": [
                    {
                        "use_case": "Automated Data Aggregation",
                        "problem_id": "Manual data collection from multiple sources",
                        "market_signal": "85% of users report this as primary pain point",
                        "revenue_implication": "Core value prop - justifies premium pricing"
                    },
                    {
                        "use_case": "Intelligent Workflow Automation",
                        "problem_id": "Repetitive manual tasks",
                        "market_signal": "Research shows 10hrs/week spent on automatable tasks",
                        "revenue_implication": "Key differentiation from competitors"
                    }
                ]
            },
            "mvp_feature_set": {
                "features": [
                    {
                        "name": "Data Source Connectors",
                        "description": "Pre-built integrations for common business tools (Google Sheets, Airtable, Notion, etc.)",
                        "priority": "P0",
                        "build_complexity": 8,
                        "dependencies": [],
                        "kill_criteria": "If integration reliability is below 95%"
                    },
                    {
                        "name": "Automated Data Sync Engine",
                        "description": "Background service that pulls and normalizes data on schedule",
                        "priority": "P0",
                        "build_complexity": 9,
                        "dependencies": ["Data Source Connectors"],
                        "kill_criteria": "If sync failures exceed 5%"
                    },
                    {
                        "name": "AI Automation Suggestions",
                        "description": "ML model that identifies automation opportunities from user behavior",
                        "priority": "P0",
                        "build_complexity": 9,
                        "dependencies": ["Automated Data Sync Engine"],
                        "kill_criteria": "If suggestion acceptance rate is below 20%"
                    }
                ]
            },
            "explicit_non_goals": {
                "non_goals": [
                    "Custom workflow builder (drag-and-drop interface)",
                    "Advanced reporting (custom SQL queries)",
                    "White-label / self-hosted deployment",
                    "AI chatbot interface"
                ],
                "enforcement_enabled": True
            },
            "user_flows": {
                "flows": [
                    {
                        "flow_name": "New User Onboarding",
                        "steps": [
                            "User enters email and creates password",
                            "User selects role and use case",
                            "User connects first data source",
                            "User sees first automation suggestion",
                            "User approves suggestion"
                        ],
                        "can_convert_to_ui": True,
                        "can_convert_to_api": True,
                        "can_convert_to_tests": True
                    }
                ]
            },
            "technical_assumptions": {
                "assumptions": [
                    {
                        "assumption": "Using serverless architecture",
                        "feeds_into": ["MVP Builder", "Base44 workflow"],
                        "includes": {
                            "stack_choices": ["Next.js", "FastAPI"],
                            "infra_shortcuts": ["Vercel", "Railway"],
                            "trade_offs": ["Zero maintenance vs Cold starts"]
                        }
                    }
                ]
            },
            "success_metrics": {
                "metrics": [
                    {
                        "metric": "Weekly Active Automations per User",
                        "type": "Behavioral",
                        "answers": "Yes - users are finding enough value to keep automations running."
                    }
                ]
            },
            "readiness_status": {
                "gates": [
                    {
                        "gate_name": "Research Sufficient",
                        "passed": True,
                        "details": "High confidence market signals detected."
                    },
                    {
                        "gate_name": "Scope Constrained",
                        "passed": True,
                        "details": "MVP feature set limited to 8 core items."
                    }
                ],
                "is_ready": True,
                "mvp_builder_unlocked": True
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
