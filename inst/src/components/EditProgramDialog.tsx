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

  const [formData, setFormData] = useState({
    name: program.name || "",
    code: program.code || "",
    faculty: program.faculty?.toString() || "",
    department: program.department?.toString() || "",
    category: program.category || "",
    duration: program.duration?.toString() || "",
    level: program.level || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {program.name}</DialogTitle>
          <DialogDescription>Update the details for this academic program.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(v) => handleSelectChange("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROGRAM_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Coordinator</Label>
              <Popover open={openCoordinatorBox} onOpenChange={setOpenCoordinatorBox}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between font-normal">
                    {formData.coordinator || "Select staff..."}
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
            <div className="space-y-2">
              <Label>Level *</Label>
              <Select value={formData.level} onValueChange={(v) => handleSelectChange("level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Certificate", "Diploma", "Bachelors", "Masters", "PhD", "Other"].map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
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