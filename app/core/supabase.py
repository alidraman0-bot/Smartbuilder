import os
from supabase import create_client, Client
from app.core.config import settings

url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

supabase: Client = create_client(url, key)
