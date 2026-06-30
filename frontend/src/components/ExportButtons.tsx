import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface ExportButtonsProps {
  onExport: (type: 'csv' | 'excel') => void;
  onGenerateReport: () => void;
}

export function ExportButtons({ onExport, onGenerateReport }: ExportButtonsProps) {
  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" onClick={() => onExport('excel')} className="flex gap-2 font-bold border-blue-200 hover:bg-blue-50">
        <Download className="h-4 w-4" /> Excel
      </Button>
      <Button variant="outline" onClick={() => onExport('csv')} className="flex gap-2 font-bold border-blue-200 hover:bg-blue-50">
        <Download className="h-4 w-4" /> CSV
      </Button>
      <Button onClick={onGenerateReport} className="flex gap-2 font-bold bg-green-600 hover:bg-green-700 shadow-sm transition-all">
        <FileText className="h-4 w-4" /> Generate Report
      </Button>
    </div>
  );
}
