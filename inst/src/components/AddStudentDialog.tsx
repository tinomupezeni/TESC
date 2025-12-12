import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { createStudent, CreateStudentData } from "@/services/students.services";
import { getPrograms, Program } from "@/services/programs.services";

export function AddStudentDialog({ onStudentAdded }: { onStudentAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  
  // Form State
  const [formData, setFormData] = useState<Partial<CreateStudentData>>({
    institution: 1, // Defaulting to 1 for now, or fetch from user context
    enrollment_year: new Date().getFullYear(),
    status: 'Active'
  });

  // Fetch Programs on Mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
      } catch (error) {
        console.error("Failed to load programs", error);
        toast.error("Could not load programs list");
      }
    };
    if (open) fetchPrograms();
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof CreateStudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // Validate required fields
        if (!formData.student_id || !formData.first_name || !formData.last_name || !formData.program) {
            toast.error("Please fill in all required fields");
            return;
        }

        await createStudent(formData as CreateStudentData);
        toast.success("Student added successfully!");
        setOpen(false);
        setFormData({ institution: 1, enrollment_year: new Date().getFullYear(), status: 'Active' }); // Reset
        if (onStudentAdded) onStudentAdded(); // Refresh parent list
    } catch (error: any) {
        const errorMsg = error.response?.data?.detail || "Failed to create student";
        toast.error(errorMsg);
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>Register a new student in the system</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Personal Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" placeholder="John" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" placeholder="Doe" required onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID *</Label>
              <Input id="student_id" placeholder="ST001" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="national_id">National ID</Label>
              <Input id="national_id" placeholder="63-1234567A00" onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(val) => handleSelectChange('gender', val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" type="date" onChange={handleInputChange} />
            </div>
          </div>

          {/* Academic Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program *</Label>
              <Select onValueChange={(val) => handleSelectChange('program', val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((prog) => (
                    <SelectItem key={prog.id} value={prog.id.toString()}>
                      {prog.name} ({prog.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollment_year">Enrollment Year</Label>
              <Input 
                id="enrollment_year" 
                type="number" 
                defaultValue={new Date().getFullYear()}
                onChange={handleInputChange} 
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(val) => handleSelectChange('status', val)} defaultValue="Active">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Attachment">On Attachment</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}