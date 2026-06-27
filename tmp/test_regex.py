import re
import json
text = open('base44_failed_output.txt', encoding='utf-8').read()
matches = list(re.finditer(r'\{\s*"path"', text))
print(f"Regex matches: len={len(matches)}")
if matches:
    print(f"Last match start: {matches[-1].start()}")
    comma_pos = text.rfind(',', 0, matches[-1].start())
    print(f"Comma pos: {comma_pos}")
    fixed_text = text[:comma_pos] + '\n  ]\n}'
    try:
        data = json.loads(fixed_text)
        print("Success! Keys:", data.keys())
    except Exception as e:
        print("Failed to loads fixed_text:", e)
        # Try safe_json_loads
        from app.agents.mvp_agents import safe_json_loads
        data2 = safe_json_loads(fixed_text)
        print(f"Safe load returned: {bool(data2)}")
