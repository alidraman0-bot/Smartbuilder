import os
import logging
from supabase import create_client, Client, create_async_client, AsyncClient
from app.core.config import settings

logger = logging.getLogger(__name__)

url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY
service_role_key: str = settings.SUPABASE_SERVICE_ROLE_KEY

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

# Public/Anon Client (Respects RLS)
supabase: Client = create_client(url, key)

# Async Clients
async_client: AsyncClient = None
async_service_client: AsyncClient = None

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
    """Return the global Supabase service role client."""
    if service_client is None:
        # Fallback to anon client if service client not initialized
        logger.warning(f"Returning ANON client instead of service role client!")
        return supabase
    return service_client

async def get_async_supabase() -> AsyncClient:
    global async_client
    if async_client is None:
        async_client = await create_async_client(url, key)
    return async_client

async def get_async_service_client() -> AsyncClient:
    global async_service_client
    if async_service_client is None:
        if service_role_key:
            async_service_client = await create_async_client(url, service_role_key)
        else:
            async_service_client = await get_async_supabase()
    return async_service_client
