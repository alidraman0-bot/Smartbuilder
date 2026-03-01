import asyncio
import uuid
import json
import logging
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai_cofounder_service import ai_cofounder_service
from app.core.supabase import get_service_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def verify_ai_cofounder():
    supabase = get_service_client()
    
    # 1. Find a test project
    logger.info("Finding a test project...")
    project_res = supabase.table("startup_projects").select("*").limit(1).execute()
    
    if not project_res.data:
        logger.error("No projects found to test with.")
        return
    
    project = project_res.data[0]
    project_id = project["id"]
    logger.info(f"Using project: {project['startup_name']} (ID: {project_id})")

    # 2. Generate Advice
    logger.info("Generating AI Co-Founder advice...")
    advice = await ai_cofounder_service.generate_advice(uuid.UUID(project_id))
    
    if advice:
        logger.info("Advice generated successfully!")
        logger.info(f"Health Score: {advice.health_score}")
        logger.info(f"Insights: {advice.key_insights}")
        logger.info(f"Next Actions: {advice.next_actions}")
    else:
        logger.error("Failed to generate advice.")
        return

    # 3. Verify Persistence
    logger.info("Verifying persistence in Supabase...")
    persisted_advice = await ai_cofounder_service.get_latest_advice(uuid.UUID(project_id))
    
    if persisted_advice and str(persisted_advice.id) == str(advice.id):
        logger.info("Persistence verified!")
    else:
        logger.error("Persistence verification failed.")
        return

    # 4. Test Deeper Analysis
    logger.info("Testing deeper analysis...")
    query = "What is the biggest technical risk for this MVP?"
    response = await ai_cofounder_service.deeper_analysis(uuid.UUID(project_id), query)
    
    if response:
        logger.info(f"Analysis Response: {response[:100]}...")
    else:
        logger.error("Deeper analysis failed.")
        return

    logger.info("Verification complete: SUCCESS")

if __name__ == "__main__":
    asyncio.run(verify_ai_cofounder())
