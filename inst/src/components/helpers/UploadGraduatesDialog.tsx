import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import apiClient from "@/services/api";

interface UploadGraduatesDialogProps {
  onSuccess: () => void;
}

const REQUIRED_COLUMNS = [
  "student_id",
  "first_name",
  "last_name",
  "gender",
  "program_code",
  "graduation_year",
  "final_grade"
];

export function UploadGraduatesDialog({ onSuccess }: UploadGraduatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Preview States
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (!open) {
      setFile(null);
      setValidationError(null);
      setServerErrors([]);
      setPreviewHeaders([]);
      setPreviewRows([]);
    }
  }, [open]);

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      const response = await apiClient.get('/academic/graduates-mgmt/template/', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Graduates_Bulk_Upload_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Template download error:", error);
      toast.error("Failed to download template.");
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUpload = async () => {
    if (!file || !user?.institution?.id) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setServerErrors([]);

    try {
      const response = await apiClient.post('/academic/graduates-mgmt/bulk-upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message || "Graduates processed successfully");
      setOpen(false);
      setFile(null);
      onSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        setServerErrors(errors);
        toast.error(`Upload completed with errors. Please check the error list.`);
      } else {
        setValidationError(error.response?.data?.detail || "Failed to upload file");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto h-9">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Graduates</DialogTitle>
          <DialogDescription>
            Upload historical graduation data or update existing students using an Excel template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-muted/10">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-semibold mb-1">Step 1: Download Template</p>
            <p className="text-xs text-muted-foreground text-center mb-4 max-w-[320px]">
              Use our pre-formatted template to ensure student details match the required schema.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download Excel Template
            </Button>
          </div>

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
                  accept=".csv, .xlsx"
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
                      <p className="text-xs text-muted-foreground">Ready to upload</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setValidationError(null); setServerErrors([]); setPreviewHeaders([]); setPreviewRows([]); }}>
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
              <AlertTitle>Format Error</AlertTitle>
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || !!validationError || loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Upload & Process
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}