import os
import re

for page in ["Graduates.tsx", "Staff.tsx", "ISEOP.tsx"]:
    filepath = f"src/pages/{page}"
    if not os.path.exists(filepath): continue
    
    with open(filepath, "r") as f: content = f.read()
    
    if "Generate Report" not in content:
        # Find the div closing after the CSV button
        # Usually it looks like: <Button ... CSV ... </Button> \n </div>
        
        button_html = """
              <Button size="sm" onClick={() => setReportBuilderOpen(true)} className="bg-green-600 hover:bg-green-700 h-9 font-bold">
                <FileText className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Generate Report</span>
              </Button>"""
              
        # Replace the </Button> of CSV with itself + Generate Report
        content = re.sub(
            r'(<span className="hidden sm:inline">CSV</span>\s*</Button>)',
            r'\1' + button_html,
            content
        )
        
        # Add import ReportBuilder
        if "ReportBuilder" not in content:
            content = content.replace('import { DashboardLayout }', 'import { ReportBuilder } from "@/components/reports";\nimport { DashboardLayout }')
            
        if "FileText" not in content and "lucide-react" in content:
            content = re.sub(r'(import \{[^}]*)( \}\s*from "lucide-react")', r'\1, FileText\2', content)
            
        if "reportBuilderOpen" not in content:
             content = re.sub(
                r'(export default function \w+\(\) \{\n)',
                r'\1  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);\n',
                content
             )
             
        if "<ReportBuilder" not in content:
            content = re.sub(
                r'(</DashboardLayout>)',
                r'  <ReportBuilder reportType="students" open={reportBuilderOpen} onOpenChange={setReportBuilderOpen} />\n\1',
                content
            )
            
        with open(filepath, "w") as f: f.write(content)
        print(f"Fixed {page}")

