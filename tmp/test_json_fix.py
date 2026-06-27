import logging
from app.agents.mvp_agents import safe_json_loads

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

text = open('base44_failed_output.txt', encoding='utf-8').read()

last_file_start = text.rfind('{\n      "path"')
if last_file_start == -1: last_file_start = text.rfind('{\n            "path"')
if last_file_start == -1: last_file_start = text.rfind('{"path"')
if last_file_start == -1: last_file_start = text.rfind('{\n        "path"') # Add this
print(f'last_file_start: {last_file_start}')

if last_file_start > 0:
    comma_pos = text.rfind(',', 0, last_file_start)
    print(f'comma_pos: {comma_pos}')
    if comma_pos > 0:
        fixed_text = text[:comma_pos] + '\n  ]\n}'
        data = safe_json_loads(fixed_text)
        if data:
            print("Successfully repaired truncated JSON!")
            print(f"Files: {len(data['files'])}")
        else:
            print("safeload FAILED")
