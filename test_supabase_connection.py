"""
Quick script to test Supabase connection and check if dimension tables exist
"""
from app.core.supabase import get_service_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = get_service_client()
    logger.info("Successfully got service client")
    
    # Try to query one of the dimension tables
    result = client.table("idea_dimensions_geography").select("*").limit(5).execute()
    
    if result.data:
        logger.info(f"✅ Found {len(result.data)} rows in idea_dimensions_geography")
        logger.info(f"Sample: {result.data[0]}")
    else:
        logger.warning("⚠️  Table exists but has no data")
        
except Exception as e:
    logger.error(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
