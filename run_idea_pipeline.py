import asyncio
from app.workflows.discovery.idea_pipeline import IdeaPipeline

async def main():
    # Example seed idea; replace with desired input
    seed = "EcoSense AI"
    pipeline = IdeaPipeline()
    result = await pipeline.run_discovery(seed)
    print("Idea Pipeline Result:")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
