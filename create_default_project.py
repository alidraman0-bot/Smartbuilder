"""
Create the default project that's required for idea generation
"""
from app.core.supabase import get_service_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = get_service_client()
    
    # Check if default project exists
    result = client.table("projects").select("*").eq("project_id", "00000000-0000-0000-0000-000000000000").execute()
    
    if result.data:
        logger.info(f"✅ Default project already exists: {result.data[0]}")
    else:
        logger.info("Creating default project...")
        
        # Create default project
        new_project = client.table("projects").insert({
            "project_id": "00000000-0000-0000-0000-000000000000",
            "name": "Default Genesis Project",
            "framework": "Next.js",
            "status": "active"
        }).execute()
        
        if new_project.data:
            logger.info(f"✅ Created default project: {new_project.data[0]}")
        else:
            logger.error("❌ Failed to create default project")
            
except Exception as e:
    logger.error(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
