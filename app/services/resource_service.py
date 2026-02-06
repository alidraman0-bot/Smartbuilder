from typing import List, Optional, Dict, Any
from enum import Enum
import uuid
from datetime import datetime

class ResourceType(str, Enum):
    PLAYBOOK = "playbook"
    TEMPLATE = "template"
    BENCHMARK = "benchmark"
    GUIDE = "guide"

class ResourceService:
    def __init__(self):
        # Mock Data Store
        self._resources = [
            # Playbooks
            {
                "id": "pb-001",
                "type": ResourceType.PLAYBOOK,
                "title": "MVP Launch Strategy",
                "description": "Step-by-step execution strategies used by high-performing startups.",
                "stage_relevance": ["MVP", "Launch"],
                "content": {
                    "when_to_use": "You have a working prototype and are ready to acquire first users.",
                    "problem_solves": " Chaotic launches with no clear metrics.",
                    "expected_outcome": "First 100 active users and verified retention data.",
                    "steps": [
                        "Define success metrics (Retention > 30%)",
                        "Set up analytics tracking",
                        "Draft announcement comms",
                        "Deploy to production environment",
                        "Monitor initial user sessions"
                    ],
                    "features_involved": ["Deployment", "Monitoring"]
                },
                "last_updated": datetime.utcnow().isoformat()
            },
            {
                "id": "pb-002",
                "type": ResourceType.PLAYBOOK,
                "title": "Investor Readiness",
                "description": "Prepare your startup's data room and narrative for seed funding.",
                "stage_relevance": ["Scale"],
                "content": {
                     "when_to_use": "Metrics are healthy and you need capital to scale.",
                    "problem_solves": "Unprepared due diligence processing.",
                    "expected_outcome": "A complete data room and pitch deck.",
                    "steps": [
                        "Audit financial metrics",
                        "Consolidate legal documents",
                        "Refine the master pitch deck",
                        "Practice the pitch"
                    ],
                    "features_involved": ["Business Plan"]
                },
                "last_updated": datetime.utcnow().isoformat()
            },
             # Templates
            {
                "id": "tpl-001",
                "type": ResourceType.TEMPLATE,
                "title": "Investor Update",
                "description": "Pre-built structures you can apply instantly.",
                "stage_relevance": ["All"],
                "content": {
                    "structure": ["Highlights", "Lowlights", "Key Metrics", "Ask"]
                },
                "last_updated": datetime.utcnow().isoformat()
            },
            {
                 "id": "tpl-002",
                "type": ResourceType.TEMPLATE,
                "title": "Incident Postmortem",
                "description": "Standardized format for learning from failures.",
                "stage_relevance": ["All"],
                "content": {
                    "structure": ["Summary", "Timeline", "Root Cause", "Action Items"]
                },
                "last_updated": datetime.utcnow().isoformat()
            },
            # Benchmarks
            {
                "id": "bm-001",
                "type": ResourceType.BENCHMARK,
                "title": "Deployment Frequency",
                "description": "Anonymous comparisons to understand what 'good' looks like.",
                "stage_relevance": ["MVP", "Scale"],
                "content": {
                    "metric": "Daily Deploys",
                    "your_value": "4.2",
                    "industry_range": "2.0 - 10.0",
                    "percentile": 72,
                    "interpretation": "Your deployment frequency is in the 72nd percentile for early-stage startups. No red alarms."
                },
                "last_updated": datetime.utcnow().isoformat()
            },
            # Guides
            {
                "id": "gd-001",
                "type": ResourceType.GUIDE,
                "title": "Choosing a Pricing Model",
                "description": "Clear explanations for critical decisions.",
                "stage_relevance": ["Business Plan", "MVP"],
                "content": {
                     "situation": "Deciding between SaaS, Usage-based, or Freemium.",
                     "mistake": "Picking a model based on competitors without math.",
                     "truth": "Pricing is a feature of the product, not marketing.",
                     "support": "Use the Business Plan module to scenario test pricing."
                },
                "last_updated": datetime.utcnow().isoformat()
            }
        ]

    async def get_resources(self, project_id: Optional[str] = None, stage: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get resources, optionally filtered by project context (simulated).
        """
        # In a real app, we would use project_id to look up the project's actual stage.
        # For now, if 'This Project' logic is requested (stage provided), we filter.
        
        if not stage:
            return self._resources

        # Simple string matching for demo purposes
        filtered = [
            r for r in self._resources 
            if "All" in r["stage_relevance"] or stage in r["stage_relevance"]
        ]
        return filtered

    async def get_intelligence(self, project_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate contextual insights for the intelligence panel.
        """
        # Mock logic
        return {
            "insights": [
                {
                    "text": "Your incident response time has improved by 18%.",
                    "sentiment": "positive"
                },
                {
                    "text": "Your MVP scope is aligned with early-stage benchmarks.",
                    "sentiment": "neutral"
                }
            ],
            "suggested_action": {
                "text": "Prepare an investor update.",
                "resource_id": "tpl-001" # Links to the template
            }
        }

    async def apply_resource(self, resource_id: str, project_id: str) -> Dict[str, Any]:
        """
        'Apply' a resource to a project.
        """
        # In a real system, this would:
        # 1. Create a checklist in DB
        # 2. Add an entry to Project Memory
        # 3. Trigger a notification
        return {
            "status": "success",
            "message": f"Resource {resource_id} applied to project {project_id}",
            "artifact_id": str(uuid.uuid4())
        }

resource_service = ResourceService()
