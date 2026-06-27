
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

def check_table_schema(table_name):
    print(f"\n--- Checking schema for table: {table_name} ---")
    try:
        # We can't directly get schema via the client in a simple way without admin access or raw SQL
        # But we can try to select one row and see the keys
        res = supabase.table(table_name).select("*").limit(1).execute()
        if res.data:
            print(f"Columns in {table_name}: {list(res.data[0].keys())}")
        else:
            print(f"Table {table_name} is empty, trying to insert a dummy row to see columns (rollback not possible here, so be careful)")
            # Alternative: try to select from a non-existent column to see error message with available columns
            try:
                supabase.table(table_name).select("non_existent_column_xyz").execute()
            except Exception as e:
                print(f"Error (contains column info?): {e}")
    except Exception as e:
        print(f"Failed to check {table_name}: {e}")

check_table_schema("ideas")
check_table_schema("ideas_v2")
check_table_schema("market_keywords")
check_table_schema("trend_signals")
check_table_schema("competitor_signals")
check_table_schema("funding_signals")
