with open('app/services/idea_service.py', 'r', encoding='utf-8') as f:
    content = f.read()

count = content.count('"""')
print(f'Triple quote count: {count}')
print(f'Is balanced: {count % 2 == 0}')

if count % 2 != 0:
    print('\nERROR: Unbalanced triple quotes!')
    # Find all positions
    import re
    matches = list(re.finditer(r'"""', content))
    print(f'\nFound {len(matches)} occurrences:')
    for i, m in enumerate(matches):
        line_num = content[:m.start()].count('\n') + 1
        print(f'{i+1}. Line {line_num}')
