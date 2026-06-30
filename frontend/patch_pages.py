import re
import os

PAGES_FILTERS = {
    "StemStudents.tsx": "program__category: 'STEM'",
    "SpecializedStudents.tsx": "has_specialized_skills: true",
    "CriticalStudents.tsx": "has_critical_skills: true",
    "Inclusivity.tsx": "inclusivity: true",
    "ISEOP.tsx": "is_iseop: true"
}

for page, filter_val in PAGES_FILTERS.items():
    filepath = f"src/pages/{page}"
    if not os.path.exists(filepath): continue
    
    with open(filepath, "r") as f:
        content = f.read()

    # Find the ReportBuilder invocation
    pattern = r'(<ReportBuilder\s+reportType="students"\s+open=\{reportBuilderOpen\}\s+onOpenChange=\{setReportBuilderOpen\}\s*/>)'
    repl = f'<ReportBuilder reportType="students" open={{reportBuilderOpen}} onOpenChange={{setReportBuilderOpen}} hideFilters={{true}} defaultFilters={{{{ {filter_val} }}}} />'
    
    content = re.sub(pattern, repl, content)
    
    with open(filepath, "w") as f:
        f.write(content)

