import asyncio
import logging
from app.services.seed_generator_service import SeedGeneratorService

logging.basicConfig(level=logging.INFO)

async def test_seed():
    svc = SeedGeneratorService()
    try:
        print("Starting generate_seed_batch...")
        seeds = await svc.generate_seed_batch(project_id="test_proj_123", count=1)
        print(f"Generated {len(seeds)} seeds: {seeds}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_seed())
