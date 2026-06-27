import sys
import os
from dotenv import load_dotenv

# Load .env from root
load_dotenv()

# Add root to sys.path
sys.path.append(os.getcwd())

try:
    print("Testing import of main...")
    from backend import main
    print("SUCCESS: main.py imported successfully!")
    
    print("\nTesting BillingService async initialization...")
    from app.services.billing_service import billing_service
    import asyncio
    
    async def test_sub():
        # Just a sanity check - doesn't need to actually ping Supabase if mocked or if we just want to see if it runs
        print("BillingService instance created.")
        
    asyncio.run(test_sub())
    
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
