import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

def verify_db():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("Error: Missing Supabase credentials in .env")
        return

    print(f"Connecting to Supabase at {url}...")
    try:
        supabase: Client = create_client(url, key)
        
        print("Checking for 'opportunity_scores' table...")
        # Attempt a simple count query
        result = supabase.table("opportunity_scores").select("count", count="exact").limit(1).execute()
        
        print("[OK] SUCCESS: 'opportunity_scores' table exists.")
        print(f"Records found: {result.count if result.count is not None else 0}")
            
    except Exception as e:
        print(f"[ERROR] Could not verify 'opportunity_scores' table.")
        print(f"Detail: {e}")

if __name__ == "__main__":
    verify_db()
