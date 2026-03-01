import os
import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY
service_role_key: str = settings.SUPABASE_SERVICE_ROLE_KEY

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

# Public/Anon Client (Respects RLS)
supabase: Client = create_client(url, key)

# Service Role Client (Bypasses RLS - Use with caution)
service_client: Client = None

if service_role_key:
    try:
        if service_role_key and service_role_key.startswith("sb_publishable"):
            logger.warning("SUPABASE_SERVICE_ROLE_KEY starts with 'sb_publishable'. This appears to be an ANON key, not a SERVICE ROLE key. Backend writes will fail RLS checks.")
        
        service_client = create_client(url, service_role_key)
        logger.info("Supabase Service Role Client initialized.")
    except Exception as e:
        logger.warning(f"Failed to initialize Service Role Client: {e}")
else:
    logger.warning("SUPABASE_SERVICE_ROLE_KEY not set. Backend operations may fail RLS checks.")

def get_supabase() -> Client:
    return supabase

def get_service_client() -> Client:
    if service_client:
        return service_client
    logger.warning("Service client requested but not available. Falling back to anon client (may fail RLS).")
    return supabase
