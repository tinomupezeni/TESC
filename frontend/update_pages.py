import os
import re

PAGES = [
    "Staff.tsx",
    "Graduates.tsx",
    "StemStudents.tsx",
    "SpecializedStudents.tsx",
    "CriticalStudents.tsx",
    "Inclusivity.tsx",
    "PossibleGraduates.tsx",
    "InCountryTransfers.tsx"
]

for page in PAGES:
    filepath = f"src/pages/{page}"
    if not os.path.exists(filepath):
        print(f"Skipping {page}, does not exist.")
        continue
        
    with open(filepath, "r") as f:
        content = f.read()

    # 1. Add import for ReportBuilder
    if "import { ReportBuilder }" not in content:
        content = content.replace('import { DashboardLayout }', 'import { ReportBuilder } from "@/components/reports";\nimport { DashboardLayout }')
        
    # 1b. Add import for FileText if not present
    if "FileText" not in content and "lucide-react" in content:
        content = re.sub(r'(import \{[^}]*)( \}\s*from "lucide-react")', r'\1, FileText\2', content)

    # 2. Add state
    if "setReportBuilderOpen" not in content:
        # Find a suitable place to put the state, e.g., after `const navigate = useNavigate();` or similar
        content = re.sub(
            r'(const \[isLoading, setIsLoading\] = useState\(true\);)',
            r'\1\n  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);',
            content
        )
        if "reportBuilderOpen" not in content:
             content = re.sub(
                r'(export default function \w+\(\) \{\n)',
                r'\1  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);\n',
                content
             )

    # 3. Add the button next to the CSV button or similar.
    if "Generate Report" not in content:
        button_html = """
              <Button onClick={() => setReportBuilderOpen(true)} className="flex gap-2 font-bold bg-green-600 hover:bg-green-700 shadow-sm transition-all">
                <FileText className="h-4 w-4" /> Generate Report
              </Button>"""
              
        # Replace the end of the div holding the export buttons
        # Usually it looks like `</Button>\n            </div>`
        content = re.sub(
            r'(<Download className="h-4 w-4" /> (CSV|Excel)\s*</Button>)\s*(</div>)',
            r'\1' + button_html + r'\n            \3',
            content
        )
        # If it doesn't match exactly, fallback to inserting it after the print:hidden div
        if "Generate Report" not in content:
            content = re.sub(
                r'(<div className="flex gap-2 print:hidden">)',
                r'\1' + button_html,
                content
            )

    # 4. Add the component at the end
    if "<ReportBuilder" not in content:
        # reportType is usually derived from the filename or just "students"
        report_type = "students"
        if "Staff" in page: report_type = "staff"
        
        component_html = f'\n      <ReportBuilder reportType="{report_type}" open={{reportBuilderOpen}} onOpenChange={{setReportBuilderOpen}} />\n    </>'
        content = re.sub(
            r'(</DashboardLayout>\n?)\s*(<[^>]+View[^>]+/>\n?)?\s*</>',
            r'\1\2' + component_html,
            content
        )

    with open(filepath, "w") as f:
        f.write(content)
        
    print(f"Updated {page}")

