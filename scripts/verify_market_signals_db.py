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
        
        print("Checking for 'market_signals' table...")
        # Attempt a simple count query
        result = supabase.table("market_signals").select("count", count="exact").limit(1).execute()
        
        print("[OK] SUCCESS: 'market_signals' table exists.")
        print(f"Records found: {result.count if result.count is not None else 0}")
        
        # Check columns (optional, but good for confidence)
        columns_sample = supabase.table("market_signals").select("*").limit(1).execute()
        if columns_sample.data:
            print("Table columns appear correct based on sample data.")
        else:
            print("Table is empty (which is normal if just created).")
            
    except Exception as e:
        print(f"[ERROR] Could not verify 'market_signals' table.")
        print(f"Detail: {e}")
        print("\nPossible reasons:")
        print("1. The SQL script was not run in the Supabase SQL Editor.")
        print("2. There was an error during SQL execution.")
        print("3. RLS policies are blocking the check (though service_role should bypass).")

if __name__ == "__main__":
    verify_db()
