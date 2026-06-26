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
import apiClient from "@/services/api";
import { getStudents, Student } from "@/services/students.services";

export function AddTransferDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [formData, setFormData] = useState({
    student: "",
    from_institution: "",
    to_institution: "",
    transfer_date: new Date().toISOString().split("T")[0],
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
      if (!formData.student || !formData.from_institution || !formData.to_institution || !formData.transfer_date) {
        toast.error("Please fill in required fields.");
        setLoading(false);
        return;
      }

      await apiClient.post("/academic/transfers/", {
        student: parseInt(formData.student),
        from_institution: formData.from_institution,
        to_institution: formData.to_institution,
        transfer_date: formData.transfer_date,
      });

      toast.success("Transfer record added successfully!");
      setOpen(false);
      setFormData({
        student: "",
        from_institution: "",
        to_institution: "",
        transfer_date: new Date().toISOString().split("T")[0],
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add transfer record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add In-Country Transfer Record</DialogTitle>
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
            <Label>From Institution *</Label>
            <Input id="from_institution" required value={formData.from_institution} onChange={handleChange} placeholder="Original Institution Name" />
          </div>
          <div className="space-y-2">
            <Label>To Institution *</Label>
            <Input id="to_institution" required value={formData.to_institution} onChange={handleChange} placeholder="Destination Institution Name" />
          </div>
          <div className="space-y-2">
            <Label>Transfer Date *</Label>
            <Input id="transfer_date" type="date" required value={formData.transfer_date} onChange={handleChange} />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Transfer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
