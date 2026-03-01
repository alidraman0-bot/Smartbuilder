import logging
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.core.supabase import get_service_client
from app.models.startup import StartupDB, StartupUpdate, ProjectResponse, ProjectCreate, ProjectUpdate

logger = logging.getLogger(__name__)

class StartupService:
    def __init__(self):
        self.supabase = get_service_client()

    def get_user_startups(self, user_id: UUID) -> List[StartupDB]:
        """Fetches all startups for a user."""
        try:
            response = self.supabase.table("startups").select("*").eq("user_id", str(user_id)).execute()
            return [StartupDB(**item) for item in response.data]
        except Exception as e:
            logger.error(f"Error fetching user startups: {e}")
            return []

    def get_startup_by_id(self, startup_id: UUID) -> Optional[StartupDB]:
        """Fetches a single startup by ID."""
        try:
            response = self.supabase.table("startups").select("*").eq("id", str(startup_id)).execute()
            if response.data:
                return StartupDB(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching startup by ID: {e}")
            return None

    def create_startup(self, user_id: UUID, name: str) -> Optional[StartupDB]:
        """Creates a new startup entry."""
        try:
            data = {
                "user_id": str(user_id),
                "name": name,
                "current_stage": "idea"
            }
            response = self.supabase.table("startups").insert(data).execute()
            if response.data:
                return StartupDB(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error creating startup: {e}")
            return None

    def update_stage(self, startup_id: UUID, stage: str) -> Optional[StartupDB]:
        """Updates the current stage of the startup."""
        try:
            valid_stages = ['idea', 'research', 'prd', 'build', 'launch', 'monitor']
            if stage not in valid_stages:
                logger.error(f"Invalid stage: {stage}")
                return None

            data = {
                "current_stage": stage,
                "updated_at": datetime.now().isoformat()
            }
            response = self.supabase.table("startups").update(data).eq("id", str(startup_id)).execute()
            if response.data:
                return StartupDB(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error updating startup stage: {e}")
            return None

    # --- Startup Projects (New Schema) ---

    def create_project(self, user_id: UUID, project_data: ProjectCreate) -> Optional[ProjectResponse]:
        """Creates a new startup project entry."""
        try:
            data = {
                "user_id": str(user_id),
                "startup_name": project_data.startup_name,
                "idea_id": str(project_data.idea_id) if project_data.idea_id else None,
                "current_stage": "IDEA"
            }
            response = self.supabase.table("startup_projects").insert(data).execute()
            if response.data:
                return ProjectResponse(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error creating startup project: {e}")
            return None

    def get_project_by_id(self, project_id: UUID) -> Optional[ProjectResponse]:
        """Fetches a single startup project by ID."""
        try:
            response = self.supabase.table("startup_projects").select("*").eq("id", str(project_id)).execute()
            if response.data:
                return ProjectResponse(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching startup project by ID: {e}")
            return None

    def get_user_projects(self, user_id: UUID) -> List[ProjectResponse]:
        """Fetches all startup projects for a user."""
        try:
            response = self.supabase.table("startup_projects").select("*").eq("user_id", str(user_id)).execute()
            return [ProjectResponse(**item) for item in response.data]
        except Exception as e:
            logger.error(f"Error fetching user projects: {e}")
            return []

    def update_project_stage(self, project_id: UUID, stage: str) -> Optional[ProjectResponse]:
        """Updates the current stage of the startup project."""
        try:
            valid_stages = ['IDEA', 'RESEARCH', 'PRD', 'MVP', 'LAUNCH', 'MONITORING']
            if stage not in valid_stages:
                logger.error(f"Invalid stage: {stage}")
                return None

            data = {"current_stage": stage}
            response = self.supabase.table("startup_projects").update(data).eq("id", str(project_id)).execute()
            if response.data:
                return ProjectResponse(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error updating project stage: {e}")
            return None

    def update_project(self, project_id: UUID, update_data: ProjectUpdate) -> Optional[ProjectResponse]:
        """Updates various fields of the startup project."""
        try:
            data = update_data.model_dump(exclude_unset=True)
            if not data:
                return self.get_project_by_id(project_id)
            
            # Convert UUIDs to strings
            for key, value in data.items():
                if isinstance(value, UUID):
                    data[key] = str(value)

            response = self.supabase.table("startup_projects").update(data).eq("id", str(project_id)).execute()
            if response.data:
                return ProjectResponse(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error updating project: {e}")
            return None
