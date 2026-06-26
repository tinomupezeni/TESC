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

interface MarkGraduatedDialogProps {
  student: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function MarkGraduatedDialog({ student, onClose, onSuccess }: MarkGraduatedDialogProps) {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [grade, setGrade] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (!year || !grade) {
      toast.error("Please provide both graduation year and final grade.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch(`/academic/students/${student.id}/`, {
        status: "Graduated",
        graduation_year: parseInt(year),
        final_grade: grade
      });

      toast.success(`${student.full_name} has been marked as graduated.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Graduation error:", error);
      toast.error(error.response?.data?.detail || "Failed to update student status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Mark as Graduated
          </DialogTitle>
          <DialogDescription>
            Update the status of <span className="font-semibold">{student?.full_name}</span> to Graduated.
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
            <Label htmlFor="grade">Final Grade <span className="text-destructive">*</span></Label>
            <Select value={grade} onValueChange={setGrade} required>
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select final grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Distinction">Distinction</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Graduation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
