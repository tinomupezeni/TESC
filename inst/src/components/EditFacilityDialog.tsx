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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateFacility, Facility } from "@/services/facilities.services";

interface EditFacilityDialogProps {
  facility: Facility | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditFacilityDialog({ facility, onClose, onSuccess }: EditFacilityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Facility>>({});

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
    }
  }, [facility]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    if (id === "contact_number") {
      const cleanedValue = value.replace(/[^0-9+\s()-]/g, "");
      setFormData(prev => ({ ...prev, [id]: cleanedValue }));
      return;
    }

    const numericFields = ['capacity', 'current_usage'];
    const val = numericFields.includes(id) ? parseInt(value) || 0 : value;

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
              <Label htmlFor="facility_type">Facility Type *</Label>
              <Select value={formData.facility_type} onValueChange={(val) => handleSelectChange('facility_type', val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accommodation">Accommodation</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Library">Library</SelectItem>
                  <SelectItem value="Sports">Sports Facility</SelectItem>
                  <SelectItem value="Innovation">Innovation Center</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
                value={formData.capacity || 0}
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
                value={formData.current_usage || 0}
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
            <Label htmlFor="equipment">Available Equipment (comma-separated)</Label>
            <Textarea 
              id="equipment" 
              value={formData.equipment || ""}
              rows={2} 
              onChange={handleInputChange}
            />
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