import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api";

interface BulkMarkGraduatedDialogProps {
  studentIds: number[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkMarkGraduatedDialog({ studentIds, open, onClose, onSuccess }: BulkMarkGraduatedDialogProps) {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [grade, setGrade] = useState<string>("Pass");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentIds.length === 0) return;

    if (!year) {
      toast.error("Please provide a graduation year.");
      return;
    }

    setLoading(true);
    try {
      // If grade is "none", send null to the backend
      const finalGrade = grade === "none" ? null : grade;

      await apiClient.post(`/academic/graduates-mgmt/bulk-actions/`, {
        action: "graduate",
        student_ids: studentIds,
        graduation_year: parseInt(year),
        final_grade: finalGrade
      });

      toast.success(`${studentIds.length} students have been marked as graduated.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Bulk graduation error:", error);
      toast.error(error.response?.data?.detail || "Failed to update students status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Bulk Graduation
          </DialogTitle>
          <DialogDescription>
            You are about to graduate <span className="font-semibold text-foreground">{studentIds.length}</span> selected students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="year">Graduation Year <span className="text-destructive">*</span></Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              min={2000}
              max={2100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Final Grade (Optional)</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select final grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Distinction">Distinction</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
                <SelectItem value="none">None / Unspecified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6 flex flex-row justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Graduate Selected
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
