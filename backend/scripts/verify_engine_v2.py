import asyncio
import os
import sys
import logging

# Ensure we can import from the root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(project_root)

from app.core.mvp_pipeline import MVPPipeline
from app.core.config import settings
from dotenv import load_dotenv

load_dotenv() # Load from .env if present

# Setup logging to console
logging.basicConfig(level=logging.INFO)

async def test_pipeline():
    print("=== Smartbuilder MVP Engine Verification (Python SDKs) ===")
    
    # Initialize pipeline
    def on_event(step, message, data=None):
        print(f"[{step.upper()}] {message}")
        if data:
            print(f"      Data: {data}")

    pipeline = MVPPipeline(on_event=on_event)
    
    idea = "A simple task management app for freelance developers."
    print(f"\nTriggering build for idea: '{idea}'\n")
    
    try:
        result = await pipeline.build_mvp(idea)
        
        print("\n=== Pipeline Execution Result ===")
        print(f"Status: {result.status}")
        print(f"Project: {result.project_name}")
        print(f"Preview URL: {result.preview_url}")
        
        if result.status == "failed":
            print(f"Error: {result.error}")
            return False
            
        print("\nVerification SUCCESS!")
        return True
    except Exception as e:
        print(f"\nVerification FAILED with exception: {e}")
        return False

if __name__ == "__main__":
    if not settings.has_ai_key:
        print("Error: No AI API keys found in .env. Please configure them first.")
        sys.exit(1)
        
    asyncio.run(test_pipeline())
