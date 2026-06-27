import asyncio
from app.core.ai_client import AIClient

async def main():
    client = AIClient()
    # Simple prompt to test Gemini
    messages = [{"role": "user", "content": "Say hello in three languages."}]
    result = await client.chat_completion(messages=messages, model="gemini-2.5-flash")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
