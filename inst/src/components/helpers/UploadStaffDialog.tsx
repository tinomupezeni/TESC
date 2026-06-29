import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, FileSpreadsheet, AlertCircle, CheckCircle2, 
  Loader2, Download, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { bulkUploadStaff } from "@/services/staff.services"; 

// Required columns for validation
const REQUIRED_COLUMNS = [
  "first_name", 
  "last_name", 
  "email", 
  "phone", 
  "employee_id", 
  "position", 
  "qualification",
  "faculty_name", 
  "department_name" 
];

export function UploadStaffDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Preview States
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setValidationError(null);
      setServerErrors([]);
      setPreviewHeaders([]);
      setPreviewRows([]);
    }
  }, [open]);

  // --- Handlers ---

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|csv)$/)) {
      setValidationError("Please upload a valid Excel (.xlsx) or CSV file.");
      return;
    }

    setFile(selectedFile);
    setValidationError(null);
    setServerErrors([]);

    // Client-side header check and preview extraction
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
          const headers = rawHeaders.map(h => String(h || "").toLowerCase().trim().replace(/ /g, '_'));
          const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
          
          if (missing.length > 0) {
            setValidationError(`Missing required columns: ${missing.join(", ")}`);
            setFile(null);
            setPreviewHeaders([]);
            setPreviewRows([]);
          } else {
            setPreviewHeaders(rawHeaders);
            setPreviewRows(data.slice(1, 6)); // Extract first 5 rows
          }
        }
      } catch (err) {
        setValidationError("Failed to parse the file. Please check if the file format is valid.");
        setFile(null);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@inst.ac.zw",
        phone: "+26377123456",
        employee_id: "STF001",
        position: "Lecturer",
        qualification: "Masters",
        faculty_name: "Science",
        department_name: "Computer Science",
        specialization: "AI",
        date_joined: "2024-01-01"
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff_Template");
    XLSX.writeFile(wb, "Staff_Upload_Template.xlsx");
  };

  const handleUpload = async () => {
    if (!file || !user?.institution?.id) return;
    
    setIsUploading(true);
    setServerErrors([]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("institution_id", user.institution.id.toString());

      await bulkUploadStaff(formData);
      
      toast.success("Bulk upload successful! Records are being processed.");
      setOpen(false);
      setFile(null);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error(error);
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        setServerErrors(errors);
        toast.error("Upload completed with errors. Please check the error list.");
      } else {
        setValidationError(error.response?.data?.detail || "Upload failed. Please check your data format.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Staff</DialogTitle>
          <DialogDescription>
            Upload an Excel sheet to add multiple staff members at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 1. Template Download */}
          <div className="bg-muted/30 p-4 rounded-md border border-dashed flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Download Template</p>
                <p className="text-xs text-muted-foreground">Use this format to avoid errors</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {/* 2. File Drop Zone */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Step 2: Upload Data</p>
            {!file ? (
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/20 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                />
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to select file</p>
                <p className="text-xs text-muted-foreground mt-1">.xlsx or .csv (Max 5MB)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewHeaders([]); setPreviewRows([]); setValidationError(null); setServerErrors([]); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {previewRows.length > 0 && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>File Preview (First 5 Rows)</span>
                    </div>
                    <div className="overflow-x-auto border rounded-md max-h-[160px] bg-muted/5 scrollbar-thin">
                      <table className="w-full text-[10px] sm:text-xs text-left border-collapse">
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
                            <tr key={rowIdx} className="border-b last:border-0 hover:bg-muted/10">
                              {previewHeaders.map((_, colIdx) => (
                                <td key={colIdx} className="p-2 border-r truncate max-w-[120px]">
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
              </div>
            )}
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {serverErrors.length > 0 && (
            <Alert variant="destructive" className="max-h-[150px] overflow-y-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription>
                <p className="mb-2 text-xs font-semibold">Please fix the following validation errors and try again:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {serverErrors.map((err, i) => (
                    <li key={i} className="text-[11px]">{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-2 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || !!validationError || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}