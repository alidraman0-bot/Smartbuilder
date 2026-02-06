import datetime
import uuid
import logging
from typing import List, Dict, Any, Optional
from app.core.supabase import supabase
from app.models.memory import MemoryEventBase

logger = logging.getLogger(__name__)

class MemoryService:
    def __init__(self):
        pass

    async def log_event(self, event: MemoryEventBase) -> Dict[str, Any]:
        """
        Log an atomic unit of project history.
        """
        try:
            data = event.dict()
            data["project_id"] = str(data["project_id"])
            if data["artifact_ref_id"]:
                data["artifact_ref_id"] = str(data["artifact_ref_id"])
            
            response = supabase.table("memory_events").insert(data).execute()
            if not response.data:
                logger.warning("Supabase returned empty data for memory event log.")
                return {}
            return response.data[0]
        except Exception as e:
            logger.error(f"Failed to log memory event: {e}")
            return {}

    async def get_project_timeline(self, project_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all memory events for a project, sorted by time.
        """
        try:
            response = supabase.table("memory_events")\
                .select("*")\
                .eq("project_id", project_id)\
                .order("created_at", desc=True)\
                .execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Failed to fetch project timeline: {e}")
            return []

    async def save_idea(self, project_id: str, idea_data: Dict[str, Any], actor: str = "smartbuilder_ai") -> Dict[str, Any]:
        """
        Persist an idea and log the event.
        """
        try:
            data = {
                "project_id": project_id,
                "title": idea_data.get("title", "Untitled Idea"),
                "thesis": idea_data.get("thesis", ""),
                "source": idea_data.get("source", "ai_generated"),
                "confidence_score": idea_data.get("confidence_score"),
                "content": idea_data,
                "status": idea_data.get("status", "draft")
            }
            response = supabase.table("ideas").insert(data).execute()
            
            if not response.data:
                logger.error(f"Failed to save idea to Supabase: No data returned. project_id={project_id}")
                # Return the original idea with a temporary ID so the FE can still show it
                idea_data["id"] = f"unsaved-{uuid.uuid4()}"
                return idea_data

            saved_idea = response.data[0]

            # Log event - We use a secondary TRY to ensure a logging failure doesn't crash the save
            try:
                await self.log_event(MemoryEventBase(
                    project_id=uuid.UUID(project_id),
                    type="idea_created",
                    title=f"Idea Generated: {saved_idea['title']}",
                    description=saved_idea['thesis'],
                    artifact_ref_type="ideas",
                    artifact_ref_id=uuid.UUID(saved_idea["id"]),
                    actor=actor
                ))
            except Exception as le:
                logger.warning(f"Metadata logging failed for idea {saved_idea.get('id')}: {le}")
            
            return saved_idea
        except Exception as e:
            logger.error(f"Critical failure in save_idea: {e}")
            # Ensure the idea has a fallback ID before returning
            idea_data["id"] = idea_data.get("id") or f"err-{uuid.uuid4()}"
            return idea_data

    async def create_research_snapshot(self, project_id: str, idea_id: str, research_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save an immutable research snapshot.
        """
        data = {
            "project_id": project_id,
            "idea_id": idea_id,
            "market_size": research_data.get("market_size", {}),
            "trends": research_data.get("trends", []),
            "charts": research_data.get("charts", []),
            "assumptions": research_data.get("assumptions", []),
            "sources": research_data.get("sources", [])
        }
        response = supabase.table("research_snapshots").insert(data).execute()
        snapshot = response.data[0]

        # Log event
        await self.log_event(MemoryEventBase(
            project_id=uuid.UUID(project_id),
            type="research_snapshot_created",
            title="Research Snapshot Created",
            description=f"Market analysis generation for {idea_id[:8]}",
            artifact_ref_type="research_snapshots",
            artifact_ref_id=uuid.UUID(snapshot["id"]),
            actor="smartbuilder_ai"
        ))

        return snapshot

    async def save_business_plan_version(self, project_id: str, snapshot_id: str, content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save a versioned business plan.
        """
        # Determine next version number
        latest = supabase.table("business_plan_versions")\
            .select("version_number")\
            .eq("project_id", project_id)\
            .order("version_number", desc=True)\
            .limit(1)\
            .execute()
        
        version_num = (latest.data[0]["version_number"] + 1) if latest.data else 1

        data = {
            "project_id": project_id,
            "research_snapshot_id": snapshot_id,
            "content": content,
            "version_number": version_num
        }
        response = supabase.table("business_plan_versions").insert(data).execute()
        bp_version = response.data[0]

        # Log event
        await self.log_event(MemoryEventBase(
            project_id=uuid.UUID(project_id),
            type="business_plan_versioned",
            title=f"Business Plan v{version_num}",
            description="New version generated based on research snapshot.",
            artifact_ref_type="business_plan_versions",
            artifact_ref_id=uuid.UUID(bp_version["id"]),
            actor="smartbuilder_ai"
        ))

        return bp_version

    async def save_prd_version(self, project_id: str, bp_version_id: str, content: Dict[str, Any], status: str = "draft") -> Dict[str, Any]:
        """
        Save a PRD version.
        """
        data = {
            "project_id": project_id,
            "business_plan_version_id": bp_version_id,
            "content": content,
            "status": status
        }
        response = supabase.table("prd_versions").insert(data).execute()
        prd_version = response.data[0]

        # Log event
        event_title = "PRD Created" if status == "draft" else "PRD Locked"
        await self.log_event(MemoryEventBase(
            project_id=uuid.UUID(project_id),
            type="prd_locked" if status == "locked" else "prd_created",
            title=event_title,
            description="The product requirement document has been " + ("locked and is ready for build." if status == "locked" else "initialized."),
            artifact_ref_type="prd_versions",
            artifact_ref_id=uuid.UUID(prd_version["id"]),
            actor="user" if status == "locked" else "smartbuilder_ai"
        ))

        return prd_version

memory_service = MemoryService()
