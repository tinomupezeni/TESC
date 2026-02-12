import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Plus, GraduationCap } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from "sonner";
import { createprograms, updateprograms } from "@/services/iseop.services"; 


export const IseopFormDialog = ({ hub, trigger, onSuccess }: any) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Gets the institution ID from the logged-in user context
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!hub;

  const initialData = {
    name: "",
    capacity: 0,
    occupied: 0,
    status: "Active",
    duration: "Medium Activity", 
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (open) {
      if (hub) {
        setFormData({
          name: hub.name || "",
          capacity: hub.capacity || 0,
          occupied: hub.occupied || 0,
          status: hub.status || "Active",
          duration: hub.activity_level || "Medium Activity"
        });
      } else {
        setFormData(initialData);
      }
    }
  }, [open, hub]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!institutionId) {
      toast.error("User session expired. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      // PAYLOAD MAPPING: Matches your updated academic/models.py
      const payload = { 
        name: formData.name.trim(),
        capacity: Number(formData.capacity),
        occupied: Number(formData.occupied),
        status: formData.status,
        activity_level: formData.duration, // Mapped to the backend field
        institution: institutionId        // Foreign Key ID
      };

      if (isEditing) {
        await updateprograms(hub.id, payload);
        toast.success("ISEOP Program updated successfully");
      } else {
        await createprograms(payload);
        toast.success("New ISEOP Program created");
      }

      setOpen(false);
      if (onSuccess) onSuccess(); // Refreshes the list in the parent component
    } catch (error: any) {
      console.error("Backend Error:", error.response?.data);
      
      // Extracts specific Django error messages if they exist
      const serverErrors = error.response?.data;
      let errorMessage = "Failed to save program.";

      if (serverErrors && typeof serverErrors === 'object') {
        const firstField = Object.keys(serverErrors)[0];
        const errorDetail = serverErrors[firstField];
        errorMessage = Array.isArray(errorDetail) ? errorDetail[0] : errorDetail;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button className="gap-2 bg-[#002e5b] hover:bg-[#001f3d]">
            <Plus className="h-4 w-4" /> Add Program
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#002e5b]">
            <GraduationCap className="h-5 w-5" />
            {isEditing ? "Edit ISEOP Program" : "Add New ISEOP Program"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500">Program Name *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Garment Making & Fashion Design"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500">Program Duration</Label>
            <Select 
              value={formData.duration} 
              onValueChange={(val) => setFormData({...formData, duration: val})}
            >
              <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low Activity">3 Months (Short Course)</SelectItem>
                <SelectItem value="Medium Activity">6 Months (Standard)</SelectItem>
                <SelectItem value="High Activity">1 Year (Diploma)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-slate-500">Target Quota</Label>
              <Input
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-slate-500">Current Enrollment</Label>
              <Input
                type="number"
                min="0"
                value={formData.occupied}
                onChange={(e) => setFormData({ ...formData, occupied: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500">Admission Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Open</SelectItem>
                <SelectItem value="Full">Full</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#002e5b] hover:bg-[#001f3d] mt-4" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : (isEditing ? "Update Hub" : "Create Hub")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};