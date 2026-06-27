import asyncio
from app.core.supabase import supabase

async def list_tables():
    print("--- Listing Tables ---")
    try:
        # One way to list tables in Supabase/PostgREST is querying the information_schema via RPC or just trying common names
        # But we can also use a 'select' on a non-existent table and look at the 'hint' more carefully or use a known RPC if it exists.
        # Alternatively, we can try to query a system table if RLS allows.
        
        # Let's try to get table names via a common pattern in PostgREST environments if they have a 'rpc' for it
        # Actually, let's try a broad select from something that might exist or just try to trigger the 'hint' again with a different name.
        
        response = supabase.table("non_existent_table_xyz").select("*").limit(0).execute()
        print(response)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_tables())
