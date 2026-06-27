
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Add project root to path
sys.path.append(os.getcwd())

load_dotenv()

def check_tables():
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Error: Missing credentials")
        return

    supabase: Client = create_client(url, key)
    
    tables = ["ideas", "user_seen_ideas", "opportunity_analysis", "opportunity_runs", "ideas_v2"]
    
    for table in tables:
        try:
            supabase.table(table).select("*").limit(1).execute()
            print(f"Table '{table}' exists.")
        except Exception as e:
            print(f"Table '{table}' does NOT exist or error: {e}")

if __name__ == "__main__":
    check_tables()
