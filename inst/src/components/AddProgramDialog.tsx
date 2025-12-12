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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Services
import { createProgram } from "../services/programs.services";
import { getFaculties } from "../services/faculties.services";

export function AddProgramDialog({ institutionId = 1, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const { toast } = useToast();

  const initialData = {
    name: "",
    code: "",
    faculty: "", // This will store the ID
    duration: "",
    level: "",
    description: "",
    coordinator: "",
    student_capacity: "",
    modules: "",
    entry_requirements: "",
  };

  const [formData, setFormData] = useState(initialData);

  // Fetch faculties when dialog opens so the dropdown is populated
  useEffect(() => {
    if (open) {
      const fetchFaculties = async () => {
        setLoadingFaculties(true);
        try {
          const data = await getFaculties(institutionId);
          if (Array.isArray(data)) {
            setFaculties(data);
          }
        } catch (error) {
          console.error("Error fetching faculties", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load faculties list.",
          });
        } finally {
          setLoadingFaculties(false);
        }
      };
      fetchFaculties();
    }
  }, [open, institutionId, toast]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Generic handler for Select components
  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate Faculty Selection
      if (!formData.faculty) {
        throw new Error("Please select a faculty.");
      }

      // Convert number strings to integers
      const payload = {
        ...formData,
        faculty: parseInt(formData.faculty),
        duration: parseInt(formData.duration),
        student_capacity: parseInt(formData.student_capacity) || 0,
      };

      await createProgram(payload);

      toast({
        title: "Success",
        description: "Program added successfully!",
      });
      
      setFormData(initialData);
      setOpen(false);
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || error.message || "Failed to create program.";
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Program</DialogTitle>
          <DialogDescription>Create a new academic program under a specific faculty.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          {/* Row 1: Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Program Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g., Bachelor of Science in Computer Science" 
              required 
            />
          </div>

          {/* Row 2: Code, Faculty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Program Code</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={handleChange} 
                placeholder="e.g. BSCS" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select 
                value={formData.faculty} 
                onValueChange={(val) => handleSelectChange("faculty", val)}
                disabled={loadingFaculties}
                required
              >
                <SelectTrigger id="faculty">
                  <SelectValue placeholder={loadingFaculties ? "Loading..." : "Select faculty"} />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((fac) => (
                    <SelectItem key={fac.id} value={String(fac.id)}>
                      {fac.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Duration, Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Years)</Label>
              <Input 
                id="duration" 
                type="number" 
                value={formData.duration} 
                onChange={handleChange} 
                placeholder="4" 
                min="1"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select 
                value={formData.level} 
                onValueChange={(val) => handleSelectChange("level", val)}
                required
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelors">Bachelors</SelectItem>
                  <SelectItem value="Masters">Masters</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Program Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Brief description of the program..." 
              rows={3} 
            />
          </div>

          {/* Row 5: Coordinator, Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coordinator">Program Coordinator</Label>
              <Input 
                id="coordinator" 
                value={formData.coordinator} 
                onChange={handleChange} 
                placeholder="e.g. Dr. Smith" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_capacity">Student Capacity</Label>
              <Input 
                id="student_capacity" 
                type="number" 
                value={formData.student_capacity} 
                onChange={handleChange} 
                placeholder="100" 
              />
            </div>
          </div>

          {/* Row 6: Modules */}
        


          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Adding..." : "Add Program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}