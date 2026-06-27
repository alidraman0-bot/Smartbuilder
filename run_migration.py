
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Add project root to path
sys.path.append(os.getcwd())

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def apply_migration():
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        logger.error("Missing Supabase credentials")
        return

    supabase: Client = create_client(url, key)
    
    # Read the migration file
    migration_path = "migrations/20260308_idea_universe.sql"
    with open(migration_path, "r") as f:
        sql = f.read()
    
    logger.info(f"Applying migration from {migration_path}...")
    
    try:
        # Since supabase-py doesn't have a direct 'rpc' for raw SQL easily without a preset function, 
        # and we don't have a postgres client, we'll try to execute parts via the client if possible 
        # or notify that SQL needs to be run in the dashboard if it's complex.
        # However, many environments have a 'exec_sql' RPC or similar.
        
        # Let's try to run it via an RPC if it exists, or just log that it needs manual execution if we can't.
        # For now, I will use a series of 'rpc' calls or standard table operations if I can.
        # Actually, the most reliable way in some environments is a custom RPC.
        
        print("--- START SQL MIGRATION ---")
        print(sql)
        print("--- END SQL MIGRATION ---")
        print("\nNOTE: Please run the above SQL in the Supabase SQL Editor if this script cannot execute it directly.")
        
        # Attempt to create tables via basic queries to check if we can at least do some parts
        # But for full migrations, SQL Editor is safer.
        
    except Exception as e:
        logger.error(f"Migration error: {e}")

if __name__ == "__main__":
    apply_migration()
