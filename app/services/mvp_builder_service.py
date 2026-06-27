"""
MVP Builder Service — Session Manager & Pipeline Controller

Manages the lifecycle of MVP build sessions:
  S0: EMPTY          — No project
  S1: IDEA_INTAKE    — Capturing user intent
  S2: INITIALIZING   — Setting up pipeline
  S3: BUILDING       — 8-step pipeline executing
  S4: STABLE         — Build complete, interactive mode
  S5: RECOVERING     — Debug Agent auto-fixing
  S6: FROZEN         — Immutable, deployment-ready

Delegates all build work to MVPPipeline (mvp_pipeline.py).
"""

import uuid
import logging
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from enum import Enum
from dataclasses import dataclass, field

from app.core.mvp_pipeline import MVPPipeline, PipelineResult
from app.services.sandbox_service import SandboxService

logger = logging.getLogger(__name__)


# ============================================================================
# Enums & Models
# ============================================================================

class BuilderState(str, Enum):
    EMPTY        = "S0"
    IDEA_INTAKE  = "S1"
    INITIALIZING = "S2"
    BUILDING     = "S3"
    STABLE       = "S4"
    RECOVERING   = "S5"
    FROZEN       = "S6"


class TimelineEvent:
    def __init__(self, message: str, event_type: str = "info", timestamp: str = None):
        self.timestamp = timestamp or datetime.utcnow().strftime("%H:%M:%S")
        self.message = message
        self.type = event_type

    def to_dict(self) -> Dict[str, Any]:
        return {"message": self.message, "event_type": self.type, "timestamp": self.timestamp}


class BuildSession:
    """In-memory build session — tracks state, files, timeline, and pipeline results."""

    def __init__(self, session_id: str, run_id: str):
        self.session_id = session_id
        self.run_id = run_id
        self.state = BuilderState.IDEA_INTAKE
        self.project_name = "Untitled Project"

        # Pipeline results
        self.plan: Optional[Dict[str, Any]] = None
        self.architecture: Optional[Dict[str, Any]] = None
        self.files: List[Dict[str, str]] = []
        self.scaffold: Optional[Dict[str, Any]] = None
        self.preview_url: Optional[str] = None
        self.sandbox_id: Optional[str] = None

        # Pipeline step tracking
        self.pipeline_steps: List[Dict[str, Any]] = [
            {"step": "analyze",  "label": "Analyzing Idea",         "status": "pending"},
            {"step": "design",   "label": "Designing Architecture", "status": "pending"},
            {"step": "generate", "label": "Generating Code",        "status": "pending"},
            {"step": "scaffold", "label": "Scaffolding Project",    "status": "pending"},
            {"step": "optimize", "label": "Optimizing",             "status": "pending"},
            {"step": "deploy",   "label": "Deploying",              "status": "pending"},
            {"step": "verify",   "label": "Verifying",              "status": "pending"},
            {"step": "finalize", "label": "Finalizing",             "status": "pending"},
        ]

        # Timeline & logs
        self.timeline: List[TimelineEvent] = []
        self.last_error: Optional[Dict[str, Any]] = None

        # Versioning
        self.build_version = 1
        self.last_stable_snapshot: Optional[Dict[str, Any]] = None

        # Timestamps
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def update_step(self, step_name: str, status: str, data: Optional[Dict] = None):
        """Update a pipeline step's status."""
        for s in self.pipeline_steps:
            if s["step"] == step_name:
                s["status"] = status
                if data:
                    s["data"] = data
                break

    def to_state_dict(self) -> Dict[str, Any]:
        """Serialise session state for API responses."""
        return {
            "session_id": self.session_id,
            "run_id": self.run_id,
            "state": self.state.value,
            "project_name": self.project_name,
            "preview_url": self.preview_url,
            "sandbox_id": self.sandbox_id,
            "files_count": len(self.files),
            "pipeline_steps": self.pipeline_steps,
            "timeline": [e.to_dict() for e in self.timeline[-50:]],
            "last_error": self.last_error,
            "build_version": self.build_version,
            "plan": self.plan,
            "architecture": self.architecture,
            "scaffold": self.scaffold,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


# ============================================================================
# Service
# ============================================================================

class MvpBuilderService:
    """
    Session manager that exposes buildMVP / improveMVP to the API layer.
    Maintains in-memory sessions and delegates build work to MVPPipeline.
    """

    def __init__(self):
        self.sessions: Dict[str, BuildSession] = {}
        self.sandbox_service = SandboxService()

    # -----------------------------------------------------------------------
    # Session CRUD
    # -----------------------------------------------------------------------

    def create_session(self, run_id: str = None, idea: str = None) -> BuildSession:
        """Create a new builder session."""
        session_id = str(uuid.uuid4())
        if not run_id:
            run_id = str(uuid.uuid4())

        session = BuildSession(session_id=session_id, run_id=run_id)
        self.sessions[session_id] = session

        session.timeline.append(TimelineEvent("Builder session created", "info"))
        logger.info("Created session %s (run=%s)", session_id, run_id)
        return session

    def get_session(self, session_id: str) -> Optional[BuildSession]:
        return self.sessions.get(session_id)

    def get_session_state(self, session_id: str) -> Dict[str, Any]:
        session = self.sessions.get(session_id)
        if not session:
            return {"state": BuilderState.EMPTY.value, "session_id": session_id}
        return session.to_state_dict()

    def get_build_status(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Compatibility method for deployment_api."""
        # Find the latest session for this run_id
        matching_sessions = [s for s in self.sessions.values() if s.run_id == run_id]
        if not matching_sessions:
            return None
        
        latest_session = max(matching_sessions, key=lambda s: s.updated_at)
        
        status = "IN_PROGRESS"
        if latest_session.state in (BuilderState.STABLE, BuilderState.FROZEN):
            status = "COMPLETE"
        elif latest_session.state == BuilderState.RECOVERING:
            status = "FAILED"
            
        return {
            "build_id": latest_session.session_id,
            "run_id": run_id,
            "status": status,
            "project_name": latest_session.project_name
        }

    # -----------------------------------------------------------------------
    # Build MVP  (full 8-step pipeline)
    # -----------------------------------------------------------------------

    async def build_mvp(self, session_id: str, idea: str) -> BuildSession:
        """
        Execute the full 8-step autonomous build pipeline.
        This is the main entry point called by the API router.
        """
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        # Transition: S1 → S2 → S3
        session.state = BuilderState.INITIALIZING
        session.timeline.append(TimelineEvent("Build pipeline starting...", "info"))
        session.updated_at = datetime.utcnow()

        try:
            session.state = BuilderState.BUILDING

            # Create pipeline with event callback that updates session
            def on_pipeline_event(step: str, message: str, data: Optional[Dict] = None):
                session.timeline.append(TimelineEvent(message, "info"))
                session.update_step(step, "active")
                session.updated_at = datetime.utcnow()
                logger.info("[Session:%s] [%s] %s", session_id[:8], step, message)

            pipeline = MVPPipeline(on_event=on_pipeline_event)
            result: PipelineResult = await pipeline.build_mvp(idea)

            # Store results in session
            session.plan = result.plan
            session.architecture = result.architecture
            session.project_name = result.project_name
            session.preview_url = result.preview_url
            session.files = result.app.get("files", []) if result.app else []
            session.scaffold = result.app.get("scaffold") if result.app else None
            session.sandbox_id = None  # TODO: wire sandbox_id from pipeline context

            # Update pipeline steps from result
            for step_result in result.steps:
                session.update_step(step_result.get("step", ""), step_result.get("status", "completed"), step_result.get("data"))

            if result.status in ("completed", "completed_no_preview"):
                session.state = BuilderState.STABLE
                session.timeline.append(TimelineEvent(f"🚀 Build complete! {len(session.files)} files generated.", "success"))
                if session.preview_url:
                    session.timeline.append(TimelineEvent(f"Live preview: {session.preview_url}", "success"))

                # Save stable snapshot
                session.last_stable_snapshot = {
                    "files": session.files.copy(),
                    "version": session.build_version,
                }
            else:
                session.state = BuilderState.RECOVERING
                session.last_error = {"message": result.error or "Build failed", "category": "build"}
                session.timeline.append(TimelineEvent(f"Build failed: {result.error}", "error"))

        except Exception as e:
            logger.error("build_mvp failed for session %s: %s", session_id, e)
            session.state = BuilderState.RECOVERING
            session.last_error = {"message": str(e), "category": "pipeline"}
            session.timeline.append(TimelineEvent(f"Pipeline error: {e}", "error"))

        session.updated_at = datetime.utcnow()
        return session

    # -----------------------------------------------------------------------
    # Improve MVP  (targeted refinement)
    # -----------------------------------------------------------------------

    async def improve_mvp(self, session_id: str, instruction: str) -> BuildSession:
        """Targeted improvement via Gemini/Claude, then re-deploy."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        if session.state not in (BuilderState.STABLE, BuilderState.RECOVERING):
            raise ValueError(f"Cannot improve from state {session.state.value}")

        session.state = BuilderState.BUILDING
        session.build_version += 1
        session.timeline.append(TimelineEvent(f"Improvement v{session.build_version}: {instruction[:60]}...", "info"))

        try:
            def on_event(step: str, message: str, data: Optional[Dict] = None):
                session.timeline.append(TimelineEvent(message, "info"))
                session.updated_at = datetime.utcnow()

            pipeline = MVPPipeline(on_event=on_event)
            result = await pipeline.improve_mvp(
                instruction=instruction,
                existing_files=session.files,
                architecture=session.architecture or {},
                sandbox_id=session.sandbox_id,
            )

            if result.app:
                session.files = result.app.get("files", session.files)
            if result.preview_url:
                session.preview_url = result.preview_url

            session.state = BuilderState.STABLE
            session.last_stable_snapshot = {"files": session.files.copy(), "version": session.build_version}
            session.timeline.append(TimelineEvent(f"Improvement v{session.build_version} applied", "success"))

        except Exception as e:
            logger.error("improve_mvp failed: %s", e)
            session.state = BuilderState.RECOVERING
            session.last_error = {"message": str(e), "category": "improvement"}
            session.timeline.append(TimelineEvent(f"Improvement failed: {e}", "error"))

        session.updated_at = datetime.utcnow()
        return session

    # -----------------------------------------------------------------------
    # Freeze / Revert
    # -----------------------------------------------------------------------

    async def freeze(self, session_id: str) -> BuildSession:
        """Freeze the build — make it immutable and deployment-ready."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        if session.state != BuilderState.STABLE:
            raise ValueError(f"Can only freeze from STABLE state (current: {session.state.value})")

        session.state = BuilderState.FROZEN
        session.timeline.append(TimelineEvent("Build frozen — ready for production deployment", "success"))
        session.updated_at = datetime.utcnow()
        return session

    async def revert(self, session_id: str) -> BuildSession:
        """Revert to the last stable snapshot."""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        if not session.last_stable_snapshot:
            raise ValueError("No stable snapshot to revert to")

        session.files = session.last_stable_snapshot["files"]
        session.build_version = session.last_stable_snapshot["version"]
        session.state = BuilderState.STABLE
        session.last_error = None
        session.timeline.append(TimelineEvent(f"Reverted to v{session.build_version}", "info"))
        session.updated_at = datetime.utcnow()
        return session
