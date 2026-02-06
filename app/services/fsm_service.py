import logging
import time
from typing import Optional, Any, Dict
from app.core.orchestrator import Orchestrator
from app.models.state import SystemState
from app.services.runner import Runner

logger = logging.getLogger(__name__)

# Singleton instance for the entire application
orchestrator_singleton = Orchestrator()

class FSMService:
    def __init__(self, orchestrator: Orchestrator):
        self.orchestrator = orchestrator
        self.runner = Runner()
        # Ensure Runner uses the global singleton
        self.runner.orchestrator = self.orchestrator

    async def start_new_run(self, opportunity: str):
        """Initializes a new run from IDLE."""
        if self.orchestrator.state != SystemState.IDLE:
             # If already running, we might want to fail or just return status
             return {"status": "ERROR", "message": "FSM already active."}
        
        # Reset context and logs for new run
        self.orchestrator.context = {}
        self.orchestrator.logs = []
        self.orchestrator.confidences = {"opportunity": 0.0, "research": 0.0, "prd": 0.0, "build": 0.0}
        
        return await self.runner.run_autonomously(opportunity)

    async def approve_build(self):
        """Human approval gate for MVP_BUILD."""
        if self.orchestrator.state != SystemState.BUSINESS_PLAN_PRD:
            return {"status": "ERROR", "message": "Cannot approve build from current state."}
        
        self.orchestrator.context["human_approval_build"] = True
        self.orchestrator.log_event("FSM", "Human approval received for Build.", "success")
        
        # Trigger transition
        success = await self.orchestrator.transition_to(SystemState.MVP_BUILD)
        if success:
            # The runner should handle the actual execution of the Build agent
            # No manual completion here if we want real data
            self.orchestrator.log_event("BUILD_SERVICE", "Build process authorized.", "info")
            return {"status": "SUCCESS", "message": "Build initiated."}
        else:
            return {"status": "ERROR", "message": "Failed to transition to MVP_BUILD."}

    async def approve_deployment(self):
        """Human approval gate for DEPLOYMENT."""
        if self.orchestrator.state != SystemState.MVP_BUILD:
             return {"status": "ERROR", "message": "Cannot approve deployment from current state."}
             
        self.orchestrator.context["human_approval_deploy"] = True
        self.orchestrator.log_event("FSM", "Human approval received for Deployment.", "success")
        
        success = await self.orchestrator.transition_to(SystemState.DEPLOYMENT)
        if success:
             self.orchestrator.log_event("DEPLOYMENT_SERVICE", "Deployment process started autonomously...", "info")
             return {"status": "SUCCESS", "message": "Deployment initiated."}
        else:
             return {"status": "ERROR", "message": "Failed to transition to DEPLOYMENT."}

    async def force_fail(self, reason: str):
        """Move to FAILED state manually or on error."""
        await self.orchestrator.transition_to(SystemState.FAILED, payload={"reason": reason})
        return {"status": "FAILED", "reason": reason}

# Singleton instance
fsm_service = FSMService(orchestrator_singleton)
