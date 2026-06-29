import { useState, useRef } from "react";
import { 
  UploadCloud, AlertCircle, 
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
import iseopService from "@/services/iseop.services";

export function UploadIseopStudentsDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setFile(null);
      setServerErrors([]);
      setValidationError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setValidationError(null);
    setServerErrors([]);
    
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
      setValidationError("Please upload a valid .xlsx or .csv file");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setValidationError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setServerErrors([]);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setServerErrors([]);
      setValidationError(null);

      const response = await iseopService.bulkUploadStudents(file);
      
      if (response.error_count > 0) {
        toast.warning(`Uploaded ${response.created_count} students. ${response.error_count} rows failed.`);
        if (response.errors && Array.isArray(response.errors)) {
            setServerErrors(response.errors);
            return; // Don't close dialog if there are errors to show
        }
      } else {
        toast.success(`Successfully uploaded ${response.created_count} students!`);
      }

      if (onSuccess) onSuccess();
      setOpen(false); // Close dialog on full success
    } catch (error: any) {
      console.error(error);
      toast.error("Upload failed. Ensure CSV headers are correct.");
      if (error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
      } else if (error.response?.data?.detail) {
        setValidationError(error.response.data.detail);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = "student_id,first_name,last_name,national_id,email_or_phone,gender,program,status,enrollment_date\n";
    const blob = new Blob([headers], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "iseop_student_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-[10px] sm:text-xs">
          <UploadCloud className="mr-2 h-3.5 w-3.5" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Upload ISEOP Students</DialogTitle>
          <DialogDescription>Enroll multiple ISEOP students via CSV sheet.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 overflow-y-auto flex-grow pr-1">
          {/* Instructions Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline hover:text-foreground">
                    <span className="flex items-center gap-2">
                        <Info className="h-4 w-4" /> View Formatting Guidelines
                    </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm space-y-3 bg-muted/30 p-3 rounded-md">
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium">Pre-formatted CSV sheet based on schema requirements</span>
                        <Button variant="outline" size="sm" onClick={downloadTemplate} className="h-8">
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download Template
                        </Button>
                    </div>
                </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* File Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
                file ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => !file && fileInputRef.current?.click()}
            style={{ cursor: file ? 'default' : 'pointer' }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx"
              className="hidden"
            />
            
            {file ? (
              <div className="flex items-center justify-between w-full max-w-sm p-3 bg-background border rounded-md shadow-sm">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <UploadCloud className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFile(); }} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click to select file</p>
                  <p className="text-xs text-muted-foreground">Supports .csv (Max 5MB)</p>
                </div>
              </div>
            )}
          </div>

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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || !!validationError || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Students
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
