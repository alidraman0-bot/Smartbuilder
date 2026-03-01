import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")

print(f"Testing Gemini with model: {model_name}")
print(f"API Key: {api_key[:10]}...")

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Say hello")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Gemini failed: {e}")

print("\nTesting with 'gemini-1.5-pro'...")
try:
    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content("Say hello")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Gemini failed: {e}")
