import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api";

interface UploadGraduatesDialogProps {
  onSuccess: () => void;
}

export function UploadGraduatesDialog({ onSuccess }: UploadGraduatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { user } = useAuth();

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      // The backend endpoint defined in our GraduateViewSet
      const response = await apiClient.get('/academic/graduates-mgmt/template/', {
        responseType: 'blob', // Important for downloading files
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Graduates_Bulk_Upload_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Template download error:", error);
      toast.error("Failed to download template.");
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user?.institution?.id) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
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
        toast.error(`Upload completed with errors. See console for details.`);
        console.error("Row errors:", errors);
      } else {
        toast.error(error.response?.data?.detail || "Failed to upload file");
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Graduates</DialogTitle>
          <DialogDescription>
            Upload historical graduation data or update existing students using an Excel template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/50">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">Step 1: Download Template</p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Get the latest template. It includes dropdowns for validation.
            </p>
            <Button
              variant="secondary"
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
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer border border-input rounded-md"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Upload & Process
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}