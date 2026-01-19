with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix the problematic line
for i, line in enumerate(lines):
    if 'leadName: lead ?' in line:
        lines[i] = '                        leadName: lead ? f"{lead.firstName} {lead.lastName}" : undefined,\\n'.replace('f"{', '${').replace('}"', '}')

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
