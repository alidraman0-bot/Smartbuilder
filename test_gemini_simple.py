import asyncio
import google.generativeai as genai
from app.core.config import settings

async def test_gemini():
    model_name = settings.GEMINI_MODEL
    print(f"Testing Gemini with key: {settings.GOOGLE_API_KEY[:10]}... and model: {model_name}")
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    
    # Prefix models/ if missing
    if not model_name.startswith("models/"):
        model_name = f"models/{model_name}"
        
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Gemini failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
