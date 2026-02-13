import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import iseopService, { IseopProgram } from "@/services/iseop.services";

interface ProgramFormDialogProps {
  program?: IseopProgram; // for editing
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const IseopProgramFormDialog = ({ program, trigger, onSuccess }: ProgramFormDialogProps) => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!program;

  const initialData: Partial<IseopProgram> = {
    name: "",
    capacity: 0,
    occupied: 0,
    status: "Active",
    activity_level: "",
    description: "",
  };

  const [formData, setFormData] = useState<Partial<IseopProgram>>(initialData);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (open) {
      if (program) setFormData({ ...program });
      else setFormData({ ...initialData });
    }
  }, [open, program]);

  const handleChange = <K extends keyof IseopProgram>(field: K, value: IseopProgram[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) return toast.error("Session expired. Please log in again.");

    setLoading(true);
    try {
      if (isEditing && program?.id) {
        await iseopService.updateProgram(program.id, formData);
        toast.success("Program updated successfully!");
      } else {
        await iseopService.createProgram({
          ...formData,
          institution: institutionId, // REQUIRED for backend
        });
        toast.success("Program added successfully!");
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save program.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#002e5b] gap-2">
            <Plus className="h-4 w-4" /> {isEditing ? "Edit Program" : "Add Program"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit ISEOP Program" : "Add ISEOP Program"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Program Name */}
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              required
              value={formData.name || ""}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Program Name"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label>Capacity *</Label>
            <Input
              type="number"
              required
              value={formData.capacity || 0}
              onChange={e => handleChange("capacity", parseInt(e.target.value))}
              placeholder="0"
            />
          </div>

          {/* Occupied */}
          <div className="space-y-2">
            <Label>Occupied</Label>
            <Input
              type="number"
              value={formData.occupied || 0}
              onChange={e => handleChange("occupied", parseInt(e.target.value))}
              placeholder="0"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={formData.status || "Active"}
              onValueChange={val => handleChange("status", val as "Active" | "Full" | "Closed")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Full">Full</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration / Activity Level */}
          <div className="space-y-2">
            <Label>Duration / Activity Level</Label>
            <Input
              value={formData.activity_level || ""}
              onChange={e => handleChange("activity_level", e.target.value)}
              placeholder="e.g. 3 Months, 6 Months"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description || ""}
              onChange={e => handleChange("description", e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <Button type="submit" className="mt-4 w-full bg-[#002e5b] hover:bg-[#001f3d]" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            {isEditing ? "Update Program" : "Add Program"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
