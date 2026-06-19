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
import { createMobility } from "@/services/mobility.services";
import { getStudents, Student } from "@/services/students.services";

export function AddMobilityDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [formData, setFormData] = useState({
    student: "",
    direction: "Outbound",
    country: "",
    foreign_institution: "",
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
      if (!formData.student || !formData.direction || !formData.country) {
        toast.error("Please fill in required fields.");
        return;
      }

      await createMobility({
        student: parseInt(formData.student),
        direction: formData.direction as "Inbound" | "Outbound",
        country: formData.country,
        foreign_institution: formData.foreign_institution || null,
      });

      toast.success("Mobility record added successfully!");
      setOpen(false);
      setFormData({ student: "", direction: "Outbound", country: "", foreign_institution: "" });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Mobility Record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add International Mobility Record</DialogTitle>
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
            <Label>Direction *</Label>
            <Select onValueChange={(val) => setFormData(prev => ({...prev, direction: val}))} value={formData.direction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inbound">Inbound</SelectItem>
                <SelectItem value="Outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Country *</Label>
            <Input id="country" required value={formData.country} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Foreign Institution</Label>
            <Input id="foreign_institution" value={formData.foreign_institution} onChange={handleChange} />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}