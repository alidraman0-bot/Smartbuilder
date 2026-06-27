
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

def check_table_columns(table_name):
    try:
        res = supabase.table(table_name).select("*").limit(1).execute()
        if res.data:
            print(f"Columns in {table_name}: {list(res.data[0].keys())}")
        else:
            print(f"Table {table_name} is empty")
            # Try to get error for non-existent column
            supabase.table(table_name).select("non_existent").execute()
    except Exception as e:
        print(f"Check {table_name} error: {e}")

check_table_columns("projects")
check_table_columns("ideas")
