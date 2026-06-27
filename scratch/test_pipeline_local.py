import asyncio
import time
import logging

# Configure basic logging to see pipeline logs
logging.basicConfig(level=logging.INFO)

async def test_local():
    # Import the real pipeline
    from app.workflows.discovery.idea_pipeline import idea_pipeline
    
    print("Executing idea_pipeline.run_discovery locally...")
    start = time.time()
    try:
        result = await idea_pipeline.run_discovery(
            seed_idea="emerging startup opportunities in SaaS and AI",
            mode="deep"
        )
        print(f"\nSuccess! Completed in {time.time() - start:.2f}s")
        print(f"Ideas generated: {len(result.get('ideas', []))}")
        print("Keys returned:", list(result.keys()))
    except Exception as e:
        print(f"\nPipeline failed locally: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_local())
