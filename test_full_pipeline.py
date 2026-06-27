
import asyncio
import json
import logging
from app.agents.mvp_agents import PlannerAgent, ArchitectureAgent, ModuleAgent, StructureAgent, CodeAgent

logging.basicConfig(level=logging.INFO)

async def dry_run_pipeline(idea: str):
    print(f"\n=== DRY RUN: {idea} ===")
    
    planner = PlannerAgent()
    arch = ArchitectureAgent()
    module = ModuleAgent()
    struct = StructureAgent()
    code = CodeAgent()
    
    try:
        print("\n[1/5] Running Planner...")
        plan = await planner.execute(idea)
        print(f"Plan summary: {plan.get('product_overview', 'FAIL')[:100]}...")
        
        print("\n[2/5] Running Architect...")
        architecture = await arch.execute(plan)
        print(f"Arch summary: {architecture.get('system_architecture', 'FAIL')[:100]}...")
        
        print("\n[3/5] Running Module Agent...")
        modules = await module.execute(architecture)
        print(f"Modules found: {len(modules)}")
        
        print("\n[4/5] Running Structure Agent...")
        paths = await struct.execute(architecture)
        print(f"Paths found: {len(paths)}")
        
        print("\n[5/5] Running Code Agent (sample)...")
        # We only implement a few files to save credits/time
        files = await code.execute(modules, paths[:5])
        print(f"Files implemented: {len(files)}")
        if files:
            print(f"Sample file: {files[0]['path']}")
            print(f"Content length: {len(files[0]['content'])}")
            
    except Exception as e:
        print(f"\nCRITICAL PIPELINE ERROR: {e}")

if __name__ == "__main__":
    ideas = [
        "A premium coffee subscription marketplace for rare specialty beans from Africa.",
        "A mobile app for seniors to track their daily walking and social interactions."
    ]
    for idea in ideas:
        asyncio.run(dry_run_pipeline(idea))
