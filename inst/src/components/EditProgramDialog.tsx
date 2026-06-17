import { useState, useEffect, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pencil, Loader2, Check, ChevronsUpDown 
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Services
import { updateProgram, Program } from "@/services/programs.services";
import { getFaculties, getDepartments, Faculty, Department } from "@/services/faculties.services";
import { getStaff, Staff } from "@/services/staff.services";

const PROGRAM_CATEGORIES = [
  { value: "STEM", label: "STEM (Science, Tech, Engineering, Math)" },
  { value: "HEALTH", label: "Health Sciences & Medicine" },
  { value: "BUSINESS", label: "Business & Management" },
  { value: "SOCIAL", label: "Social Sciences" },
  { value: "HUMANITIES", label: "Humanities & Arts" },
  { value: "EDUCATION", label: "Education & Teaching" },
  { value: "LAW", label: "Law & Legal Studies" },
  { value: "VOCATIONAL", label: "Vocational & Technical Training" },
  { value: "INTERDISCIPLINARY", label: "Interdisciplinary Studies" },
];

const PROGRAM_LEVELS = [
  "Class 4", "Class 3", "Class 2", "Class 1",
  "National Certificate", "National Foundation Certificate",
  "Certificate", "Diploma", "Bachelors", "Masters", "PhD", "Other"
];

interface EditProgramDialogProps {
  program: Program;
  institutionId: number;
  onSuccess?: () => void;
}

export function EditProgramDialog({ program, institutionId, onSuccess }: EditProgramDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [openCoordinatorBox, setOpenCoordinatorBox] = useState(false);

  // Initialize with correct array structure
  const [formData, setFormData] = useState({
    name: program.name || "",
    code: program.code || "",
    faculty: program.faculty?.toString() || "",
    department: program.department?.toString() || "",
    categories: Array.isArray(program.categories) ? program.categories : [program.category].filter(Boolean),
    duration: program.duration?.toString() || "",
    levels: Array.isArray(program.levels) ? program.levels : [program.level].filter(Boolean),
    description: program.description || "",
    coordinator: program.coordinator || "",
    student_capacity: program.student_capacity?.toString() || "",
    modules: program.modules || "",
    entry_requirements: program.entry_requirements || "",
  });

  // Fetch lists when dialog opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [facData, deptData, staffData] = await Promise.all([
            getFaculties(institutionId),
            getDepartments({ institution: institutionId }),
            getStaff({ institution_id: institutionId, status: 'active' })
          ]);

          if (Array.isArray(facData)) setFaculties(facData);
          if (Array.isArray(deptData)) setDepartments(deptData);
          if (Array.isArray(staffData)) setStaffList(staffData);
        } catch (error) {
          toast.error("Could not load form data.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, institutionId]);

  const filteredDepartments = useMemo(() => {
    if (!formData.faculty) return [];
    return departments.filter(d => d.faculty.toString() === formData.faculty);
  }, [departments, formData.faculty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'faculty' ? { department: "" } : {})
    }));
  };

  const toggleSelection = (field: 'categories' | 'levels', value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.categories.length === 0 || formData.levels.length === 0) {
        toast.error("Please select at least one level and one category.");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        department: parseInt(formData.department),
        duration: parseInt(formData.duration),
        student_capacity: parseInt(formData.student_capacity) || 0,
      };

      await updateProgram(program.id, payload);
      toast.success("Program updated successfully!");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <Pencil className="h-4 w-4 mr-2" /> Edit Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {program.name}</DialogTitle>
          <DialogDescription>Update the details for this academic program.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Program Code *</Label>
                  <Input id="code" value={formData.code} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Years) *</Label>
                  <Input id="duration" type="number" value={formData.duration} onChange={handleChange} required />
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-md border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Faculty *</Label>
                    <Select value={formData.faculty} onValueChange={(v) => handleSelectChange("faculty", v)}>
                      <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                      <SelectContent>
                        {faculties.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select value={formData.department} onValueChange={(v) => handleSelectChange("department", v)} disabled={!formData.faculty}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {filteredDepartments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label>Coordinator</Label>
                  <Popover open={openCoordinatorBox} onOpenChange={setOpenCoordinatorBox}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-between font-normal">
                        <span className="truncate">{formData.coordinator || "Select staff..."}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search staff..." />
                        <CommandList>
                          <CommandEmpty>No staff found.</CommandEmpty>
                          <CommandGroup>
                            {staffList.map(s => (
                              <CommandItem key={s.id} onSelect={() => { handleSelectChange("coordinator", s.full_name); setOpenCoordinatorBox(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", formData.coordinator === s.full_name ? "opacity-100" : "opacity-0")} />
                                {s.full_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Levels */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Available Levels *</Label>
                <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 rounded-lg border max-h-[200px] overflow-y-auto">
                  {PROGRAM_LEVELS.map((l) => (
                    <div key={l} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-level-${l}`} 
                        checked={formData.levels.includes(l)}
                        onCheckedChange={() => toggleSelection('levels', l)}
                      />
                      <label htmlFor={`edit-level-${l}`} className="text-xs cursor-pointer">{l}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Program Categories *</Label>
                <div className="space-y-2 p-4 bg-muted/20 rounded-lg border max-h-[200px] overflow-y-auto">
                  {PROGRAM_CATEGORIES.map((c) => (
                    <div key={c.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-cat-${c.value}`} 
                        checked={formData.categories.includes(c.value)}
                        onCheckedChange={() => toggleSelection('categories', c.value)}
                      />
                      <label htmlFor={`edit-cat-${c.value}`} className="text-xs cursor-pointer">{c.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                  <Label htmlFor="student_capacity">Student Capacity</Label>
                  <Input 
                    id="student_capacity" 
                    type="number" 
                    value={formData.student_capacity} 
                    onChange={handleChange} 
                  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Program Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={2} 
                />
              </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}