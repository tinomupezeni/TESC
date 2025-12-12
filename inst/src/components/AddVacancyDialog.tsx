import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createVacancy, CreateVacancyData } from "@/services/staff.services";

interface AddVacancyDialogProps {
  institutionId?: number;
  onVacancyAdded: () => void;
}

export function AddVacancyDialog({ institutionId, onVacancyAdded }: AddVacancyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateVacancyData>>({
    title: "",
    department: "",
    faculty: "",
    quantity: 1,
    deadline: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) {
        toast.error("Institution ID is missing");
        return;
    }

    setLoading(true);
    try {
      await createVacancy({
        ...formData as CreateVacancyData,
        institution: institutionId,
        quantity: Number(formData.quantity), // Ensure number
      });
      
      toast.success("Job opening posted successfully!");
      setFormData({ title: "", department: "", faculty: "", quantity: 1, deadline: "", description: "" }); // Reset
      setOpen(false);
      onVacancyAdded(); // Refresh parent list
    } catch (error) {
      toast.error("Failed to post vacancy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Post Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Post New Job Opening</DialogTitle>
          <DialogDescription>
            Create a vacancy record for recruitment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" placeholder="e.g., Senior Lecturer" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty (Optional)</Label>
              <Input id="faculty" placeholder="e.g., Engineering" value={formData.faculty} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g., Computer Science" value={formData.department} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Positions Available</Label>
              <Input id="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input id="deadline" type="date" value={formData.deadline} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" placeholder="Brief details about the role..." value={formData.description} onChange={handleChange} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Posting..." : "Post Vacancy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}