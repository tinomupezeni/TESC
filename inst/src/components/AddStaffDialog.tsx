import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createStaff, CreateStaffData } from "@/services/staff.services";
import { getFaculties, Faculty } from "@/services/faculties.services"; 

export function AddStaffDialog({ onStaffAdded }: { onStaffAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateStaffData>>({
    institution: 1, // Default to current institution
    date_joined: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
    position: '',
    qualification: '',
    department: '',
    is_active: true
  });

  // Fetch Faculties when dialog opens
  useEffect(() => {
    if (open) {
      const loadFaculties = async () => {
        try {
          const data = await getFaculties();
          // Ensure we have an array
          if (Array.isArray(data)) {
            setFaculties(data);
          } else {
             console.error("Invalid faculties data format", data);
             setFaculties([]);
          }
        } catch (error) {
          console.error("Failed to load faculties", error);
          toast.error("Could not load faculty list. Please check your connection.");
        }
      };
      loadFaculties();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof CreateStaffData, value: string) => {
    // Convert ID string to number for faculty/institution relationships
    const val = (field === 'faculty' || field === 'institution') ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic Validation
      if (!formData.first_name || !formData.last_name || !formData.employee_id || !formData.email || !formData.position) {
        toast.error("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      // Call the Real Service
      await createStaff(formData as CreateStaffData);
      
      toast.success("Staff member added successfully!");
      setOpen(false);
      
      // Reset form to defaults
      setFormData({
        institution: 1,
        date_joined: new Date().toISOString().split('T')[0],
        position: '',
        qualification: '',
        is_active: true
      });
      
      // Trigger refresh in parent component
      if (onStaffAdded) onStaffAdded();
      
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || "Failed to add staff member.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>Register a new staff member in the system</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" placeholder="Sarah" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" placeholder="Ndlovu" required onChange={handleInputChange} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" placeholder="sarah.n@institution.ac.zw" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" placeholder="+263 77 123 4567" required onChange={handleInputChange} />
            </div>
          </div>

          {/* Employment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select onValueChange={(val) => handleSelectChange('position', val)} required>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                  <SelectItem value="Assistant">Assistant Lecturer</SelectItem>
                  <SelectItem value="Admin">Administrative Staff</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select onValueChange={(val) => handleSelectChange('faculty', val)}>
                <SelectTrigger id="faculty">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((fac) => (
                    <SelectItem key={fac.id} value={fac.id.toString()}>
                      {fac.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input id="department" placeholder="Computer Science" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Highest Qualification *</Label>
              <Select onValueChange={(val) => handleSelectChange('qualification', val)} required>
                <SelectTrigger id="qualification">
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Masters">Masters</SelectItem>
                  <SelectItem value="Bachelors">Bachelors</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID *</Label>
              <Input id="employee_id" placeholder="STF001" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_joined">Join Date *</Label>
              <Input 
                id="date_joined" 
                type="date" 
                required 
                defaultValue={new Date().toISOString().split('T')[0]}
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Area of Specialization</Label>
            <Textarea 
              id="specialization" 
              placeholder="e.g., Artificial Intelligence, Software Engineering" 
              rows={2} 
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Staff Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}