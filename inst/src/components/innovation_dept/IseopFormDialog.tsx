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
// --- IMPORT SERVICE AND TYPES ---
import iseopService, { IseopStudent, IseopProgram } from "@/services/iseop.services";

interface IseopFormProps {
  student?: IseopStudent; 
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const IseopStudentFormDialog = ({ student, trigger, onSuccess }: IseopFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!student;
  
  // State for dynamic program dropdown
  const [programs, setPrograms] = useState<IseopProgram[]>([]);
  
  
  

  // --- ALIGN WITH BACKEND MODEL ---
  const initialData: Partial<IseopStudent> = {
    institution: institutionId,
    first_name: '',
    last_name: '',
    student_id: '',
    email: '', // Added Email
    program_name: '', 
    gender: 'Other',
    status: 'Active/Enrolled',
  };

  const [formData, setFormData] = useState(initialData);

  // --- FETCH PROGRAMS DYNAMICALLY ---
  useEffect(() => {
    if (open) {
      iseopService.getPrograms()
        .then((data) => {
          if (Array.isArray(data)) {
            setPrograms(data);
          }
        })
        .catch(() => toast.error("Failed to load programs"));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (student) {
        setFormData({
          ...student,
        });
      } else {
        setFormData({ ...initialData });
      }
    }
  }, [open, student]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) return toast.error("Institution not found.");
    setLoading(true);
    
    try {
      

      if (isEditing && student?.id) {
        await iseopService.updateStudent(student.id, formData);
        toast.success("Student record updated");
      } else {
        await iseopService.createStudent(formData);
        toast.success("Student enrolled successfully");
      }
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save student record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
                  <Button className="bg-[#002e5b] gap-2">
                    <Plus className="h-4 w-4" /> {isEditing ? "Edit Student" : "Add student"}
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
              <Label>First Name *</Label>
              <Input required value={formData.first_name} onChange={e => handleChange('first_name', e.target.value)} placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input required value={formData.last_name} onChange={e => handleChange('last_name', e.target.value)} placeholder="Doe" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Student ID *</Label>
              <Input required value={formData.student_id} onChange={e => handleChange('student_id', e.target.value)} placeholder="e.g. STU-12345" />
            </div>
            {/* --- ADDED EMAIL FIELD --- */}
            <div className="space-y-2 col-span-2">
              <Label>Email Address</Label>
              <Input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="john.doe@example.com" />
            </div>
          </div>

          {/* Section 2: Program Details */}
          <Card className="bg-slate-50/50 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Program Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Program *</Label>
                <Select value={formData.program_name} onValueChange={val => handleChange('program_name', val)}>
                  <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.name}>
                        {program.name}
                      </SelectItem>
                    ))}
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
                  <SelectItem value="Active/Enrolled">Active / Enrolled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
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