import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
// Note: Ensure your service names match your backend or keep as generic
import { createProject, updateProject } from "@/services/innovation.services"; 

interface IseopFormProps {
  project?: any; // For editing existing student
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const ProjectFormDialog = ({ project, trigger, onSuccess }: IseopFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!project;

  const initialData = {
    institution: institutionId,
    name: '',           // Student Name
    national_id: '',    // Student ID
    program_name: '',   // Selected Program
    duration: '',       // e.g. 6 Months, 1 Year
    enrollment_date: '',
    sector: '',         // Skills Sector
    gender: 'Male',
    certification_level: 'certificate', // certificate, diploma, etc.
    status: 'active',
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({
          ...project,
          institution: project.institution,
        });
      } else {
        setFormData({ ...initialData, institution: institutionId });
      }
    }
  }, [open, project, institutionId]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditing) {
        await updateProject(project.id, formData);
        toast.success("Student record updated");
      } else {
        await createProject(formData);
        toast.success("Student enrolled successfully");
      }
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to save student record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button className="bg-[#002e5b]">
            <Plus className="mr-2 h-4 w-4"/> Add Student
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {isEditing ? "Edit Student Record" : "ISEOP Student Enrollment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          
          {/* Section 1: Personal Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Student Full Name *</Label>
              <Input required value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label>National ID / Student ID</Label>
              <Input value={formData.national_id} onChange={e => handleChange('national_id', e.target.value)} placeholder="e.g. 63-123456-X-00" />
            </div>
          </div>

          {/* Section 2: Program Details */}
          <Card className="bg-slate-50/50 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Program Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Name *</Label>
                <Select value={formData.program_name} onValueChange={val => handleChange('program_name', val)}>
                  <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it_support">IT Support & Maintenance</SelectItem>
                    <SelectItem value="garment_making">Garment Making</SelectItem>
                    <SelectItem value="welding">Welding & Fabrication</SelectItem>
                    <SelectItem value="bricklaying">Bricklaying & Masonry</SelectItem>
                    <SelectItem value="culinary">Culinary Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Program Duration *</Label>
                <Select value={formData.duration} onValueChange={val => handleChange('duration', val)}>
                  <SelectTrigger><SelectValue placeholder="Select Duration" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3_months">3 Months (Short Course)</SelectItem>
                    <SelectItem value="6_months">6 Months (Basic)</SelectItem>
                    <SelectItem value="1_year">1 Year (National Foundation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enrollment Date</Label>
                <Input type="date" value={formData.enrollment_date} onChange={e => handleChange('enrollment_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Certification Level</Label>
                <Select value={formData.certification_level} onValueChange={val => handleChange('certification_level', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certificate">Certificate of Competency</SelectItem>
                    <SelectItem value="foundation">National Foundation Certificate</SelectItem>
                    <SelectItem value="trade_test">Trade Test Class 2/3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Classification */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={val => handleChange('gender', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Enrollment Status</Label>
              <Select value={formData.status} onValueChange={val => handleChange('status', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active / Enrolled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" className="mt-2 bg-[#002e5b] hover:bg-[#001f3d]" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            {isEditing ? "Update Enrollment" : "Confirm Enrollment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};