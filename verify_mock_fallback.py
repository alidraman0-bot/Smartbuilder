
import asyncio
import os
import sys
from dotenv import load_dotenv

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "."))
sys.path.append(project_root)
load_dotenv()

from app.core.ai_client import AIClient

async def test_mock_fallback():
    # Force a scenario where all real providers fail or are skipped
    client = AIClient()
    # We'll just call the top level chat_completion 
    # Since we know all real keys are exhausted from previous debug,
    # this SHOULD trigger the new mock fallback.
    
    print("Testing chat_completion with exhausted keys (should trigger mock)...")
    try:
        res = await client.chat_completion(
            messages=[{"role": "user", "content": "Tell me about a startup idea."}],
            system_prompt="startup ideas",
            response_format={"type": "json_object"}
        )
        print(f"Provider used: {res.get('provider')}")
        print(f"Content: {res['content'][:200]}...")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_mock_fallback())
