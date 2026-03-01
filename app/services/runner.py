from typing import Dict, Any, List
from app.core.orchestrator import Orchestrator
from app.models.state import SystemState
from app.agents.research import ResearchAgent
from app.agents.business_plan import BusinessPlanAgent
from app.agents.prd import PRDAgent
import logging
from app.services.research_service import research_service
from app.services.builder_service import builder_service
from app.services.blueprint_service import BlueprintService

logger = logging.getLogger(__name__)

class Runner:
    def __init__(self, orchestrator: Orchestrator = None):
        from app.services.fsm_service import orchestrator_singleton
        self.orchestrator = orchestrator or orchestrator_singleton
        self.research_agent = ResearchAgent()
        self.bp_agent = BusinessPlanAgent()
        self.prd_agent = PRDAgent()

    async def start_research_from_idea(self, idea: Dict[str, Any]):
        """
        Jump straight to Research stage for a pre-selected idea.
        """
        self.orchestrator.log_event("RUNNER", f"Promoting specific idea to research: {idea.get('title')}")
        
        # 1. Skip Generation, go to Research
        # We manually set the state to IDEA_GENERATION first if we are in IDLE, 
        # so the transition logic allows going to RESEARCH.
        if self.orchestrator.state == SystemState.IDLE:
             self.orchestrator.state = SystemState.IDEA_GENERATION

        if not await self.orchestrator.transition_to(SystemState.RESEARCH):
            return "Failed to transition to Research"
        
        # 2. Set the Idea in context
        self.orchestrator.context["idea"] = idea
        
        # 3. Execute Research
        if not await self.orchestrator.execute_current_state():
            return "Research execution failed"
            
        # 4. Phase 1 Complete (BP & PRD)
        if not await self.orchestrator.transition_to(SystemState.BUSINESS_PLAN_PRD):
             return "Failed to enter Business Plan & PRD stage"
             
        research_out = self.orchestrator.context.get("research", {})
        self.orchestrator.context["validated_idea"] = idea
        self.orchestrator.context["research_summary"] = research_out
        
        if not await self.orchestrator.execute_current_state():
            return "Business Plan & PRD execution failed"
            
        self.orchestrator.log_event("RUNNER", "Autonomous Research & Planning phase complete.", "success")
        return "Promotion Successful"

    async def run_autonomously(self, opportunity: str):
        """
        Execute the full lifecycle: Idea -> Monitoring
        """
        self.orchestrator.log_event("RUNNER", f"Starting full orchestration for: {opportunity}")
        
        # 1. Idea Generation
        if not await self.orchestrator.transition_to(SystemState.IDEA_GENERATION):
            return "Failed to start Idea Generation"
        
        # Inject signals/theme if available
        await self.orchestrator.execute_current_state({"opportunity": opportunity})
        
        # 2. Research
        if not await self.orchestrator.transition_to(SystemState.RESEARCH):
            return "Failed to start Research"
        
        # Prepare context for Research (needs "idea" which was produced by IDEA_GENERATION)
        ideas = self.orchestrator.context.get("idea_generation", {}).get("ideas", [])
        if not ideas:
            return "No ideas produced by generation stage"
        
        # We pick the first idea for the autonomous run
        selected_idea = ideas[0]
        self.orchestrator.context["idea"] = selected_idea 
        
        if not await self.orchestrator.execute_current_state():
            return "Research execution failed"
        
        # 3. Business Plan & PRD
        if not await self.orchestrator.transition_to(SystemState.BUSINESS_PLAN_PRD):
             return "Failed to enter Business Plan & PRD stage"
             
        # Map research output names to agent contract expectations
        research_out = self.orchestrator.context.get("research", {})
        self.orchestrator.context["validated_idea"] = selected_idea
        self.orchestrator.context["research_summary"] = research_out
        
        if not await self.orchestrator.execute_current_state():
            return "Business Plan & PRD execution failed"
        
        self.orchestrator.log_event("RUNNER", "Phase 1 Complete. Awaiting human approval for Build.", "success")
        
        # 4. Auto-generate Blueprint
        try:
            blueprint_service = BlueprintService()
            await blueprint_service.generate_blueprint(
                idea=selected_idea.get('title', opportunity),
                research=research_out,
                prd=self.orchestrator.context.get("business_plan_prd", {}).get("prd"),
                project_id=self.orchestrator.project_id
            )
            self.orchestrator.log_event("BLUEPRINT", "Startup Blueprint auto-generated.", "success")
        except Exception as e:
            logger.error(f"Failed to auto-generate blueprint: {e}")

        return {
            "status": "SUCCESS",
            "run_id": self.orchestrator.run_id,
            "next_steps": "Set human_approval_build=True in context to proceed."
        }
    
    async def initiate_mvp_build(self):
        """
        Handle construction sequence.
        """
        if self.orchestrator.state != SystemState.MVP_BUILD:
            return "Invalid state for Build"
            
        # Context should already have 'prd' from previous stage
        if not await self.orchestrator.execute_current_state():
            return "Build execution failed"
            
        self.orchestrator.log_event("MVP_BUILDER", "Autonomous construction completed.", "success")
        return "Construction successful."
