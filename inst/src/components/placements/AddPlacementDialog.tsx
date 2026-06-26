import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPlacement } from "@/services/placements.services";
import { getStudents, Student } from "@/services/students.services";

export function AddPlacementDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [formData, setFormData] = useState({
    student: "",
    placement_type: "Attachment",
    company_name: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (open) {
      const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
          const data = await getStudents();
          setStudents(data);
        } catch (error) {
          toast.error("Failed to load students.");
        } finally {
          setLoadingStudents(false);
        }
      };
      fetchStudents();
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.student || !formData.company_name || !formData.start_date) {
        toast.error("Please fill in required fields.");
        return;
      }

      await createPlacement({
        student: parseInt(formData.student),
        placement_type: formData.placement_type as "Attachment" | "Apprenticeship",
        company_name: formData.company_name,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
      });

      toast.success("Placement added successfully!");
      setOpen(false);
      setFormData({ student: "", placement_type: "Attachment", company_name: "", start_date: "", end_date: "" });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add placement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Placement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Placement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Student *</Label>
            <Select onValueChange={(val) => handleSelectChange("student", val)} value={formData.student}>
              <SelectTrigger disabled={loadingStudents}>
                <SelectValue placeholder={loadingStudents ? "Loading..." : "Select Student"} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.full_name} ({s.student_id})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select onValueChange={(val) => handleSelectChange("placement_type", val)} value={formData.placement_type}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Attachment">Attachment</SelectItem>
                <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Company Name *</Label>
            <Input id="company_name" required value={formData.company_name} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input id="start_date" type="date" required value={formData.start_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input id="end_date" type="date" value={formData.end_date} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Placement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}