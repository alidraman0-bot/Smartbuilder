"""
Test if idea_seeds table exists and can be written to
"""
from app.core.supabase import get_service_client
import logging
import uuid
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = get_service_client()
    logger.info("Testing idea_seeds table...")
    
    # Try to query the table first
    result = client.table("idea_seeds").select("*").limit(1).execute()
    logger.info(f"✅ Table exists, found {len(result.data)} rows")
    
    # Try to insert a test seed
    test_seed = {
        'id': str(uuid.uuid4()),
        'project_id': '00000000-0000-0000-0000-000000000000',
        'user_id': None,
        'seed_hash': 'test_hash_' + str(uuid.uuid4()),
        'crypto_entropy': 'test_entropy',
        'timestamp_bucket': datetime.utcnow().isoformat(),
        'status': 'reserved',
        'geography_id': 1,
        'industry_id': 1,
        'problem_id': 1,
        'persona_id': 1,
        'constraint_id': 1,
        'technology_id': 1,
        'business_model_id': 1
    }
    
    logger.info("Attempting to insert test seed...")
    insert_result = client.table("idea_seeds").insert(test_seed).execute()
    
    if insert_result.data:
        logger.info(f"✅ Successfully inserted test seed: {insert_result.data[0]['id']}")
        # Clean up
        client.table("idea_seeds").delete().eq("id", insert_result.data[0]['id']).execute()
        logger.info("✅ Cleaned up test seed")
    else:
        logger.warning("⚠️  Insert returned no data")
        
except Exception as e:
    logger.error(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
