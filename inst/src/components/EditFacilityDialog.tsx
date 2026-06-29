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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateFacility, Facility } from "@/services/facilities.services";

interface EditFacilityDialogProps {
  facility: Facility | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditFacilityDialog({ facility, onClose, onSuccess }: EditFacilityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formData, setFormData] = useState<Partial<Facility>>({});
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState("");

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name,
        facility_type: facility.facility_type,
        building: facility.building,
        capacity: facility.capacity,
        current_usage: facility.current_usage,
        status: facility.status,
        description: facility.description,
        equipment: facility.equipment,
        manager: facility.manager,
        contact_number: facility.contact_number,
      });

      const standardTypes = ["Accommodation", "Laboratory", "Library", "Sports", "Innovation Hub", "Other"];
      if (facility.facility_type && !standardTypes.includes(facility.facility_type)) {
        setIsCustomCategory(true);
      } else {
        setIsCustomCategory(false);
      }

      if (facility.equipment) {
        setEquipmentList(facility.equipment.split(',').map(e => e.trim()).filter(e => e));
      } else {
        setEquipmentList([]);
      }
      setNewEquipment("");
    }
  }, [facility]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;

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

  const handleSelectChange = (field: keyof Facility, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;
    setIsLoading(true);

    try {
      await updateFacility(facility.id, formData);
      toast.success("Facility updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || "Failed to update facility.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!facility} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Edit Facility</DialogTitle>
          <DialogDescription>Update details for {facility?.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Facility Name *</Label>
            <Input id="name" value={formData.name || ""} required onChange={handleInputChange} />
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
              <Input id="building" value={formData.building || ""} required onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input 
                id="capacity" 
                type="number" 
                min={0}
                value={formData.capacity === 0 ? '' : formData.capacity}
                required 
                onChange={handleInputChange} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_usage">Current Usage</Label>
              <Input
                id="current_usage"
                type="number"
                min={0}
                value={formData.current_usage === 0 ? '' : formData.current_usage}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
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
            <Textarea id="description" value={formData.description || ""} rows={3} onChange={handleInputChange} />
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
              <Input id="manager" value={formData.manager || ""} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input 
                id="contact_number" 
                type="tel" 
                value={formData.contact_number || ""}
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}