from google import genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv('GOOGLE_API_KEY')
print(f"Testing key ending in: {api_key[-5:]}")

client1 = genai.Client(api_key=api_key, http_options={'api_version': 'v1'})
client2 = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})

models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-2.0-flash']

for m in models:
    for c_name, c in [('v1', client1), ('v1beta', client2)]:
        try:
            res = c.models.generate_content(model=m, contents='Hi')
            print(f'SUCCESS {m} via {c_name}:', res.text[:20])
        except Exception as e:
            err_msg = str(e).split('message')[1] if 'message' in str(e) else str(e)
            print(f'FAIL {m} via {c_name}:', err_msg[:100])
