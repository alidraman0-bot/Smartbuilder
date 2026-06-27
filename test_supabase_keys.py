from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
anon_key = os.getenv("SUPABASE_KEY")
service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")

def test_key(name, k):
    try:
        client = create_client(url, k)
        res = client.table("projects").select("count", count="exact").limit(1).execute()
        print(f"{name} Key: Valid (Success)")
    except Exception as e:
        print(f"{name} Key: Invalid - {e}")

test_key("Anon", anon_key)
test_key("Service", service_key)
