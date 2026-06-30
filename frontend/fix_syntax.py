import os

PAGES = [
    "StemStudents.tsx",
    "SpecializedStudents.tsx",
    "CriticalStudents.tsx",
    "PossibleGraduates.tsx",
    "InCountryTransfers.tsx",
    "Inclusivity.tsx"
]

for page in PAGES:
    filepath = f"src/pages/{page}"
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, "r") as f:
        content = f.read()

    # The issue is: .join("\n") where \n is a literal newline inside the string
    content = content.replace('join("{\\n}")', 'join("\\\\n")')
    content = content.replace('join("\\n")', 'join("\\\\n")')
    content = content.replace('join("\\t")', 'join("\\\\t")')

    # Actually, the python file probably generated:
    # content = [headers, ...rows].map(e => e.join(",")).join("\n");
    # So we can just find `.join("\n");` where the newline is literal!
    
    content = content.replace('.join("\\n");', '.join("\\\\n");')
    content = content.replace('join("{\\n}");', 'join("\\\\n");')
    
    # Wait, literal newline looks like:
    # .join("
    # ");
    content = content.replace('join("\\n");', 'join("\\\\n");')
    
    import re
    # Match .join("\n"); with actual literal newline
    content = re.sub(r'\.join\(" *\n *"\)', r'.join("\\n")', content)
    
    # Match literal tab
    content = content.replace('join("\t")', 'join("\\\\t")')

    with open(filepath, "w") as f:
        f.write(content)

