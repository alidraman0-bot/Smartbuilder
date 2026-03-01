import asyncio
import os
from app.core.supabase import get_service_client

async def check_dims():
    client = get_service_client()
    tables = [
        'idea_dimensions_geography',
        'idea_dimensions_industry',
        'idea_dimensions_problem',
        'idea_dimensions_persona',
        'idea_dimensions_constraint',
        'idea_dimensions_technology',
        'idea_dimensions_business_model'
    ]
    for t in tables:
        try:
            res = client.table(t).select("id", count="exact").execute()
            print(f"{t}: {res.count}")
        except Exception as e:
            print(f"Error checking {t}: {e}")

if __name__ == '__main__':
    asyncio.run(check_dims())
