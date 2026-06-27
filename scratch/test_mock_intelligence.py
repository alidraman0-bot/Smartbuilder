import asyncio
import json
from app.core.ai_client import get_ai_client

async def test_mock():
    client = get_ai_client()
    messages = [
        {"role": "system", "content": "You are an institutional market intelligence analyst. Return only JSON."},
        {"role": "user", "content": "Analyze signals for: emerging startup opportunities in SaaS and AI"}
    ]
    
    print("Generating mock for market research task...")
    res = await client._mock_completion(messages=messages, system_prompt=messages[0]["content"])
    
    content = res.get("content", "")
    print(f"Model used: {res.get('model')}")
    print(f"Content length: {len(content)}")
    try:
        parsed = json.loads(content)
        print("Success! JSON parsed successfully.")
        print(f"Keys found: {list(parsed.keys())}")
        print(f"Executive Summary: {parsed.get('executive_summary')[:100]}...")
        print(f"TAM: {parsed.get('market_size', {}).get('tam')}")
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        print(f"Raw content: {content}")

if __name__ == "__main__":
    asyncio.run(test_mock())
