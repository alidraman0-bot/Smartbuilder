import os

ai_models_path = r'C:\Users\ANNHENMICH TECHNOLOG\Desktop\Smartbuilder\app\core\ai_models.py'
config_path = r'C:\Users\ANNHENMICH TECHNOLOG\Desktop\Smartbuilder\app\core\config.py'

with open(ai_models_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove ':free' everywhere
content = content.replace(':free', '')

# Remove lines containing 'openrouter/free'
lines = content.split('\n')
new_lines = [l for l in lines if 'openrouter/free' not in l]

with open(ai_models_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

with open(config_path, 'r', encoding='utf-8') as f:
    config_content = f.read()

config_content = config_content.replace('"openrouter/free"', '"openai/gpt-4o-mini"')

with open(config_path, 'w', encoding='utf-8') as f:
    f.write(config_content)

print('Successfully removed openrouter/free models.')
