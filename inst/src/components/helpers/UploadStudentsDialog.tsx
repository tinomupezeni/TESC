import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, FileSpreadsheet, AlertCircle, 
  Loader2, Download, X, Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import studentService from "@/services/students.services";

export function UploadStudentsDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Warning & Approval States
  const [newPrograms, setNewPrograms] = useState<any[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(false);

  // File Preview States
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setRequiresApproval(false);
      setNewPrograms([]);
      setValidationError(null);
      setServerErrors([]);
      setPreviewHeaders([]);
      setPreviewRows([]);
    }
  }, [open]);

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
    setRequiresApproval(false);
    setNewPrograms([]);

    // Client-side header check
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 0) {
        const rawHeaders = data[0] as string[];
        const headers = rawHeaders.map(h => h.toLowerCase().trim().replace(/ /g, '_'));
        const hasProgram = headers.includes("program") || headers.includes("program_code");
        const restRequired = ["first_name", "last_name", "student_id", "enrollment_year"];
        const missing = restRequired.filter(col => !headers.includes(col));
        if (!hasProgram) {
          missing.push("program or program_code");
        }
        if (missing.length > 0) {
          setValidationError(`Missing required columns: ${missing.join(", ")}`);
          setFile(null);
          setPreviewHeaders([]);
          setPreviewRows([]);
        } else {
          setPreviewHeaders(rawHeaders);
          setPreviewRows(data.slice(1, 6));
        }
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleUpload = async (confirm = false) => {
    if (!file || !user?.institution?.id) return;
    
    setIsUploading(true);
    setServerErrors([]);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("institution_id", user.institution.id.toString());
      if (confirm) {
        formData.append("confirm_creation", "true");
      }

      const res = await studentService.bulkUploadStudents(formData);
      
      if (res.requires_approval) {
        setNewPrograms(res.new_programs);
        setRequiresApproval(true);
        setIsUploading(false);
        return;
      }
      
      toast.success(res.message || "Students uploaded successfully!");
      setOpen(false);
      setFile(null);
      setRequiresApproval(false);
      setNewPrograms([]);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error(error);
      
      if (error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
        toast.error("Upload failed. Please check the error list.");
      } else if (error.response?.data?.detail) {
        try {
            const parsed = JSON.parse(error.response.data.detail.replace(/'/g, '"')); 
            if (parsed.errors) setServerErrors(parsed.errors);
            else setValidationError(error.response.data.detail);
        } catch {
            setValidationError(error.response.data.detail);
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await studentService.getBulkUploadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Student_Upload_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download template. Please try again.");
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription>Enroll multiple students via Excel sheet.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          
          {requiresApproval ? (
            <div className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">New Academic Programs Detected</AlertTitle>
                <AlertDescription className="text-amber-700 text-xs">
                  The following academic programs from the uploaded file do not exist in the system yet. Proceeding will automatically create them under the specified departments/faculties:
                </AlertDescription>
              </Alert>
              <div className="border rounded-md divide-y max-h-[220px] overflow-y-auto bg-muted/20">
                {newPrograms.map((p, idx) => (
                  <div key={idx} className="p-3 text-xs flex justify-between items-center bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-semibold text-primary">{p.code}</span> - <span className="font-medium">{p.name}</span>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Department: {p.department} | Faculty: {p.faculty}
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold text-[9px] uppercase tracking-wider">
                      NEW PROGRAM
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Instructions Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline hover:text-foreground">
                        <span className="flex items-center gap-2">
                            <Info className="h-4 w-4" /> View Formatting Guidelines
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm space-y-3 bg-muted/30 p-3 rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold block mb-1">Required Columns</span>
                                <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                    <li>student_id (Unique)</li>
                                    <li>first_name</li>
                                    <li>last_name</li>
                                    <li>program_code (or program)</li>
                                    <li>enrollment_year</li>
                                    <li>gender (Male/Female)</li>
                                </ul>
                            </div>
                            <div>
                                <span className="font-semibold block mb-1">Optional Columns</span>
                                <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                    <li>national_id</li>
                                    <li>date_of_birth (YYYY-MM-DD)</li>
                                    <li>enrollment_semester (Semester 1/Semester 2)</li>
                                    <li>faculty</li>
                                    <li>department</li>
                                    <li>program_name</li>
                                    <li>status (Active/Suspended/Graduated/Dropout)</li>
                                    <li>is_work_for_fees (TRUE/FALSE)</li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                            <strong>Note:</strong> If a program code in your file does not exist, the system will ask for your approval to auto-create it under the specified faculty and department.
                        </div>
                    </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Template Download Button */}
              <div className="flex items-center justify-between border border-dashed p-4 rounded-md bg-muted/10">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Download Dynamic Template</p>
                        <p className="text-xs text-muted-foreground">Pre-formatted Excel sheet based on schema requirements</p>
                    </div>
                 </div>
                 <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" /> Download
                 </Button>
              </div>

              {/* File Input */}
              {!file ? (
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv, .xlsx"
                    onChange={handleFileChange}
                  />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Click to select file</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports .xlsx and .csv (Max 5MB)</p>
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
            </>
          )}

          {/* Errors Display */}
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
                    <p className="mb-2">Please fix the following errors in your file and try again:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        {serverErrors.map((err, i) => (
                            <li key={i} className="text-xs">{err}</li>
                        ))}
                    </ul>
                </AlertDescription>
             </Alert>
          )}
        </div>

        <DialogFooter>
          {requiresApproval ? (
            <>
              <Button variant="outline" onClick={() => { setRequiresApproval(false); setNewPrograms([]); }} disabled={isUploading}>
                Back
              </Button>
              <Button onClick={() => handleUpload(true)} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve & Enroll Students
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>Cancel</Button>
              <Button onClick={() => handleUpload(false)} disabled={!file || !!validationError || isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Students
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}