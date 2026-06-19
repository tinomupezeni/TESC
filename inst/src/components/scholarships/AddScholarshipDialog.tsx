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
import { createScholarship } from "@/services/scholarships.services";
import { getStudents, Student } from "@/services/students.services";

export function AddScholarshipDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [formData, setFormData] = useState({
    student: "",
    provider_name: "",
    amount: "",
    year_awarded: new Date().getFullYear().toString(),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.student || !formData.provider_name || !formData.year_awarded) {
        toast.error("Please fill in required fields.");
        return;
      }

      await createScholarship({
        student: parseInt(formData.student),
        provider_name: formData.provider_name,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        year_awarded: parseInt(formData.year_awarded),
      });

      toast.success("Scholarship added successfully!");
      setOpen(false);
      setFormData({ student: "", provider_name: "", amount: "", year_awarded: new Date().getFullYear().toString() });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add scholarship");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Scholarship
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Scholarship</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Student *</Label>
            <Select onValueChange={(val) => setFormData(prev => ({...prev, student: val}))} value={formData.student}>
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
            <Label>Provider Name *</Label>
            <Input id="provider_name" required value={formData.provider_name} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input id="amount" type="number" value={formData.amount} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Year Awarded *</Label>
              <Input id="year_awarded" type="number" required value={formData.year_awarded} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Scholarship
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}