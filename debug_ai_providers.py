
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add project root to sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "."))
sys.path.append(project_root)

load_dotenv()

from app.core.ai_client import AIClient, AIProvider

async def test_providers():
    client = AIClient()
    print(f"Initialized providers: {list(client.clients.keys())}")
    
    test_message = [{"role": "user", "content": "Say 'hello' in one word."}]
    
    for provider in [AIProvider.GEMINI, AIProvider.DEEPSEEK, AIProvider.OPENAI, AIProvider.ANTHROPIC]:
        print(f"\nTesting provider: {provider.value}...")
        if provider not in client.clients:
            print(f"Skipping {provider.value} (not initialized)")
            continue
            
        try:
            # We bypass the fallback loop by calling provider specific methods or setting current provider
            if provider == AIProvider.OPENAI:
                res = await client._openai_completion(test_message, None, "gpt-4o-mini", None, 10, None, provider=AIProvider.OPENAI)
            elif provider == AIProvider.ANTHROPIC:
                res = await client._anthropic_completion(test_message, None, "claude-3-5-sonnet-20241022", None, 10, None)
            elif provider == AIProvider.GEMINI:
                res = await client._openai_completion(test_message, None, "gemini-2.5-flash", None, 10, None, provider=AIProvider.GEMINI)
            elif provider == AIProvider.DEEPSEEK:
                res = await client._openai_completion(test_message, None, "deepseek-chat", None, 10, None, provider=AIProvider.DEEPSEEK)
            
            print(f"Result from {provider.value}: {res['content']}")
        except Exception as e:
            print(f"Error from {provider.value}: {str(e)[:200]}")

if __name__ == "__main__":
    asyncio.run(test_providers())
