import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def check_db():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
        return

    print(f"Connecting to {url}...")
    db = create_client(url, key)
    
    try:
        response = db.table("market_signals").select("*").limit(5).execute()
        print(f"Fetched {len(response.data)} signals")
        if response.data:
            print("Sample data:")
            print(response.data[0])
        else:
            print("The market_signals table is EMPTY.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
