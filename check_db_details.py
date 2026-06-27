
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

def check_table_details(table_name):
    print(f"\n--- Details for {table_name} ---")
    # Using RPC to get table info if possible, or just raw SQL via a hack
    # Since I don't have a direct SQL execution tool, I'll try to insert a row with missing required fields
    try:
        res = supabase.table(table_name).insert({}).execute()
        print(f"Insert empty row result: {res}")
    except Exception as e:
        print(f"Insert empty row error (shows required fields?): {e}")

check_table_details("ideas")
