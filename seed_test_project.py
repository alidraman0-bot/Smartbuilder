import asyncio
import uuid
import logging
from app.core.supabase import get_service_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_test_project():
    supabase = get_service_client()
    
    # 1. Ensure an idea exists
    logger.info("Ensuring a test idea exists...")
    idea_data = {
        "project_id": "00000000-0000-0000-0000-000000000000",
        "title": "AI-Powered Personal Chef",
        "idea_text": "An app that generates recipes based on what's in your fridge using computer vision.",
        "opportunity_score": 8.5
    }
    idea_res = supabase.table("ideas").insert(idea_data).execute()
    if not idea_res.data:
        # Try to find an existing one
        idea_res = supabase.table("ideas").select("*").limit(1).execute()
        if not idea_res.data:
            logger.error("Failed to create or find an idea.")
            return
    
    idea = idea_res.data[0]
    idea_id = idea["id"]
    logger.info(f"Using idea: {idea['title']} (ID: {idea_id})")

    # 2. Create a startup project
    logger.info("Creating a test startup project...")
    project_data = {
        "startup_name": "ChefAI",
        "current_stage": "IDEA",
        "idea_id": idea_id
    }
    project_res = supabase.table("startup_projects").insert(project_data).execute()
    
    if project_res.data:
        logger.info(f"✅ Created test project: {project_res.data[0]}")
    else:
        logger.error("❌ Failed to create test project")

if __name__ == "__main__":
    asyncio.run(create_test_project())
