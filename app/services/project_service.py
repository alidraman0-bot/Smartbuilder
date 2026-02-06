import logging
import datetime
import uuid
from typing import List, Dict, Any, Optional
from app.core.supabase import supabase

logger = logging.getLogger(__name__)

class ProjectService:
    def __init__(self):
        # No local storage needed
        pass

    # --- Projects ---
    def list_projects(self) -> List[Dict[str, Any]]:
        try:
            response = supabase.table("projects").select("*").execute()
            return response.data
        except Exception as e:
            logger.error(f"Supabase error in list_projects: {e}")
            return []

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = supabase.table("projects").select("*").eq("project_id", project_id).single().execute()
            return response.data
        except Exception as e:
            logger.error(f"Supabase error in get_project({project_id}): {e}")
            return None

    def create_project(self, name: str, framework: str) -> Dict[str, Any]:
        data = {
            "name": name,
            "framework": framework,
            "root_directory": "./",
            "status": "active",
            "environment": "Production"
        }
        try:
            response = supabase.table("projects").insert(data).execute()
            project = response.data[0]
            self._log_activity(project["project_id"], "system", "System", "created project", name, "Production")
            return project
        except Exception as e:
            logger.error(f"Supabase error in create_project: {e}")
            # Return dummy project if insert fails for local testing stability
            return {**data, "project_id": "dummy_proj", "created_at": datetime.datetime.now().isoformat()}

    def update_project(self, project_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            updates["updated_at"] = datetime.datetime.now().isoformat()
            response = supabase.table("projects").update(updates).eq("project_id", project_id).execute()
            if response.data:
                self._log_activity(project_id, "current_user", "You", "updated project settings", "General", "Global")
                return response.data[0]
        except Exception as e:
            logger.error(f"Supabase error in update_project({project_id}): {e}")
        return None

    def delete_project(self, project_id: str):
        try:
            supabase.table("projects").delete().eq("project_id", project_id).execute()
        except Exception as e:
            logger.error(f"Supabase error in delete_project({project_id}): {e}")

    # --- Environment Variables ---
    def get_env_vars(self, project_id: str) -> List[Dict[str, Any]]:
        try:
            response = supabase.table("environment_variables").select("*").eq("project_id", project_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Supabase error in get_env_vars({project_id}): {e}")
            return []

    def save_env_var(self, project_id: str, key: str, value: str, targets: List[str]) -> Dict[str, Any]:
        try:
            # Check if exists
            existing = supabase.table("environment_variables").select("*").eq("project_id", project_id).eq("key", key).execute()
            
            data = {
                "project_id": project_id,
                "key": key,
                "value": value,
                "target": targets
            }

            if existing.data:
                # Update
                response = supabase.table("environment_variables").update(data).eq("id", existing.data[0]["id"]).execute()
                self._log_activity(project_id, "current_user", "You", "updated env var", key, "Global")
                return response.data[0]
            else:
                # Insert
                response = supabase.table("environment_variables").insert(data).execute()
                self._log_activity(project_id, "current_user", "You", "added env var", key, "Global")
                return response.data[0]
        except Exception as e:
            logger.error(f"Supabase error in save_env_var: {e}")
            return {"key": key, "value": value, "target": targets}

    def remove_env_var(self, project_id: str, env_id: str):
        try:
            supabase.table("environment_variables").delete().eq("id", env_id).execute()
            self._log_activity(project_id, "current_user", "You", "removed env var", "HIDDEN", "Global")
        except Exception as e:
            logger.error(f"Supabase error in remove_env_var: {e}")

    # --- Domains ---
    def get_domains(self, project_id: str) -> List[Dict[str, Any]]:
        try:
            response = supabase.table("domains").select("*").eq("project_id", project_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Supabase error in get_domains({project_id}): {e}")
            return []

    def add_domain(self, project_id: str, domain: str) -> Dict[str, Any]:
        data = {
            "domain": domain,
            "project_id": project_id,
            "type": "custom",
            "status": "pending",
            "dns_status": "pending",
            "ssl_status": "pending"
        }
        try:
            response = supabase.table("domains").insert(data).execute()
            self._log_activity(project_id, "current_user", "You", "added domain", domain, "Production")
            return response.data[0]
        except Exception as e:
            logger.error(f"Supabase error in add_domain: {e}")
            return data

    def verify_dns(self, project_id: str, domain: str) -> Dict[str, Any]:
        try:
            # Verification Logic (Simulated for now)
            updates = {
                "dns_status": "verified",
                "ssl_status": "active",
                "status": "active"
            }
            response = supabase.table("domains").update(updates).eq("domain", domain).eq("project_id", project_id).execute()
            if not response.data:
                raise ValueError("Domain not found")
            
            self._log_activity(project_id, "current_user", "You", "verified domain", domain, "Production")
            return response.data[0]
        except Exception as e:
            logger.error(f"Supabase error in verify_dns: {e}")
            raise

    def remove_domain(self, project_id: str, domain: str):
        try:
            supabase.table("domains").delete().eq("domain", domain).eq("project_id", project_id).execute()
            self._log_activity(project_id, "current_user", "You", "removed domain", domain, "Production")
        except Exception as e:
            logger.error(f"Supabase error in remove_domain: {e}")

    # --- Team ---
    def get_team(self, project_id: str) -> List[Dict[str, Any]]:
        try:
            response = supabase.table("team_members").select("*").eq("project_id", project_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Supabase error in get_team({project_id}): {e}")
            return []

    def invite_member(self, project_id: str, email: str, role: str) -> Dict[str, Any]:
        data = {
            "project_id": project_id,
            "user_id": uuid.uuid4().hex, # Mock user ID generation
            "email": email,
            "role": role
        }
        try:
            response = supabase.table("team_members").insert(data).execute()
            self._log_activity(project_id, "current_user", "You", "invited member", email, "Global")
            return response.data[0]
        except Exception as e:
            logger.error(f"Supabase error in invite_member: {e}")
            return data

    def remove_member(self, project_id: str, user_id: str):
        try:
            # Note: Using user_id, which is stored as text/uuid in table
            supabase.table("team_members").delete().eq("user_id", user_id).eq("project_id", project_id).execute()
            self._log_activity(project_id, "current_user", "You", "removed member", user_id, "Global")
        except Exception as e:
            logger.error(f"Supabase error in remove_member: {e}")

    # --- Activity ---
    def get_activity_log(self, project_id: str) -> List[Dict[str, Any]]:
        try:
            response = supabase.table("activity_logs").select("*").eq("project_id", project_id).order("timestamp", desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Supabase error in get_activity_log({project_id}): {e}")
            return []

    def _log_activity(self, project_id: str, user_id: str, user_name: str, action: str, target: str, environment: str, details: str = None):
        data = {
            "project_id": project_id,
            "user_id": user_id,
            "user_name": user_name,
            "action": action,
            "target": target,
            "environment": environment,
            "details": details,
            "timestamp": datetime.datetime.now().isoformat()
        }
        try:
            supabase.table("activity_logs").insert(data).execute()
        except Exception as e:
            logger.error(f"Failed to log activity: {e}")

project_service = ProjectService()
