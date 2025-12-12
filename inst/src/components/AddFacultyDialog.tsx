import { useState } from "react";
import { Plus, Building2, User, MapPin, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"; // Ensure this hook exists in your project
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { createFaculty } from "@/services/faculties.services";

export function AddFacultyDialog({ institutionId = 1, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Initial State
  const initialData = {
    name: "",
    dean: "",
    location: "",
    email: "",
    status: "Active",
    description: "",
  };

  const [formData, setFormData] = useState(initialData);

  // Handle Text Inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle Select Input separately (Radix UI pattern)
  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload (ensure institution ID is included)
      const payload = {
        ...formData,
        institution: institutionId,
      };

      await createFaculty(payload);

      toast({
        title: "Success",
        description: "Faculty created successfully.",
        variant: "default", // or "success" if you have custom variants
      });

      // Reset form and close dialog
      setFormData(initialData);
      setOpen(false);
      
      // Refresh parent list if callback provided
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Failed to create faculty:", error);
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.name?.[0] || 
                           "Failed to create faculty. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Faculty</DialogTitle>
            <DialogDescription>
              Create a new faculty department. Fill in the administration details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            {/* Basic Info Section */}
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Faculty Name
                </Label>
                <div className="col-span-3 relative">
                  <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Faculty of Science" 
                    className="pl-9" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dean" className="text-right">
                  Dean / Lead
                </Label>
                <div className="col-span-3 relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="dean" 
                    value={formData.dean}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Jane Doe" 
                    className="pl-9" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Contact & Location Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location / Building</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="location" 
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. North Wing" 
                    className="pl-9" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="faculty@uni.edu" 
                    className="pl-9" 
                  />
                </div>
              </div>
            </div>

            {/* Status & Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="status" className="text-right pt-2">
                Status
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Setup">In Setup</SelectItem>
                    <SelectItem value="Review">Under Review</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <div className="col-span-3 relative">
                <FileText className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the faculty's academic focus..." 
                  className="pl-9 min-h-[100px]"
                />
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Faculty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}