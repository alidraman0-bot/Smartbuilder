import asyncio
import os
from app.core.ai_client import get_ai_client, AIProvider
from app.core.supabase import supabase
from app.core.config import settings

async def discover():
    # 1. List Gemini Models
    print("--- Gemini Models ---")
    client = get_ai_client()
    gemini_client = client.clients.get(AIProvider.GEMINI)
    if gemini_client:
        try:
            models = gemini_client.models.list()
            for m in models:
                print(f"Model: {m.name}, Supported: {m.supported_methods}")
        except Exception as e:
            print(f"Failed to list Gemini models: {e}")
    else:
        print("Gemini client not initialized")

    # 2. Check build_plans columns
    print("\n--- build_plans Schema ---")
    try:
        # Try a select * with limit 0 to see if it gives any hint or just use rest interface
        response = supabase.table("build_plans").select("*").limit(1).execute()
        if response.data:
            print(f"Columns in build_plans: {list(response.data[0].keys())}")
        else:
            print("No data in build_plans to infer columns.")
            # Try to insert a dummy and see what fails? No, let's try to get schema via RPC if available or just check logs.
            # Actually, the error message specifically said 'build_mode' was missing.
            # Let's try to find what columns ARE there by trying a minimal insert.
    except Exception as e:
        print(f"Failed to check build_plans schema: {e}")

if __name__ == "__main__":
    asyncio.run(discover())
