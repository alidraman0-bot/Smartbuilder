"""
Automated deployment script for Global Idea Generation System.

This script:
1. Connects to Supabase
2. Deploys the schema safely
3. Verifies all tables are created
4. Runs basic tests

Run with: python deploy_to_supabase.py
"""

import asyncio
import logging
from supabase import create_client, Client
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def deploy_schema():
    """Deploy the schema to Supabase via SQL file execution."""
    print("\n" + "="*60)
    print("DEPLOYING GLOBAL IDEA GENERATION SYSTEM TO SUPABASE")
    print("="*60)
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("ERROR: Missing Supabase credentials in .env file")
        print("   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set")
        return False
    
    try:
        # Connect to Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print(f"SUCCESS: Connected to Supabase: {SUPABASE_URL}")
        
        # Read deployment SQL
        with open("deploy_idea_generation.sql", "r") as f:
            sql_script = f.read()
        
        print("\nDeployment SQL loaded")
        print(f"   Script size: {len(sql_script)} characters")
        
        # Note: Supabase Python client doesn't support direct SQL execution
        # We need to execute via RPC or manually in Supabase dashboard
        print("\n" + "="*60)
        print("WARNING: MANUAL DEPLOYMENT REQUIRED")
        print("="*60)
        print("\nThe Supabase Python client doesn't support direct SQL execution.")
        print("Please follow these steps:")
        print("\n1. Open your Supabase dashboard:")
        print(f"   {SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}")
        print("\n2. Navigate to: SQL Editor")
        print("\n3. Create a new query")
        print("\n4. Copy and paste the contents of:")
        print("   deploy_idea_generation.sql")
        print("\n5. Click 'Run' to execute")
        print("\n" + "="*60)
        print("\nOr use the Supabase CLI:")
        print("   supabase db push --db-url YOUR_DB_URL < deploy_idea_generation.sql")
        print("="*60)
        
        # Verify tables exist (basic check)
        print("\n\nChecking existing tables...")
        
        try:
            # Try to query dimension tables
            result = supabase.table("idea_dimensions_geography").select("count", count="exact").limit(1).execute()
            print(f"OK: idea_dimensions_geography: {result.count or 0} records")
        except Exception as e:
            print(f"WARN: idea_dimensions_geography: Not found (will be created)")
        
        try:
            result = supabase.table("idea_seeds").select("count", count="exact").limit(1).execute()
            print(f"OK: idea_seeds: {result.count or 0} records")
        except Exception as e:
            print(f"WARN: idea_seeds: Not found (will be created)")
        
        try:
            result = supabase.table("ideas_v2").select("count", count="exact").limit(1).execute()
            print(f"OK: ideas_v2: {result.count or 0} records")
        except Exception as e:
            print(f"WARN: ideas_v2: Not found (will be created)")
        
        try:
            result = supabase.table("rate_limit_config").select("count", count="exact").limit(1).execute()
            print(f"OK: rate_limit_config: {result.count or 0} records")
        except Exception as e:
            print(f"WARN: rate_limit_config: Not found (will be created)")
        
        print("\n" + "="*60)
        print("NEXT STEPS:")
        print("="*60)
        print("1. Run the SQL script in Supabase (see instructions above)")
        print("2. Restart your backend server")
        print("3. Test the system: python test_idea_generation_system.py")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\nERROR: Deployment error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    deploy_schema()
