import { useState } from "react";
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
import { toast } from "sonner";
import apiClient from "@/services/api";

interface RowData {
  row: number;
  data: any;
  status: 'Ready' | 'Requires Student Creation' | 'Error';
  error: string | null;
}

interface Props {
  moduleType: string;
  onSuccess: () => void;
}

export function BulkUploadResolver({ moduleType, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<RowData[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleValidate = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await apiClient.post(`/academic/ingestion/validate/${moduleType}/`, formData);
      setPreview(res.data);
    } catch (e) {
      toast.error("Validation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCommit = async () => {
    try {
      await apiClient.post(`/academic/ingestion/commit/${moduleType}/`, { data: preview });
      toast.success("Data imported successfully");
      setPreview([]);
      onSuccess();
    } catch (e) {
      toast.error("Commit failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input type="file" onChange={handleFileChange} />
        <Button onClick={handleValidate} disabled={!file || uploading}>Validate</Button>
      </div>
      
      {preview.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((r, i) => (
                <TableRow key={i} className={r.status === 'Error' ? 'bg-red-100' : ''}>
                  <TableCell>{r.row}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'Ready' ? 'default' : 'secondary'}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-red-600">{r.error}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={handleCommit}>Commit Valid Rows</Button>
        </>
      )}
    </div>
  );
}