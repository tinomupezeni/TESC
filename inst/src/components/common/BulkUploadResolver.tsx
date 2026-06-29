import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, FileSpreadsheet, AlertCircle, CheckCircle2, 
  Loader2, Download, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/api";

const REQUIRED_COLUMNS: Record<string, string[]> = {
  faculties: [
    "Faculty Name",
    "Status (Active/Setup/Review/Archived)"
  ],
  facilities: [
    "Faculty Name",
    "Category",
    "Status (Active/Maintenance/Closed)"
  ],
  programs: [
    "Faculty Name",
    "Department Name",
    "Program Name",
    "Program Code",
    "Duration (Years)",
    "Levels (Comma-separated: Bachelors, Masters, etc.)",
    "Categories (Comma-separated: STEM, BUSINESS, etc.)",
    "Program Type (Degree/Diploma/Certificate/Short Course/Other)"
  ],
  stem_students: [
    "Student ID",
    "National ID",
    "First Name",
    "Last Name",
    "Gender (Male/Female)",
    "Enrollment Year",
    "Selected Level"
  ],
  inclusivity: [
    "Student ID",
    "Inclusivity Category"
  ],
  possible_graduates: [
    "Student ID",
    "Expected Graduation Year"
  ],
  placements: [
    "Student ID",
    "Placement Type (Attachment/Apprenticeship)",
    "Company Name",
    "Start Date (YYYY-MM-DD)"
  ],
  scholarships: [
    "Student ID",
    "Provider Name",
    "Year Awarded"
  ],
  mobility: [
    "Student ID",
    "Direction (Inbound/Outbound)",
    "Country"
  ],
  in_country_transfers: [
    "Student ID",
    "From Institution Name",
    "To Institution Name",
    "Transfer Date (YYYY-MM-DD)"
  ]
};

interface BackendRowResult {
  row_number: number;
  status: "Success" | "Error";
  messages: string[];
  data: any;
}

interface Props {
  moduleType: string;
  onSuccess: () => void;
}

export function BulkUploadResolver({ moduleType, onSuccess }: Props) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<BackendRowResult[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset states on module change
  useEffect(() => {
    setFile(null);
    setPreviewHeaders([]);
    setPreviewRows([]);
    setValidationResults([]);
    setValidationError(null);
  }, [moduleType]);

  const normalizeHeader = (h: string) => 
    String(h || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|csv)$/)) {
      setValidationError("Please upload a valid Excel (.xlsx) or CSV file.");
      return;
    }

    setFile(selectedFile);
    setValidationError(null);
    setValidationResults([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length > 0) {
          const rawHeaders = data[0] as string[];
          const sheetHeadersNormalized = rawHeaders.map(normalizeHeader);
          
          const reqCols = REQUIRED_COLUMNS[moduleType] || [];
          const missing = reqCols.filter(col => !sheetHeadersNormalized.includes(normalizeHeader(col)));
          
          if (missing.length > 0) {
            setValidationError(`Missing required columns: ${missing.join(", ")}`);
            setFile(null);
            setPreviewHeaders([]);
            setPreviewRows([]);
          } else {
            setPreviewHeaders(rawHeaders);
            setPreviewRows(data.slice(1, 6)); // Extract first 5 rows
          }
        } else {
          setValidationError("The uploaded file is empty.");
          setFile(null);
        }
      } catch (err) {
        setValidationError("Failed to parse the file. Please check if the file format is valid.");
        setFile(null);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await apiClient.get(`/academic/ingestion/template/${moduleType}/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${moduleType}_template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      toast.error("Failed to download template");
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setIsUploading(true);
    setValidationResults([]);
    const formData = new FormData();
    formData.append("file", file);
    if (user?.institution?.id) {
      formData.append("institution_id", user.institution.id.toString());
    }

    try {
      const res = await apiClient.post(`/academic/ingestion/validate/${moduleType}/`, formData);
      if (res.data && res.data.status === "success" && Array.isArray(res.data.processed_data)) {
        setValidationResults(res.data.processed_data);
        const errorRows = res.data.processed_data.filter((r: BackendRowResult) => r.status === "Error");
        if (errorRows.length > 0) {
          toast.error(`Validation complete with ${errorRows.length} error(s). Please review row statuses.`);
        } else {
          toast.success("Validation successful! All rows are ready to commit.");
        }
      } else {
        toast.error("Invalid response format from server");
      }
    } catch (e: any) {
      const detail = e.response?.data?.error || "Validation failed";
      toast.error(detail);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCommit = async () => {
    if (validationResults.length === 0) return;
    setIsCommitting(true);
    try {
      const payload = {
        data: validationResults,
        institution_id: user?.institution?.id
      };
      const res = await apiClient.post(`/academic/ingestion/commit/${moduleType}/`, payload);
      if (res.data && res.data.success) {
        toast.success(`Successfully imported ${res.data.imported} records!`);
        setFile(null);
        setPreviewHeaders([]);
        setPreviewRows([]);
        setValidationResults([]);
        onSuccess();
      } else {
        toast.error("Commit failed");
      }
    } catch (e: any) {
      const detail = e.response?.data?.error || "Commit failed";
      toast.error(detail);
    } finally {
      setIsCommitting(false);
    }
  };

  const hasErrors = validationResults.some(r => r.status === "Error");
  const readyCount = validationResults.filter(r => r.status === "Success").length;

  return (
    <div className="space-y-4">
      {/* 1. Template Download & File Select */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border p-4 rounded-lg bg-muted/20 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-1">Step 1: Download Template</h4>
            <p className="text-xs text-muted-foreground">Use our standardized format to structure your excel data correctly.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full gap-2">
            <Download className="h-4 w-4" /> Download Excel Template
          </Button>
        </div>

        <div className="border p-4 rounded-lg bg-muted/20 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-1">Step 2: Upload Data</h4>
            <p className="text-xs text-muted-foreground">Select your .xlsx or .csv data sheet for ingestion.</p>
          </div>
          {!file ? (
            <div 
              className="border border-dashed rounded-lg p-2 text-center hover:bg-muted/10 cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
              />
              <Upload className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs font-medium">Select file (.xlsx or .csv)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 border rounded-md bg-background text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileSpreadsheet className="h-4 w-4 text-green-600 shrink-0" />
                <span className="truncate font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setFile(null); setPreviewHeaders([]); setPreviewRows([]); setValidationResults([]); setValidationError(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription className="text-xs">{validationError}</AlertDescription>
        </Alert>
      )}

      {/* 2. Client-side First 5 Rows Preview */}
      {previewRows.length > 0 && validationResults.length === 0 && (
        <div className="space-y-2 border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-primary">
              <FileSpreadsheet className="h-4 w-4" />
              File Preview (First 5 Rows)
            </span>
            <Button onClick={handleValidate} size="sm" disabled={isUploading} className="h-8">
              {isUploading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Validate Data
            </Button>
          </div>
          <div className="overflow-x-auto border rounded-md max-h-[180px] bg-background">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-muted/80 border-b">
                  {previewHeaders.map((header, idx) => (
                    <th key={idx} className="p-2 font-medium text-muted-foreground border-r whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b last:border-0 hover:bg-muted/5">
                    {previewHeaders.map((_, colIdx) => (
                      <td key={colIdx} className="p-2 border-r truncate max-w-[150px]">
                        {row[colIdx] !== undefined ? String(row[colIdx]) : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Server-side Validation Results */}
      {validationResults.length > 0 && (
        <div className="space-y-3 border p-4 rounded-lg animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
            <div>
              <h4 className="text-xs font-semibold text-foreground">Validation Results</h4>
              <p className="text-[11px] text-muted-foreground">
                {readyCount} rows ready. {validationResults.length - readyCount} rows contain errors.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setValidationResults([])} className="h-8">Re-validate</Button>
              <Button onClick={handleCommit} disabled={readyCount === 0 || isCommitting} size="sm" className="h-8">
                {isCommitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Commit {readyCount} Valid Rows
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-md max-h-[220px] bg-background">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[80px] text-[11px] p-2">Row No.</TableHead>
                  <TableHead className="w-[100px] text-[11px] p-2">Status</TableHead>
                  <TableHead className="text-[11px] p-2">Details / Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationResults.map((r, i) => (
                  <TableRow key={i} className={r.status === "Error" ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                    <TableCell className="text-[11px] font-medium p-2">Row {r.row_number}</TableCell>
                    <TableCell className="p-2">
                      <Badge variant={r.status === "Success" ? "default" : "destructive"} className="text-[10px] py-0 px-1">
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] p-2 text-muted-foreground">
                      {r.status === "Error" ? (
                        <span className="text-destructive font-medium">{r.messages.join(", ")}</span>
                      ) : (
                        <span className="text-green-600 font-medium">Valid</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}