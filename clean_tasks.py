import re

# Read the file
with open('Tasks.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove merge conflict markers and keep HEAD version
pattern = r'<<<<<<< HEAD\n(.*?)\n=======\n.*?\n>>>>>>> [a-f0-9]+\n'
cleaned = re.sub(pattern, r'\1\n', content, flags=re.DOTALL)

# Write back
with open('Tasks.md', 'w', encoding='utf-8') as f:
    f.write(cleaned)

print('Merge conflicts resolved!')
print(f'File cleaned successfully')
