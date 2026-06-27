"""
Build Plan Generator Service

First AI call in the build pipeline — generates architecture/structure, NOT code.
Converts a startup blueprint into a structured build plan with:
- App type classification
- Frontend pages
- Backend endpoints
- Database tables
- Features list
- API routes
- Integrations
"""

import logging
import json
from typing import Dict, Any, Optional
from app.core.ai_client import get_ai_client
from app.core.supabase import get_service_client

logger = logging.getLogger(__name__)


class BuildPlanGenerator:
    def __init__(self):
        self.ai = get_ai_client()
        self.supabase = get_service_client()

    async def generate_build_plan(
        self,
        blueprint: Dict[str, Any],
        project_id: str,
    ) -> Dict[str, Any]:
        """
        Generate a structured build plan from a startup blueprint.
        This is the FIRST AI call — it plans architecture, not code.
        """
        system_prompt = """You are a senior software architect.

Convert this startup blueprint into a build plan for an MVP web application.

RULES:
- Keep the MVP minimal — 3-5 pages max
- Use Next.js + Tailwind for frontend
- Use Next.js API routes for backend
- Use PostgreSQL (Supabase) for database
- Only include features that are critical for the MVP
- Be specific about table columns and API endpoint paths

RETURN ONLY A JSON OBJECT with this exact structure:
{
  "app_type": "saas_dashboard | ai_tool | crud_app",
  "app_name": "kebab-case-name",
  "description": "One line description",
  "frontend": {
    "framework": "Next.js",
    "styling": "Tailwind CSS",
    "pages": [
      {
        "name": "page name",
        "path": "/route-path",
        "description": "what this page shows",
        "components": ["ComponentName1", "ComponentName2"]
      }
    ]
  },
  "backend": {
    "framework": "Next.js API Routes",
    "endpoints": [
      {
        "method": "GET|POST|PUT|DELETE",
        "path": "/api/resource",
        "description": "what it does",
        "auth_required": true
      }
    ]
  },
  "database_tables": [
    {
      "name": "table_name",
      "columns": [
        {"name": "id", "type": "uuid", "primary": true},
        {"name": "column_name", "type": "text|integer|boolean|jsonb|timestamptz", "nullable": false}
      ]
    }
  ],
  "features": [
    {
      "name": "Feature Name",
      "description": "What it does",
      "priority": "P0|P1"
    }
  ],
  "api_routes": ["/api/route1", "/api/route2"],
  "integrations": ["supabase_auth", "stripe", "etc"]
}"""

        # Build the context from blueprint
        context_parts = []
        if isinstance(blueprint, dict):
            if blueprint.get("name"):
                context_parts.append(f"Startup Name: {blueprint['name']}")
            if blueprint.get("problem"):
                context_parts.append(f"Problem: {blueprint['problem']}")
            if blueprint.get("solution"):
                context_parts.append(f"Solution: {blueprint['solution']}")
            if blueprint.get("customers"):
                context_parts.append(f"Target Customers: {blueprint['customers']}")
            if blueprint.get("features"):
                features = blueprint["features"]
                if isinstance(features, list):
                    context_parts.append(f"Core Features: {', '.join(features)}")
            if blueprint.get("tech_stack"):
                context_parts.append(f"Tech Stack: {blueprint['tech_stack']}")
            if blueprint.get("business_model"):
                context_parts.append(f"Business Model: {blueprint['business_model']}")
        else:
            context_parts.append(f"Idea: {str(blueprint)}")

        user_message = f"""Generate a build plan for this startup MVP:

{chr(10).join(context_parts)}

Remember: Plan the ARCHITECTURE only. Do NOT generate any code."""

        try:
            response = await self.ai.chat_completion(
                messages=[{"role": "user", "content": user_message}],
                system_prompt=system_prompt,
                response_format={"type": "json_object"},
                max_tokens=4000
            )

            plan = json.loads(response["content"])

            # Validate essential fields
            plan.setdefault("app_type", "crud_app")
            plan.setdefault("app_name", "my-mvp")
            plan.setdefault("frontend", {"framework": "Next.js", "pages": []})
            plan.setdefault("backend", {"framework": "Next.js API Routes", "endpoints": []})
            plan.setdefault("database_tables", [])
            plan.setdefault("features", [])
            plan.setdefault("api_routes", [])
            plan.setdefault("integrations", [])

            # Persist to Supabase
            await self._save_plan(project_id, plan)

            logger.info(f"Build plan generated for project {project_id}: {plan['app_type']}")
            return plan

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI build plan response: {e}")
            # Return a sensible default plan
            default_plan = self._get_default_plan(blueprint)
            await self._save_plan(project_id, default_plan)
            return default_plan
        except Exception as e:
            logger.error(f"Build plan generation failed: {e}")
            default_plan = self._get_default_plan(blueprint)
            await self._save_plan(project_id, default_plan)
            return default_plan

    async def _save_plan(self, project_id: str, plan: Dict[str, Any]):
        """Persist build plan to Supabase."""
        try:
            self.supabase.table("build_plans").insert({
                "project_id": project_id,
                "plan": plan,
            }).execute()
        except Exception as e:
            logger.error(f"Failed to save build plan: {e}")

    def _get_default_plan(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback build plan when AI fails."""
        name = "my-mvp"
        if isinstance(blueprint, dict):
            name = blueprint.get("name", "my-mvp").lower().replace(" ", "-")

        return {
            "app_type": "saas_dashboard",
            "app_name": name,
            "description": "MVP SaaS Dashboard",
            "frontend": {
                "framework": "Next.js",
                "styling": "Tailwind CSS",
                "pages": [
                    {"name": "Dashboard", "path": "/", "description": "Main dashboard with overview metrics", "components": ["StatsCards", "ActivityFeed"]},
                    {"name": "Projects", "path": "/projects", "description": "List and manage projects", "components": ["ProjectList", "ProjectCard"]},
                    {"name": "Settings", "path": "/settings", "description": "User and app settings", "components": ["SettingsForm"]},
                    {"name": "Auth", "path": "/login", "description": "Login and signup", "components": ["AuthForm"]}
                ]
            },
            "backend": {
                "framework": "Next.js API Routes",
                "endpoints": [
                    {"method": "GET", "path": "/api/projects", "description": "List all projects", "auth_required": True},
                    {"method": "POST", "path": "/api/projects", "description": "Create a project", "auth_required": True},
                    {"method": "PUT", "path": "/api/projects/:id", "description": "Update a project", "auth_required": True},
                    {"method": "DELETE", "path": "/api/projects/:id", "description": "Delete a project", "auth_required": True},
                    {"method": "GET", "path": "/api/stats", "description": "Get dashboard stats", "auth_required": True}
                ]
            },
            "database_tables": [
                {
                    "name": "users",
                    "columns": [
                        {"name": "id", "type": "uuid", "primary": True},
                        {"name": "email", "type": "text", "nullable": False},
                        {"name": "name", "type": "text", "nullable": True},
                        {"name": "created_at", "type": "timestamptz", "nullable": False}
                    ]
                },
                {
                    "name": "projects",
                    "columns": [
                        {"name": "id", "type": "uuid", "primary": True},
                        {"name": "user_id", "type": "uuid", "nullable": False},
                        {"name": "name", "type": "text", "nullable": False},
                        {"name": "description", "type": "text", "nullable": True},
                        {"name": "status", "type": "text", "nullable": False},
                        {"name": "created_at", "type": "timestamptz", "nullable": False},
                        {"name": "updated_at", "type": "timestamptz", "nullable": False}
                    ]
                }
            ],
            "features": [
                {"name": "Authentication", "description": "User signup and login with Supabase Auth", "priority": "P0"},
                {"name": "CRUD Projects", "description": "Create, read, update, delete projects", "priority": "P0"},
                {"name": "Dashboard", "description": "Overview metrics and activity feed", "priority": "P0"},
                {"name": "Settings", "description": "User profile and app configuration", "priority": "P1"}
            ],
            "api_routes": ["/api/projects", "/api/stats", "/api/auth"],
            "integrations": ["supabase_auth"]
        }
