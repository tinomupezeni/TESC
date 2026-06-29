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
import { createFacility, CreateFacilityData } from "@/services/facilities.services";
import { useAuth } from "@/context/AuthContext";

export function AddFacilityDialog({ onFacilityAdded }: { onFacilityAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState("");
  const { user } = useAuth(); 

  // FIX: Safely extract institution ID from nested object OR flat field
  // Handles: { institution: { id: 1 } } AND { institution_id: 1 }
  const institutionId = user?.institution?.id || user?.institution_id;

  // Form State
  const [formData, setFormData] = useState<Partial<CreateFacilityData>>({
    status: 'Active',
    facility_type: '',
    institution: institutionId,// Set initial value if user is already loaded
    capacity: 0,
    current_usage: 0,
  });

  // Watch for user data to load and update state
  useEffect(() => {
    if (institutionId) {
      setFormData(prev => ({ ...prev, institution: institutionId }));
    }
  }, [institutionId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;

    // Validate Phone Number: Remove any non-numeric or special characters that aren't allowed
    if (id === "contact_number") {
      const cleanedValue = value.replace(/[^0-9+\s()-]/g, "");
      setFormData(prev => ({ ...prev, [id]: cleanedValue }));
      return;
    }

    const numericFields = ['capacity', 'current_usage'];
    let val: string | number = value;

    if (numericFields.includes(id)) {
      val = parseInt(value) || 0;
    } else if (type === "text" || e.target.tagName.toLowerCase() === "textarea") {
      val = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [id]: val }));
  };


  const handleSelectChange = (field: keyof CreateFacilityData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!institutionId) {
        toast.error("Institution ID not found. Please reload or log in again.");
        setIsLoading(false);
        return;
      }

      if (!formData.name || !formData.facility_type || !formData.capacity) {
        toast.error("Please fill in required fields");
        setIsLoading(false);
        return;
      }

      // Ensure institution ID is present in payload
      const payload = {
        ...formData,
        institution: institutionId 
      } as CreateFacilityData;

      await createFacility(payload);
      
      toast.success("Facility added successfully!");
      setOpen(false);
      
      // Reset form, keeping the institution ID
      setFormData({ 
        institution: institutionId, 
        status: 'Active', 
        facility_type: '' 
      });
      setIsCustomCategory(false);
      setEquipmentList([]);
      setNewEquipment("");
      
      if (onFacilityAdded) onFacilityAdded();

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || "Failed to add facility.";
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
          Add Facility
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Add New Facility</DialogTitle>
          <DialogDescription>Register a new institutional facility</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Facility Name *</Label>
            <Input id="name" placeholder="e.g., Computer Lab A" required onChange={handleInputChange} value={formData.name || ""} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facility_type">Category *</Label>
              <div className="flex gap-2">
                {isCustomCategory ? (
                  <Input 
                    id="facility_type" 
                    placeholder="e.g., Drone Lab" 
                    required 
                    onChange={handleInputChange} 
                    value={formData.facility_type || ''} 
                    className="flex-1"
                  />
                ) : (
                  <Select value={formData.facility_type} onValueChange={(val) => handleSelectChange('facility_type', val)} required>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Sports">Sports Facility</SelectItem>
                      <SelectItem value="Innovation">Innovation Hub</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Button 
                  type="button" 
                  size="icon"
                  className={!isCustomCategory ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}
                  onClick={() => setIsCustomCategory(!isCustomCategory)} 
                  title={isCustomCategory ? "Use standard categories" : "Add custom category"}
                >
                  <Plus className={`h-4 w-4 ${isCustomCategory ? 'rotate-45 transition-transform' : 'transition-transform'}`} />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="building">Building *</Label>
              <Input id="building" placeholder="Building name/number" required onChange={handleInputChange} value={formData.building || ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input 
                id="capacity" 
                type="number" 
                min={0}
                placeholder="50" 
                required 
                onChange={handleInputChange} 
                value={formData.capacity === 0 ? '' : formData.capacity}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_usage">Current Usage</Label>
              <Input
                id="current_usage"
                type="number"
                min={0}
                placeholder="e.g. 35"
                onChange={handleInputChange}
                value={formData.current_usage === 0 ? '' : formData.current_usage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(val) => handleSelectChange('status', val)} defaultValue="Active">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Brief description of the facility" rows={3} onChange={handleInputChange} value={formData.description || ""} />
          </div>

          <div className="space-y-2">
            <Label>Available Equipment</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. PROJECTORS"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newEquipment.trim() !== '') {
                      const updatedList = [...equipmentList, newEquipment.trim().toUpperCase()];
                      setEquipmentList(updatedList);
                      setFormData(prev => ({ ...prev, equipment: updatedList.join(", ") }));
                      setNewEquipment("");
                    }
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => {
                  if (newEquipment.trim() !== '') {
                    const updatedList = [...equipmentList, newEquipment.trim().toUpperCase()];
                    setEquipmentList(updatedList);
                    setFormData(prev => ({ ...prev, equipment: updatedList.join(", ") }));
                    setNewEquipment("");
                  }
                }} 
                className="shrink-0" 
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {equipmentList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {equipmentList.map((eq, idx) => (
                  <div key={idx} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                    <span>{eq}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const updatedList = equipmentList.filter((_, i) => i !== idx);
                        setEquipmentList(updatedList);
                        setFormData(prev => ({ ...prev, equipment: updatedList.join(", ") }));
                      }}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manager">Facility Manager</Label>
              <Input id="manager" placeholder="Manager name" onChange={handleInputChange} value={formData.manager || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input 
                id="contact_number" 
                type="tel" 
                placeholder="+263 77 123 4567" 
                value={formData.contact_number || ""}
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Facility
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}