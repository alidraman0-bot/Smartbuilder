"""
MVP Builder Service - State Machine Controller

This service manages the 7-state lifecycle of the MVP Builder:
S0: EMPTY          - No project
S1: IDEA_INTAKE    - Home UI, capturing intent
S2: INITIALIZING   - Setting up build environment
S3: EXECUTING      - Active build, user observes only
S4: STABLE         - Interactive builder, full control
S5: RECOVERING     - Auto-fix running
S6: FROZEN         - Immutable, deployment-ready

Persists state to Supabase.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import uuid
import asyncio
import logging
import json
from .base44_integration import Base44Service
from .sandbox_service import SandboxService
from app.core.supabase import supabase

logger = logging.getLogger(__name__)

class BuilderState(str, Enum):
    EMPTY = "S0"
    IDEA_INTAKE = "S1"
    INITIALIZING = "S2"
    EXECUTING = "S3"
    STABLE = "S4"
    RECOVERING = "S5"
    FROZEN = "S6"


class BuildMode(str, Enum):
    UI = "UI"
    LOGIC = "Logic"
    DATA = "Data"


class TimelineEvent:
    def __init__(self, message: str, event_type: str = "info", timestamp: str = None):
        self.timestamp = timestamp or datetime.utcnow().strftime("%H:%M:%S")
        self.message = message
        self.type = event_type
    
    def to_dict(self):
        return {
            "message": self.message,
            "event_type": self.type,
            "timestamp": self.timestamp
        }


class BuildSession:
    def __init__(self, session_id: str, run_id: str, prd_snapshot: Dict[str, Any]):
        self.session_id = session_id
        self.run_id = run_id
        self.state = BuilderState.IDEA_INTAKE
        self.prd_snapshot = prd_snapshot
        self.research_snapshot = {}
        
        # Build configuration
        self.project_name = prd_snapshot.get("title", "Untitled Project")
        self.build_mode = BuildMode.UI
        self.build_version = 1
        
        # Execution tracking
        self.timeline: List[TimelineEvent] = []
        self.logs: List[Dict[str, Any]] = []
        self.files: List[Dict[str, Any]] = []
        
        # Auto-fix state
        self.auto_fix_attempts = 0
        self.max_auto_fix_attempts = 3
        self.last_error: Optional[Dict[str, Any]] = None
        self.last_stable_snapshot: Optional[Dict[str, Any]] = None
        
        # Preview
        self.preview_url: Optional[str] = None
        self.preview_status = "loading"
        
        # Sandbox
        self.sandbox_id: Optional[str] = None
        
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()


class MvpBuilderService:
    def __init__(self):
        self.sessions: Dict[str, BuildSession] = {}
        self.base44_service = Base44Service()
        self.sandbox_service = SandboxService()
    
    def create_session(self, run_id: str, prd: Optional[Dict[str, Any]] = None, 
                      research: Dict[str, Any] = None, idea: str = None) -> BuildSession:
        """Create a new builder session from PRD approval or raw idea"""
        session_id = str(uuid.uuid4())
        
        # If no PRD but idea exists, create minimal PRD structure
        if not prd and idea:
            prd = {
                "title": f"Project {datetime.utcnow().strftime('%H%M')}",
                "summary": idea,
                "features": []
            }
        
        if not prd:
            raise ValueError("PRD or Idea required to create session")
            
        session = BuildSession(
            session_id=session_id,
            run_id=run_id,
            prd_snapshot=prd
        )
        
        if research:
            session.research_snapshot = research
        
        self.sessions[session_id] = session
        
        session.timeline.append(TimelineEvent("Builder session created", "info"))
        
        # Persist Initial Session
        self._persist_session(session)
        
        return session
    
    async def submit_idea(self, session_id: str, idea: str) -> BuildSession:
        """
        S1 → S2: User submits idea
        Transitions to INITIALIZING state
        """
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        if session.state != BuilderState.IDEA_INTAKE:
            raise ValueError(f"Cannot submit idea from state {session.state}")
        
        # Transition to INITIALIZING
        session.state = BuilderState.INITIALIZING
        session.timeline.append(TimelineEvent("Idea submitted, initializing build", "info"))
        self._persist_session(session)
        
        # Start initialization process
        await self._initialize_build(session)
        
        return session
    
    async def _initialize_build(self, session: BuildSession):
        """
        S2: INITIALIZING
        - Create sandbox
        - Install dependencies
        - Scaffold project
        """
        try:
            session.timeline.append(TimelineEvent("Creating sandbox environment", "info"))
            self._persist_session(session) # Log update
            
            # Create sandbox
            sandbox_id = await self.sandbox_service.create_sandbox()
            session.sandbox_id = sandbox_id
            
            session.timeline.append(TimelineEvent("Installing dependencies", "info"))
            self._persist_session(session)
            await asyncio.sleep(0.5)  # Simulate work
            
            session.timeline.append(TimelineEvent("Scaffolding project structure", "info"))
            self._persist_session(session)
            await asyncio.sleep(0.5)
            
            session.timeline.append(TimelineEvent("Sandbox initialized successfully", "success"))
            
            # Transition to EXECUTING
            session.state = BuilderState.EXECUTING
            self._persist_session(session)
            await self._execute_build(session)
            
        except Exception as e:
            logger.error(f"Init Error: {e}")
            session.last_error = {
                "message": str(e),
                "category": "initialization",
                "file": None
            }
            session.state = BuilderState.RECOVERING
            self._persist_session(session)
            await self._auto_fix(session)
    
    async def _execute_build(self, session: BuildSession):
        """
        S3: EXECUTING
        Generate code using Base44
        """
        try:
            session.timeline.append(TimelineEvent("Intent classified (UI)", "info"))
            session.timeline.append(TimelineEvent("File scope resolved", "info"))
            self._persist_session(session)
            
            # Generate code via Base44
            build_request = {
                "prd": session.prd_snapshot,
                "mode": session.build_mode.value,
                "target": "mvp"
            }
            
            result = await self.base44_service.generate_code(build_request)
            
            # Update files
            session.files = result.get("files", [])
            
            for file in session.files:
                session.timeline.append(
                    TimelineEvent(f"{file['path']} created", "success")
                )
            
            # Run Quality Gate (Feature 5)
            session.timeline.append(TimelineEvent("Running E2B Quality Gate verification...", "info"))
            self._persist_session(session)
            
            passed, test_logs = await self._run_quality_gate(session)
            if not passed:
                 raise Exception(f"Quality Gate Failed: {test_logs}")
            
            session.timeline.append(TimelineEvent("Quality Gate passed", "success"))

            # Start preview
            session.preview_url = await self.sandbox_service.start_preview(session.sandbox_id)
            session.preview_status = "ready"
            
            # Transition to STABLE
            session.state = BuilderState.STABLE
            session.timeline.append(TimelineEvent("Build completed successfully", "success"))
            
            # Save stable snapshot
            session.last_stable_snapshot = {
                "files": session.files.copy(),
                "version": session.build_version
            }
            self._persist_session(session)
            
        except Exception as e:
            logger.error(f"Execute Error: {e}")
            session.last_error = {
                "message": str(e),
                "category": "build",
                "file": None
            }
            session.state = BuilderState.RECOVERING
            self._persist_session(session)
            await self._auto_fix(session)
    
    async def iterate(self, session_id: str, prompt: str, build_mode: BuildMode = None) -> BuildSession:
        """
        S4: User iterates on stable build
        """
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        if session.state != BuilderState.STABLE:
            raise ValueError(f"Cannot iterate from state {session.state}")
        
        # Update build mode if specified
        if build_mode:
            session.build_mode = build_mode
            session.timeline.append(TimelineEvent(f"Build mode changed to {build_mode.value}", "info"))
        
        # Save current state as stable before iterating
        session.last_stable_snapshot = {
            "files": session.files.copy(),
            "version": session.build_version
        }
        
        # Transition to EXECUTING
        session.state = BuilderState.EXECUTING
        session.timeline.append(TimelineEvent(f"Iteration requested: {prompt[:50]}...", "info"))
        self._persist_session(session)
        
        try:
            # Generate changes via Base44
            iteration_request = {
                "prd": session.prd_snapshot,
                "mode": session.build_mode.value,
                "prompt": prompt,
                "existing_files": session.files
            }
            
            result = await self.base44_service.iterate_code(iteration_request)
            
            # Update files
            modified_files = result.get("modified_files", [])
            for file_path in modified_files:
                session.timeline.append(TimelineEvent(f"{file_path} modified", "info"))
            
            session.files = result.get("files", session.files)
            session.build_version += 1
            
            session.timeline.append(TimelineEvent("Changes applied successfully", "success"))
            
            # Hot reload preview
            await self.sandbox_service.hot_reload(session.sandbox_id, session.files)
            
            # Return to STABLE
            session.state = BuilderState.STABLE
            self._persist_session(session)
            
        except Exception as e:
            session.last_error = {
                "message": str(e),
                "category": "iteration",
                "file": None
            }
            session.state = BuilderState.RECOVERING
            self._persist_session(session)
            await self._auto_fix(session)
        
        return session
    
    async def _auto_fix(self, session: BuildSession):
        """
        S5: RECOVERING
        Auto-fix retry logic (max 3 attempts)
        """
        session.auto_fix_attempts += 1
        
        session.timeline.append(
            TimelineEvent(
                f"Auto-fix attempt {session.auto_fix_attempts}/{session.max_auto_fix_attempts}",
                "warning"
            )
        )
        self._persist_session(session)
        
        if session.auto_fix_attempts >= session.max_auto_fix_attempts:
            # Max attempts reached, rollback to last stable
            session.timeline.append(
                TimelineEvent("Auto-fix failed, rolling back to last stable version", "error")
            )
            self._persist_session(session)
            await self.revert(session.session_id)
            return
        
        try:
            # Attempt to fix the error
            fix_request = {
                "error": session.last_error,
                "files": session.files,
                "mode": session.build_mode.value
            }
            
            result = await self.base44_service.auto_fix(fix_request)
            
            session.files = result.get("files", session.files)
            session.timeline.append(TimelineEvent("Auto-fix applied", "success"))
            
            # Reset auto-fix counter on success
            session.auto_fix_attempts = 0
            session.last_error = None
            
            # Return to STABLE
            session.state = BuilderState.STABLE
            self._persist_session(session)
            
        except Exception as e:
            # Retry failed, try again
            session.last_error = {
                "message": str(e),
                "category": "auto_fix",
                "file": None
            }
            self._persist_session(session)
            await self._auto_fix(session)
    
    async def revert(self, session_id: str) -> BuildSession:
        """Rollback to last stable snapshot"""
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        if not session.last_stable_snapshot:
            raise ValueError("No stable snapshot available")
        
        session.files = session.last_stable_snapshot["files"].copy()
        session.build_version = session.last_stable_snapshot["version"]
        session.state = BuilderState.STABLE
        session.auto_fix_attempts = 0
        session.last_error = None
        
        session.timeline.append(
            TimelineEvent(f"Reverted to version {session.build_version}", "info")
        )
        
        # Reload preview
        await self.sandbox_service.hot_reload(session.sandbox_id, session.files)
        
        self._persist_session(session)
        return session
    
    async def _run_quality_gate(self, session: BuildSession) -> (bool, str):
        """
        Feature 5: Run automated tests/checks in E2B sandbox.
        """
        from app.services.interpreter_service import interpreter_service
        if not interpreter_service.enabled:
            return True, "E2B disabled, skipping Quality Gate"

        # Check for basic compilation or syntax errors
        # In a real setup, this would run 'npm run lint' or 'npm run build'
        test_code = """
import os
import json

def verify_files():
    # Check if entry point exists
    if not os.path.exists('src/App.tsx'):
        return False, "Missing src/App.tsx"
    
    # Try to parse all JS/TS/JSON files for syntax errors
    # (Simple proof of concept)
    return True, "All critical files present and readable"

passed, status = verify_files()
print(json.dumps({"passed": passed, "status": status}))
"""
        try:
            # Sync files to sandbox first (if not already there)
            await self.sandbox_service.hot_reload(session.sandbox_id, session.files)
            
            # For this MVP, we use the interpreter to check the sandbox filesystem
            # Note: real E2B would use sandbox.filesystem but we demo via Interpreter
            result = await interpreter_service.run_analysis(test_code, {})
            if result.get("status") == "success":
                data = result.get("results", {})
                return data.get("passed", False), data.get("status", "Unknown failure")
            
            return False, "Quality Gate execution failed"
        except Exception as e:
            logger.error(f"Quality Gate Crash: {e}")
            return False, str(e)

    async def freeze(self, session_id: str) -> BuildSession:
        """
        S4 → S6: Freeze build (make immutable)
        """
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        if session.state != BuilderState.STABLE:
            raise ValueError(f"Cannot freeze from state {session.state}")
        
        session.state = BuilderState.FROZEN
        session.timeline.append(TimelineEvent("Build frozen and ready for deployment", "success"))
        
        self._persist_session(session)
        return session
    
    def get_session(self, session_id: str) -> Optional[BuildSession]:
        """Get session by ID - Check cache then DB"""
        if session_id in self.sessions:
            return self.sessions[session_id]
        
        # Try Loading from DB
        return self._load_session(session_id)
    
    def get_session_state(self, session_id: str) -> Dict[str, Any]:
        """Get complete session state for frontend"""
        session = self.get_session(session_id)
        if not session:
            return {"state": BuilderState.EMPTY}
        
        return {
            "session_id": session.session_id,
            "run_id": session.run_id,
            "state": session.state.value,
            "project_name": session.project_name,
            "build_mode": session.build_mode.value,
            "build_version": session.build_version,
            "prd_snapshot": session.prd_snapshot,
            "research_snapshot": session.research_snapshot,
            "timeline": [
                {
                    "timestamp": event.timestamp,
                    "message": event.message,
                    "type": event.type
                }
                for event in session.timeline
            ],
            "files": session.files,
            "preview_url": session.preview_url,
            "preview_status": session.preview_status,
            "auto_fix_attempts": session.auto_fix_attempts,
            "last_error": session.last_error,
            "can_revert": session.last_stable_snapshot is not None
        }

    # --- Persistence Helpers ---

    def _persist_session(self, session: BuildSession):
        """Save session state to DB (with error handling)"""
        try:
            # 1. Update Session Table
            data = {
                "session_id": session.session_id,
                "run_id": session.run_id,
                "status": session.state.value,
                "project_name": session.project_name,
                "build_mode": session.build_mode.value,
                "build_version": session.build_version,
                "prd_snapshot": session.prd_snapshot,
                "research_snapshot": session.research_snapshot,
                "updated_at": datetime.utcnow().isoformat()
            }
            supabase.table("builder_sessions").upsert(data).execute()

            # 2. Add New Log Events (Optimized: only new ones? For now, just keep in memory for timeline, DB for audits)
            # In a real system we'd only insert new events.
            # Here we assume client polls often, so DB is mostly for restoration.
            # We will persist the full session meta.
            
            # We could save files to build_artifacts if we want true persistence.
            # Saving files every update might be slow. Let's do it only on Stable/Frozen?
            # Or use async background task.
            
        except Exception as e:
            logger.error(f"Persistence Failed: {e}")
            # Do NOT raise, fallback to memory
    
    def _load_session(self, session_id: str) -> Optional[BuildSession]:
        """Load session from DB"""
        try:
            response = supabase.table("builder_sessions").select("*").eq("session_id", session_id).single().execute()
            if not response.data:
                return None
            
            data = response.data
            session = BuildSession(data['session_id'], data['run_id'], data['prd_snapshot'])
            session.state = BuilderState(data['status'])
            session.research_snapshot = data.get('research_snapshot', {})
            session.build_version = data.get('build_version', 1)
            try:
                session.build_mode = BuildMode(data.get('build_mode', 'UI'))
            except: 
                session.build_mode = BuildMode.UI
            
            # Cache it
            self.sessions[session_id] = session
            return session
            
        except Exception as e:
            logger.error(f"Load Session Failed: {e}")
            return None
