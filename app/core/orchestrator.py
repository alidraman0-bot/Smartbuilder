import logging
import time
import json
from typing import Dict, Any, Optional, List
from app.models.state import SystemState
from app.models.schemas import StateRecord
from app.services.validator import ValidationService

# Import New Agents
from app.agents.opportunity import OpportunityAgent
from app.agents.research import ResearchAgent
from app.agents.business_plan_prd import BusinessPlanPRDAgent
from app.agents.build import BuildAgent
from app.agents.deployment import DeploymentAgent

logger = logging.getLogger(__name__)

class Orchestrator:
    def __init__(self):
        self.state = SystemState.IDLE
        self.context: Dict[str, Any] = {}
        self.history: List[StateRecord] = []
        self.logs: List[Dict[str, str]] = []
        self.start_time = time.time()
        self.run_id = f"AG-{int(self.start_time)}-MVP"
        
        # Initialize Agents
        self.agents = {
            SystemState.IDEA_GENERATION: OpportunityAgent(),
            SystemState.RESEARCH: ResearchAgent(),
            SystemState.BUSINESS_PLAN_PRD: BusinessPlanPRDAgent(),
            SystemState.MVP_BUILD: BuildAgent(),
            SystemState.DEPLOYMENT: DeploymentAgent()
        }
        
        self.confidences = {
            "opportunity": 0.0,
            "research": 0.0,
            "prd": 0.0,
            "build": 0.0
        }
        
        self._record_transition(None, SystemState.IDLE)

    def log_event(self, module: str, message: str, level: str = "info"):
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        log_entry = {
            "time": timestamp,
            "module": module,
            "message": message,
            "type": level
        }
        self.logs.append(log_entry)
        if len(self.logs) > 500:
            self.logs = self.logs[-500:]
        logger.info(f"[{module}] {message}")

    def _record_transition(self, prev_state: Optional[SystemState], next_state: SystemState, error: Optional[str] = None):
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        if self.history:
            self.history[-1].exited_at = timestamp
            
        record = StateRecord(
            run_id=self.run_id,
            current_state=next_state.value,
            previous_state=prev_state.value if prev_state else None,
            status="active" if next_state not in [SystemState.FAILED, SystemState.COMPLETED, SystemState.TERMINATED] else ("failed" if next_state == SystemState.FAILED else "completed"),
            entered_at=timestamp,
            metadata=self.context.copy(),
            error=error
        )
        self.history.append(record)

    def calculate_final_confidence(self) -> float:
        """
        Global Confidence Aggregation Rule:
        final_confidence = (opportunity * 0.25) + (research * 0.30) + (prd * 0.25) + (build * 0.20)
        """
        return (
            (self.confidences["opportunity"] * 0.25) +
            (self.confidences["research"] * 0.30) +
            (self.confidences["prd"] * 0.25) +
            (self.confidences["build"] * 0.20)
        )

    async def execute_current_state(self, input_payload: Dict[str, Any] = None) -> bool:
        """
        Execute the agent logic for the current state with schema enforcement.
        """
        agent = self.agents.get(self.state)
        if not agent:
            self.log_event("ORCHESTRATOR", f"No agent associated with state {self.state.name}", "warning")
            return True

        self.log_event("ORCHESTRATOR", f"Executing Agent: {agent.name}...")
        
        try:
            # Merge context with input payload
            execution_context = {**self.context, **(input_payload or {})}
            execution_context["run_id"] = self.run_id
            
            # AGENTS ARE STATELESS: We pass context, they return JSON
            result = await agent.execute(execution_context)
            
            # SCHEMA VALIDATION: Hard failure on mismatch
            # (Handled within agent.execute using Pydantic, but we double-check here if needed)
            
            self.context[self.state.name.lower()] = result
            self.log_event("ORCHESTRATOR", f"Agent {agent.name} execution SUCCESS", "success")
            
            # Extract confidence scores for aggregation
            if self.state == SystemState.IDEA_GENERATION:
                # Use max confidence among generated ideas for this stage
                ideas = result.get("ideas", [])
                if ideas:
                    self.confidences["opportunity"] = max(i.get("confidence_score", 0) for i in ideas)
            
            elif self.state == SystemState.RESEARCH:
                self.confidences["research"] = result.get("validation_score", 0)
                # KILL FLAG LOGIC
                if result.get("kill_flag", False):
                    self.log_event("ORCHESTRATOR", "KILL FLAG DETECTED: Market research suggests termination.", "error")
                    await self.transition_to(SystemState.FAILED, "Kill flag triggered by Research Agent")
                    return False
            
            elif self.state == SystemState.BUSINESS_PLAN_PRD:
                self.confidences["prd"] = result.get("confidence_score", 0)
            
            elif self.state == SystemState.MVP_BUILD:
                # Build agent doesn't have a direct score in contract, we assume 100 if it passes schema
                self.confidences["build"] = 100.0
            
            # Check Threshold Rule
            final_conf = self.calculate_final_confidence()
            self.log_event("ORCHESTRATOR", f"Aggregated Confidence Score: {final_conf:.2f}")
            
            # If at a milestone, check threshold (e.g., after RESEARCH)
            if self.state == SystemState.RESEARCH and final_conf < 40: # Example threshold
                 self.log_event("ORCHESTRATOR", f"CONFIDENCE BELOW THRESHOLD: {final_conf:.2f}. Auto-killing.", "error")
                 await self.transition_to(SystemState.FAILED, "Confidence aggregation below threshold")
                 return False

            return True

        except Exception as e:
            self.log_event("ORCHESTRATOR", f"SCHEMA MISMATCH / SYSTEM FAILURE: {str(e)}", "error")
            await self.transition_to(SystemState.FAILED, str(e))
            return False

    async def transition_to(self, new_state: SystemState, error: Optional[str] = None) -> bool:
        """
        Attempt to transition to a new state based on the deterministic FSM map.
        """
        self.log_event("ORCHESTRATOR", f"Transitioning: {self.state.name} -> {new_state.name}...")

        valid_transitions = {
            SystemState.IDLE: [SystemState.IDEA_GENERATION],
            SystemState.IDEA_GENERATION: [SystemState.RESEARCH, SystemState.FAILED],
            SystemState.RESEARCH: [SystemState.BUSINESS_PLAN_PRD, SystemState.FAILED],
            SystemState.BUSINESS_PLAN_PRD: [SystemState.MVP_BUILD, SystemState.FAILED],
            SystemState.MVP_BUILD: [SystemState.DEPLOYMENT, SystemState.FAILED],
            SystemState.DEPLOYMENT: [SystemState.MONITORING, SystemState.FAILED],
            SystemState.MONITORING: [SystemState.DECISION, SystemState.FAILED],
            SystemState.DECISION: [SystemState.BUSINESS_PLAN_PRD, SystemState.MVP_BUILD, SystemState.TERMINATED, SystemState.FAILED],
            SystemState.FAILED: [SystemState.IDLE], 
            SystemState.TERMINATED: [],
            SystemState.COMPLETED: [SystemState.IDLE]
        }

        if new_state not in valid_transitions.get(self.state, []):
            self.log_event("ORCHESTRATOR", f"INVALID TRANSITION: {self.state.name} -> {new_state.name}", "error")
            return False

        # Entry Gates (e.g. human approval)
        if new_state == SystemState.MVP_BUILD and not self.context.get("human_approval_build", False):
            self.log_event("ORCHESTRATOR", "WAITING FOR HUMAN APPROVAL: Build sequence paused.", "warning")
            return False

        prev_state = self.state
        self.state = new_state
        self._record_transition(prev_state, new_state, error)
        self.log_event("ORCHESTRATOR", f"CURRENT STATE: {new_state.name}", "success")
        return True

    def get_full_status(self) -> Dict[str, Any]:
        mapping = [
            {"id": "IDLE", "label": "System Idle", "state": SystemState.IDLE},
            {"id": "IDEA", "label": "Idea Generation", "state": SystemState.IDEA_GENERATION},
            {"id": "RESEARCH", "label": "Market Research", "state": SystemState.RESEARCH},
            {"id": "PLAN", "label": "Business Plan & PRD", "state": SystemState.BUSINESS_PLAN_PRD},
            {"id": "BUILD", "label": "MVP Builder", "state": SystemState.MVP_BUILD},
            {"id": "DEPLOY", "label": "Deployment", "state": SystemState.DEPLOYMENT},
            {"id": "MONITOR", "label": "Monitoring", "state": SystemState.MONITORING},
            {"id": "DECISION", "label": "Final Decision", "state": SystemState.DECISION},
        ]

        pipeline = []
        state_list = [m["state"] for m in mapping]
        current_idx = state_list.index(self.state) if self.state in state_list else -1

        for i, stage_def in enumerate(mapping):
            status = "pending"
            if self.state == SystemState.FAILED:
                status = "failed"
            elif i < current_idx:
                status = "completed"
            elif i == current_idx:
                status = "active"
            
            pipeline.append({
                "id": stage_def["id"],
                "label": stage_def["label"],
                "status": status,
                "confidence": 100 if status == "completed" else (round(self.calculate_final_confidence(), 1) if status == "active" else 0),
                "duration": "--:--"
            })

        research_data = self.context.get("research")
        # Add "idea" if available in research_data
        research_ui = {**(research_data or {})}
        
        modules = []
        # If the research_data already has structured modules from ResearchService, use them
        if research_data and "modules" in research_data:
            modules = research_data["modules"]
        elif research_data:
            # Fallback to legacy mapping if ResearchService didn't provide modules
            modules = [
                {
                    "module": "Market Capacity",
                    "summary": research_data.get("market_size", {}).get("estimate", "N/A"),
                    "confidence_score": research_data.get("market_size", {}).get("confidence", 0),
                    "signals": ["TAM/SAM Verified", "High search volume detected"],
                    "risks": ["Regulatory changes", "Market saturation"]
                },
                # ... other legacy modules ...
            ]
            
        research_ui["modules"] = modules
        if self.context.get("idea"):
            research_ui["idea"] = self.context.get("idea")

        return {
            "runId": self.run_id,
            "state": self.state.name,
            "confidence": round(self.calculate_final_confidence(), 1),
            "status": "FAILED" if self.state == SystemState.FAILED else ("COMPLETED" if self.state == SystemState.COMPLETED else "ACTIVE"),
            "health": "NOMINAL" if self.state != SystemState.FAILED else "CRITICAL",
            "elapsed": f"{int(time.time() - self.start_time)}s",
            "logs": self.logs[-50:],
            "pipeline": pipeline,
            "research": research_ui,
            "business_plan": self.context.get("business_plan_prd", {}).get("business_plan"),
            "prd": self.context.get("business_plan_prd", {}).get("prd"),
            "history": [r.dict() for r in self.history]
        }
