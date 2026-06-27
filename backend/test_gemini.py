from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("No GOOGLE_API_KEY found")
    exit(1)

print(f"Testing key: {api_key[:10]}...")

try:
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1'})
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='Say "Hello"'
    )
    print("SUCCESS! Response:", response.text)
except Exception as e:
    print("ERROR:", str(e))
