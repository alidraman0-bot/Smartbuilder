import asyncio
import logging
from app.services.runner import Runner

# Configure logging to see the flow
logging.basicConfig(level=logging.INFO, format='%(name)s - %(levelname)s - %(message)s')

async def main():
    print("--- Starting Smartbuilder Simulation ---")
    
    runner = Runner()
    opportunity = "AI-powered Gardening Assistant for Urban Dwellers"
    
    print(f"Opportunity: {opportunity}")
    result = await runner.run_autonomously(opportunity)
    
    print("\n--- Execution Result ---")
    import json
    if isinstance(result, dict):
        print(json.dumps(result, indent=2))
    else:
        print(f"Result: {result}")
        
    # Check final state
    print(f"\nFinal State: {runner.orchestrator.get_state()}")

if __name__ == "__main__":
    asyncio.run(main())
