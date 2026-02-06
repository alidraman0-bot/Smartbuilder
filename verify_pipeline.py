import asyncio
import logging
from app.core.orchestrator import Orchestrator
from app.models.state import SystemState

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VERIFICATION")

async def run_simulation():
    orchestrator = Orchestrator()
    logger.info(f"Starting simulation for run: {orchestrator.run_id}")

    # 1. IDEA_GENERATION
    await orchestrator.transition_to(SystemState.IDEA_GENERATION)
    success = await orchestrator.execute_current_state({"theme": "Sustainable vertical farming"})
    if not success:
        logger.error("Step 1 Failed")
        return

    # 2. RESEARCH
    # Pick the first idea to research
    ideas = orchestrator.context["idea_generation"]["ideas"]
    selected_idea = ideas[0]
    logger.info(f"Selected Idea for Research: {selected_idea['title']}")
    
    await orchestrator.transition_to(SystemState.RESEARCH)
    success = await orchestrator.execute_current_state({"idea": selected_idea})
    if not success:
        logger.error("Step 2 Failed (or Kill Flag/Threshold triggered)")
        return

    # 3. BUSINESS_PLAN_PRD
    await orchestrator.transition_to(SystemState.BUSINESS_PLAN_PRD)
    success = await orchestrator.execute_current_state({
        "validated_idea": selected_idea,
        "research_summary": orchestrator.context["research"]
    })
    if not success:
        logger.error("Step 3 Failed")
        return

    # 4. MVP_BUILD
    # Need human approval flag
    orchestrator.context["human_approval_build"] = True
    await orchestrator.transition_to(SystemState.MVP_BUILD)
    success = await orchestrator.execute_current_state({
        "prd": orchestrator.context["business_plan_prd"]["prd"]
    })
    if not success:
        logger.error("Step 4 Failed")
        return

    # 5. DEPLOYMENT
    await orchestrator.transition_to(SystemState.DEPLOYMENT)
    success = await orchestrator.execute_current_state({
        "build_artifacts": orchestrator.context["mvp_build"]
    })
    if not success:
        logger.error("Step 5 Failed")
        return

    logger.info("Pipeline Simulation Completed Successfully!")
    status = orchestrator.get_full_status()
    logger.info(f"Final Confidence: {status['final_confidence']:.2f}")
    logger.info(f"Deployment URL: {orchestrator.context['deployment']['url']}")

if __name__ == "__main__":
    asyncio.run(run_simulation())
