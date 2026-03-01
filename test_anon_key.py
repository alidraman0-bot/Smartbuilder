from app.core.supabase import get_supabase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = get_supabase()
    logger.info("Testing Supabase with ANON key...")
    # Just try to get something public or anything
    result = client.table("idea_seeds").select("*").limit(1).execute()
    logger.info(f"✅ Success! Found {len(result.data)} rows")
except Exception as e:
    logger.error(f"❌ Error: {e}")
