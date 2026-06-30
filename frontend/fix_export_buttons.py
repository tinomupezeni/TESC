import os
import re

PAGES = [
    "StemStudents.tsx",
    "SpecializedStudents.tsx",
    "CriticalStudents.tsx",
    "PossibleGraduates.tsx",
    "InCountryTransfers.tsx",
    "Inclusivity.tsx"
]

export_data_logic = """
  const exportData = (type: 'csv' | 'excel') => {
    const headers = ["Student ID", "Name", "Program", "Gender", "Institution"];
    const rows = filteredData.map((s: any) => [
      s.student_id_number || s.student_id || "N/A",
      s.full_name || "N/A",
      s.program_name || "N/A",
      s.gender || "N/A",
      s.institution_name || "N/A"
    ]);

    let content = "";
    let mimeType = "";
    let fileExtension = "";

    if (type === 'csv') {
      content = [headers, ...rows].map(e => e.join(",")).join("\\n");
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
    } else {
      content = [headers.join("\\t"), ...rows.map(r => r.join("\\t"))].join("\\n");
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      fileExtension = 'xls';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Export_Records.${fileExtension}`;
    link.click();
  };
"""

for page in PAGES:
    filepath = f"src/pages/{page}"
    if not os.path.exists(filepath):
        continue

    with open(filepath, "r") as f:
        content = f.read()

    # Import ExportButtons
    if "import { ExportButtons }" not in content:
        content = content.replace('import { DashboardLayout }', 'import { ExportButtons } from "@/components/ExportButtons";\nimport { DashboardLayout }')
    
    if "import { ReportBuilder }" not in content:
        content = content.replace('import { DashboardLayout }', 'import { ReportBuilder } from "@/components/reports";\nimport { DashboardLayout }')

    # Add exportData
    if "const exportData" not in content:
        content = re.sub(
            r'(const \[reportBuilderOpen[^;]+;)', 
            r'\1\n' + export_data_logic, 
            content
        )

    # Wrap the header in flex flex-col md:flex-row and add <ExportButtons />
    # We search for: <div>\n          <h1 className="text-2xl...
    # And replace the <div> with <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:mb-8">\n<div>
    if "ExportButtons onExport" not in content:
        pattern = r'(<div>\s*<h1[^>]*>.*?</h1>\s*<p[^>]*>.*?</p>\s*</div>)'
        
        def repl(match):
            original = match.group(1)
            return f'<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:mb-8">\n{original}\n<ExportButtons onExport={{exportData}} onGenerateReport={{() => setReportBuilderOpen(true)}} />\n</div>'
        
        content = re.sub(pattern, repl, content, count=1, flags=re.DOTALL)

    # Make sure ReportBuilder is added
    if "<ReportBuilder" not in content:
        content = re.sub(r'(</DashboardLayout>)', r'  <ReportBuilder reportType="students" open={reportBuilderOpen} onOpenChange={setReportBuilderOpen} />\n\1', content)

    with open(filepath, "w") as f:
        f.write(content)
    print(f"Fixed {page}")

