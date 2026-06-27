import os

files = [
    r'C:\Users\ANNHENMICH TECHNOLOG\Desktop\Smartbuilder\app\core\ai_models.py',
    r'C:\Users\ANNHENMICH TECHNOLOG\Desktop\Smartbuilder\app\core\ai_client.py',
    r'C:\Users\ANNHENMICH TECHNOLOG\Desktop\Smartbuilder\app\core\ai_router.py'
]

models_to_fix = [
    "deepseek/deepseek-r1",
    "qwen/qwen-2.5-72b-instruct",
    "meta-llama/llama-3.3-70b-instruct",
    "mistralai/mistral-small-24b-instruct-2501",
    "meta-llama/llama-3-8b-instruct",
    "google/gemma-2-9b-it",
    "google/gemini-2.5-flash",
    "meta-llama/llama-3.1-8b-instruct"
]

for f in files:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    for m in models_to_fix:
        # replace occurrences that don't already have :free
        # a naive replace might duplicate :free if we run it twice, so let's be careful
        # Only replace if followed by a quote (since they are strings in code)
        content = content.replace(f'{m}"', f'{m}:free"')
        content = content.replace(f"{m}'", f"{m}:free'")
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Restored :free to specific models")
