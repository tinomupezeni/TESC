import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom"; // For navigation links
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, AlertCircle, ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // Import Auth
import { createStudent, updateStudent, getStudents, CreateStudentData, Student } from "@/services/students.services";
// Import necessary services and types
import { getPrograms, Program } from "@/services/programs.services";
import { cn } from "@/lib/utils";
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
import {
  getFaculties,
  getDepartments,
  Faculty,
  Department,
} from "@/services/faculties.services";

// --- Mapped Backend Choices ---
// Ensure these values match exactly what is in your Django models.py
const DISABILITY_OPTIONS = [
  { value: "None", label: "None" },
  { value: "Physical", label: "Physical / Mobility Impairment" },
  { value: "Amputation", label: "Amputation" },
  { value: "Paralysis", label: "Paralysis" },
  { value: "CerebralPalsy", label: "Cerebral Palsy" },
  { value: "SpinalCord", label: "Spinal Cord Injury" },
  { value: "Visual", label: "Visual Impairment" },
  { value: "Hearing", label: "Hearing Impairment" },
  { value: "Speech", label: "Speech Impairment" },
  { value: "DeafBlind", label: "Deaf-Blindness" },
  { value: "Intellectual", label: "Intellectual Disability" },
  { value: "Learning", label: "Learning Disability" },
  { value: "Autism", label: "Autism Spectrum Disorder" },
  { value: "ADHD", label: "Attention Deficit Hyperactivity Disorder" },
  { value: "Epilepsy", label: "Epilepsy" },
  { value: "MentalHealth", label: "Mental / Psychosocial Disability" },
  { value: "Albino", label: "Albinism" },
  { value: "DownSyndrome", label: "Down Syndrome" },
  { value: "SickleCell", label: "Sickle Cell Disease" },
  { value: "ChronicIllness", label: "Chronic Illness" },
  { value: "Multiple", label: "Multiple Disabilities" },
  { value: "Other", label: "Other (Specify)" },
];

const WORK_AREA_OPTIONS = [
  { value: "Library", label: "Library Assistant" },
  { value: "Labs", label: "Laboratory Assistant" },
  { value: "Tutorials", label: "Tutorial / Peer Learning Support" },
  { value: "E_Learning", label: "E-Learning Support" },
  { value: "Research", label: "Research Assistant" },
  { value: "Kitchen", label: "Kitchen" },
  { value: "Admin", label: "Administrative Support" },
  { value: "Registry", label: "Registry / Records Office" },
  { value: "Admissions", label: "Admissions Office" },
  { value: "Exams", label: "Examinations Office" },
  { value: "Finance", label: "Finance / Accounts Office" },
  { value: "HR", label: "Human Resources Support" },
  { value: "ICT", label: "ICT / IT Support" },
  { value: "Systems", label: "Systems Administration Support" },
  { value: "Data", label: "Data Entry / Data Support" },
  { value: "Media", label: "Media & Communications Support" },
  { value: "Grounds", label: "Grounds Maintenance" },
  { value: "Maintenance", label: "General Maintenance" },
  { value: "Electrical", label: "Electrical Maintenance" },
  { value: "Plumbing", label: "Plumbing Maintenance" },
  { value: "Cleaning", label: "Cleaning / Janitorial Services" },
  { value: "DisabilitySupport", label: "Disability Support Services" },
  { value: "Counselling", label: "Counselling & Wellness Support" },
  { value: "Health", label: "Health Services Support" },
  { value: "Sports", label: "Sports & Recreation Support" },
  { value: "StudentAffairs", label: "Student Affairs Office" },
  { value: "Security", label: "Security Services" },
  { value: "Transport", label: "Transport & Logistics" },
  { value: "Tuckshop", label: "Tuckshop,Stores & Inventory Management" },
  { value: "Innovation", label: "Innovation & Entrepreneurship Hub" },
  { value: "Industry", label: "Industry Liaison / Attachment Support" },
  { value: "Incubation", label: "Business Incubation Support" },
  { value: "FieldWork", label: "Field Work / Outreach" },
  { value: "Multiple", label: "Multiple Work Areas" },
  { value: "Other", label: "Other (Specify)" },
];

const PROGRAM_CATEGORIES = {
  "STEM": "STEM (Science, Tech, Engineering, Math)",
  "SPECIALIZED": "Specialized Skills",
  "CRITICAL": "Critical Skills",
  "HEALTH": "Health Sciences & Medicine",
  "BUSINESS": "Business & Management",
  "SOCIAL": "Social Sciences",
  "HUMANITIES": "Humanities & Arts",
  "EDUCATION": "Education & Teaching",
  "LAW": "Law & Legal Studies",
  "VOCATIONAL": "Vocational & Technical Training",
  "INTERDISCIPLINARY": "Interdisciplinary Studies",
};

export function AddStudentDialog({
  onStudentAdded,
  isStudentDirectory = false,
  defaultCategory = "",
}: {
  onStudentAdded?: () => void;
  isStudentDirectory?: boolean;
  defaultCategory?: string;
}) {
  const { user } = useAuth(); // Get Institution ID from context
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Data State
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Search States
  const [existingStudents, setExistingStudents] = useState<Student[]>([]);
  const [searchRegQuery, setSearchRegQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Form Visibility State
  const [showFullForm, setShowFullForm] = useState(isStudentDirectory);

  // Custom program auto-creation states
  const [isCreatingNewProgram, setIsCreatingNewProgram] = useState(false);
  const [newProgramCode, setNewProgramCode] = useState("");
  const [newProgramName, setNewProgramName] = useState("");
  const [newProgramLevel, setNewProgramLevel] = useState("Degree");
  const [newProgramCategory, setNewProgramCategory] = useState("STEM");

  // Selection State (for cascading dropdowns & toggles)
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [isWorkForFees, setIsWorkForFees] = useState(false);
  const [selectedDisability, setSelectedDisability] = useState<string>("None");
  const [selectedWorkArea, setSelectedWorkArea] = useState<string>("");

  // Reset/sync layout toggle
  useEffect(() => {
    if (open) {
      setShowFullForm(isStudentDirectory);
      setIsCreatingNewProgram(false);
      setNewProgramCode("");
      setNewProgramName("");
      setNewProgramLevel("Degree");
      setNewProgramCategory("STEM");
    }
  }, [open, isStudentDirectory]);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateStudentData> & { disability_other?: string; work_area_other?: string; faculty?: any; department?: any; enrollment_semester?: string }>({
    institution: user?.institution?.id,
    enrollment_year: new Date().getFullYear(),
    enrollment_semester: "Semester 1",
    status: "Active",
    is_work_for_fees: false,
    disability_type: "None",
    selected_level: "",
    selected_category: defaultCategory,
  });

  // --- 1. Fetch Data on Open ---
  useEffect(() => {
    const loadData = async () => {
      if (!open || !user?.institution?.id) return;

      setIsFetchingData(true);
      try {
        // Fetch all simultaneously for speed
        const [facData, deptData, progData, listData] = await Promise.all([
          // 1. Get Faculties for this Inst
          getFaculties(user.institution.id),

          // 2. Get Departments for this Inst
          getDepartments({ institution: user.institution.id }),

          // 3. Get Programs for this Inst
          getPrograms({ institution_id: user.institution.id }),

          // 4. Get Existing Students for search
          getStudents({ institution: user.institution.id }),
        ]);

        setFaculties(facData || []);
        setDepartments(deptData || []);
        setPrograms(progData || []);
        setExistingStudents(listData || []);
      } catch (error) {
        console.error("Failed to load academic structure", error);
        toast.error("Failed to load dropdown data");
      } finally {
        setIsFetchingData(false);
      }
    };

    if (open) loadData();
  }, [open, user]);

  // --- 2. Filter Logic (Cascading) ---

  // Filter Departments based on selected Faculty (or show all if no Faculty is selected)
  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) return departments;
    return departments.filter(
      (d) => d.faculty.toString() === selectedFacultyId
    );
  }, [departments, selectedFacultyId]);

  // Filter Programs based on selected Department or Faculty (or show all if none selected)
  const filteredPrograms = useMemo(() => {
    if (selectedDeptId) {
      return programs.filter((p) => p.department?.toString() === selectedDeptId);
    }
    if (selectedFacultyId) {
      const deptIds = departments
        .filter((d) => d.faculty.toString() === selectedFacultyId)
        .map((d) => d.id.toString());
      return programs.filter((p) => p.department && deptIds.includes(p.department.toString()));
    }
    return programs;
  }, [programs, departments, selectedFacultyId, selectedDeptId]);

  // Get selected program object
  const activeProgram = useMemo(() => {
    if (!formData.program) return null;
    return programs.find(p => p.id.toString() === formData.program.toString());
  }, [programs, formData.program]);

  // Filter existing students by search query
  const filteredExisting = useMemo(() => {
    if (!searchRegQuery.trim() || selectedStudent) return [];
    return existingStudents.filter((s) =>
      s.student_id.toLowerCase().includes(searchRegQuery.toLowerCase())
    );
  }, [existingStudents, searchRegQuery, selectedStudent]);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (
    field: keyof CreateStudentData,
    value: string
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Reset dependent fields
      if (field === 'program') {
        next.selected_level = "";
        next.selected_category = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.institution?.id) return;

    setIsLoading(true);

    try {
      if (
        !formData.student_id ||
        !formData.first_name ||
        !formData.last_name
      ) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Program is required
      if (!isCreatingNewProgram && !formData.program) {
        toast.error("Please select a Program");
        setIsLoading(false);
        return;
      }

      // Validations for work for fees
      if (isWorkForFees && (!selectedWorkArea || !formData.hours_pledged)) {
        toast.error("Please specify work area and hours pledged");
        setIsLoading(false);
        return;
      }

      // --- CRITICAL: Data Mapping & Cleanup for Backend ---
      const finalPayload: any = {
        ...formData,
        institution: user.institution.id,
        is_work_for_fees: isWorkForFees,
        first_name: formData.first_name.toUpperCase(),
        last_name: formData.last_name.toUpperCase(),
        student_id: formData.student_id.toUpperCase(),
        national_id: formData.national_id ? formData.national_id.toUpperCase() : "",
      };

      // Handle custom program creation
      if (isCreatingNewProgram) {
        if (!newProgramCode || !newProgramName) {
          toast.error("Please fill in the new program code and name");
          setIsLoading(false);
          return;
        }
        
        const isConfirmed = window.confirm(
          `Confirm Auto-Creation: Are you sure you want to register a new academic program: "${newProgramName.toUpperCase()} (${newProgramCode.toUpperCase()})" in the system?`
        );
        if (!isConfirmed) {
          setIsLoading(false);
          return;
        }

        finalPayload.new_program_code = newProgramCode.toUpperCase();
        finalPayload.new_program_name = newProgramName.toUpperCase();
        finalPayload.new_program_level = newProgramLevel;
        finalPayload.new_program_category = newProgramCategory;
        finalPayload.program = null; // Backend will generate it
      }

      // 1. Handle Inclusivity Category
      if (selectedDisability === "Other" && formData.disability_other) {
        finalPayload.inclusivity_category = formData.disability_other.toUpperCase();
      } else {
        finalPayload.inclusivity_category = selectedDisability;
      }

      // 2. Handle Work Area strictly
      if (isWorkForFees) {
        if (selectedWorkArea === "Other" && formData.work_area_other) {
          finalPayload.work_area = formData.work_area_other.toUpperCase();
        } else {
          finalPayload.work_area = selectedWorkArea;
        }
        finalPayload.hours_pledged = parseInt(formData.hours_pledged as any, 10);
      } else {
        finalPayload.work_area = null;
        finalPayload.hours_pledged = 0;
      }

      // Remove temporary fields
      delete finalPayload.disability_other;
      delete finalPayload.work_area_other;

      if (selectedStudent) {
        await updateStudent(selectedStudent.id, finalPayload);
        toast.success("Student updated successfully!");
      } else {
        await createStudent(finalPayload as CreateStudentData);
        toast.success("Student added successfully!");
      }

      setOpen(false);
      // Reset form
      setFormData({
        institution: user.institution.id,
        enrollment_year: new Date().getFullYear(),
        enrollment_semester: "Semester 1",
        status: "Active",
        is_work_for_fees: false,
        inclusivity_category: "None",
        selected_level: "",
        selected_category: defaultCategory,
      });
      setSelectedStudent(null);
      setSearchRegQuery("");
      setSelectedFacultyId("");
      setSelectedDeptId("");
      setIsWorkForFees(false);
      setSelectedDisability("None");
      setSelectedWorkArea("");
      
      // Reset custom program states
      setIsCreatingNewProgram(false);
      setNewProgramCode("");
      setNewProgramName("");
      setNewProgramLevel("Degree");
      setNewProgramCategory("STEM");

      if (onStudentAdded) onStudentAdded();
    } catch (error: any) {
      console.error("Backend Error Details:", error.response?.data);
      const errorMsg =
        error.response?.data?.detail || "Failed to save student";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. Empty State Checks ---
  const noFaculties = !isFetchingData && faculties.length === 0;
  const noPrograms = !isFetchingData && programs.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Register a new student in the system
          </DialogDescription>
        </DialogHeader>

        {/* --- CRITICAL: Blocking Empty States --- */}
        {noFaculties ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-2">
              <p>
                You cannot add students because no <strong>Faculties</strong>{" "}
                have been created yet.
              </p>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link to="/dashboard/faculties" onClick={() => setOpen(false)}>
                  Go to Faculties Page <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : noPrograms ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Programs Missing</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-2">
              <p>
                You cannot add students because no <strong>Academic Programs</strong>{" "}
                exist.
              </p>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link to="/dashboard/programs" onClick={() => setOpen(false)}>
                  Go to Programs Page <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Search Student Section (combobox pattern from Login.tsx) */}
            {!isStudentDirectory && (
              <div className="p-3 bg-muted/40 rounded-md border space-y-2 mb-4">
                <Label htmlFor="search_reg">Search/Select Existing Student by Reg Number</Label>
                <div className="w-full">
                  <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={searchOpen}
                        className="w-full justify-between bg-background text-sm font-normal text-left h-10"
                        disabled={isLoading}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {selectedStudent
                            ? `${selectedStudent.student_id} - ${selectedStudent.first_name} ${selectedStudent.last_name}`
                            : "Type or select student..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] p-0" 
                      side="bottom" 
                      align="start" 
                      sideOffset={4}
                    >
                      <Command>
                        <CommandInput placeholder="Search student ID or name..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No student found.</CommandEmpty>
                          <CommandGroup>
                            {existingStudents.map((s) => (
                              <CommandItem
                                key={s.id}
                                value={`${s.student_id} ${s.first_name} ${s.last_name}`}
                                onSelect={() => {
                                  setSelectedStudent(s);
                                  setSearchRegQuery(s.student_id);
                                  setFormData({
                                    id: s.id,
                                    student_id: s.student_id,
                                    first_name: s.first_name,
                                    last_name: s.last_name,
                                    national_id: s.national_id || "",
                                    gender: s.gender,
                                    date_of_birth: s.date_of_birth || "",
                                    enrollment_year: s.enrollment_year,
                                    enrollment_semester: s.enrollment_semester || "Semester 1",
                                    status: s.status || "Active",
                                    is_work_for_fees: s.is_work_for_fees || false,
                                    disability_type: s.inclusivity_category || "None",
                                    selected_level: s.selected_level || "",
                                    selected_category: s.selected_category || "",
                                    faculty: s.faculty,
                                    department: s.department,
                                    program: s.program,
                                  });
                                  if (s.faculty) setSelectedFacultyId(s.faculty.toString());
                                  if (s.department) setSelectedDeptId(s.department.toString());
                                  setIsWorkForFees(s.is_work_for_fees || false);
                                  setSelectedDisability(s.inclusivity_category || "None");
                                  setSelectedWorkArea(s.work_area || "");
                                  setSearchOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedStudent?.id === s.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="font-semibold">{s.student_id}</span> - {s.first_name} {s.last_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedStudent && (
                  <div className="flex items-center justify-between mt-1 text-xs text-primary font-medium animate-in fade-in">
                    <span>Selected Student: {selectedStudent.first_name} {selectedStudent.last_name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(null);
                        setSearchRegQuery("");
                        setFormData({
                          institution: user?.institution?.id,
                          enrollment_year: new Date().getFullYear(),
                          enrollment_semester: "Semester 1",
                          status: "Active",
                          is_work_for_fees: false,
                          disability_type: "None",
                          selected_level: "",
                          selected_category: "",
                        });
                        setSelectedFacultyId("");
                        setSelectedDeptId("");
                        setIsWorkForFees(false);
                        setSelectedDisability("None");
                        setSelectedWorkArea("");
                      }}
                      className="text-destructive hover:underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* If neither form is shown nor student is selected, show register toggle button */}
            {!isStudentDirectory && !(showFullForm || selectedStudent) && (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/20 space-y-3 my-6 animate-in fade-in duration-200">
                <p className="text-sm text-muted-foreground text-center">
                  Cannot find student ID in the directory?
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowFullForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Student
                </Button>
              </div>
            )}

            {/* Rest of the form shown when registered new student toggled OR student selected */}
            {(showFullForm || selectedStudent) && (
              <>
                {/* Personal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      placeholder="JOHN"
                      required
                      value={formData.first_name || ""}
                      onChange={(e) => {
                        const upperVal = e.target.value.toUpperCase();
                        setFormData((prev) => ({ ...prev, first_name: upperVal }));
                      }}
                      readOnly={!!selectedStudent}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      placeholder="DOE"
                      required
                      value={formData.last_name || ""}
                      onChange={(e) => {
                        const upperVal = e.target.value.toUpperCase();
                        setFormData((prev) => ({ ...prev, last_name: upperVal }));
                      }}
                      readOnly={!!selectedStudent}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID *</Label>
                    <Input
                      id="student_id"
                      placeholder="ST001"
                      required
                      value={formData.student_id || ""}
                      onChange={(e) => {
                        const upperVal = e.target.value.toUpperCase();
                        setFormData((prev) => ({ ...prev, student_id: upperVal }));
                      }}
                      readOnly={!!selectedStudent}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="national_id">National ID</Label>
                    <Input
                      id="national_id"
                      placeholder="63-1234567A00"
                      value={formData.national_id || ""}
                      onChange={(e) => {
                        const upperVal = e.target.value.toUpperCase();
                        setFormData((prev) => ({ ...prev, national_id: upperVal }));
                      }}
                      readOnly={!!selectedStudent}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      onValueChange={(val) => handleSelectChange("gender", val)}
                      value={formData.gender}
                      disabled={!!selectedStudent}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 9)).toISOString().split("T")[0]}
                      value={formData.date_of_birth || ""}
                      onChange={handleInputChange}
                      readOnly={!!selectedStudent}
                    />
                  </div>
                </div>

                {/* --- CASCADING DROPDOWNS START --- */}
                <div className="p-3 sm:p-4 bg-muted/50 rounded-md border space-y-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Academic Placement
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Need to manage faculties, departments or programs? Go to the{" "}
                      <Link to="/dashboard/faculties" onClick={() => setOpen(false)} className="text-primary underline hover:text-primary/80 font-medium">
                        Faculties Page
                      </Link>{" "}
                      or{" "}
                      <Link to="/dashboard/programs" onClick={() => setOpen(false)} className="text-primary underline hover:text-primary/80 font-medium">
                        Programs Page
                      </Link>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Faculty</Label>
                      <Select
                        onValueChange={(val) => {
                          const actualVal = val === "none" ? "" : val;
                          setSelectedFacultyId(actualVal);
                          handleSelectChange("faculty", actualVal);
                        }}
                        value={selectedFacultyId || "none"}
                        disabled={isFetchingData || !!selectedStudent}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (No Faculty)</SelectItem>
                          {faculties.map((f) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select
                        onValueChange={(val) => {
                          const actualVal = val === "none" ? "" : val;
                          setSelectedDeptId(actualVal);
                          handleSelectChange("department", actualVal);
                        }}
                        value={selectedDeptId || "none"}
                        disabled={!!selectedStudent}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (No Department)</SelectItem>
                          {filteredDepartments.map((d) => (
                            <SelectItem key={d.id} value={d.id.toString()}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    {!isCreatingNewProgram ? (
                      <div className="space-y-2">
                        <Select
                          onValueChange={(val) => handleSelectChange("program", val)}
                          disabled={!!selectedStudent || filteredPrograms.length === 0}
                          value={formData.program?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Program of Study" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredPrograms.map((prog) => (
                              <SelectItem key={prog.id} value={prog.id.toString()}>
                                {prog.name} ({prog.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!selectedStudent && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="px-0 h-auto text-xs text-primary"
                            onClick={() => setIsCreatingNewProgram(true)}
                          >
                            Program not listed? Create new program
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 border rounded bg-primary/5 space-y-3 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-primary">New Program Details</span>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="px-0 h-auto text-xs text-destructive"
                            onClick={() => setIsCreatingNewProgram(false)}
                          >
                            Select existing program
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="new_program_code" className="text-xs">Program Code *</Label>
                            <Input
                              id="new_program_code"
                              placeholder="e.g. BSCS"
                              value={newProgramCode}
                              onChange={(e) => setNewProgramCode(e.target.value.toUpperCase())}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new_program_name" className="text-xs">Program Name *</Label>
                            <Input
                              id="new_program_name"
                              placeholder="e.g. B.SC IN COMPUTER SCIENCE"
                              value={newProgramName}
                              onChange={(e) => setNewProgramName(e.target.value.toUpperCase())}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Study Level *</Label>
                            <Select
                              onValueChange={setNewProgramLevel}
                              value={newProgramLevel}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Certificate">Certificate</SelectItem>
                                <SelectItem value="Diploma">Diploma</SelectItem>
                                <SelectItem value="Degree">Degree</SelectItem>
                                <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Study Category *</Label>
                            <Select
                              onValueChange={setNewProgramCategory}
                              value={newProgramCategory}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STEM">STEM</SelectItem>
                                <SelectItem value="HEALTH">Health Sciences</SelectItem>
                                <SelectItem value="BUSINESS">Business</SelectItem>
                                <SelectItem value="SOCIAL">Social Sciences</SelectItem>
                                <SelectItem value="HUMANITIES">Humanities</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 🚨 Specific Selection of Level and Category 🚨 */}
                  {!isCreatingNewProgram && (
                    <>
                      {activeProgram ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                          <div className="space-y-2">
                            <Label>Study Level *</Label>
                            <Select
                              onValueChange={(val) => handleSelectChange("selected_level", val)}
                              value={formData.selected_level}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Level" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeProgram.levels?.map((l) => (
                                  <SelectItem key={l} value={l}>{l}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Study Category *</Label>
                            <Select
                              onValueChange={(val) => handleSelectChange("selected_category", val)}
                              value={formData.selected_category}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeProgram.categories?.map((c) => (
                                  <SelectItem key={c} value={c}>{PROGRAM_CATEGORIES[c as keyof typeof PROGRAM_CATEGORIES] || c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                          <div className="space-y-2">
                            <Label>Study Level *</Label>
                            <Select
                              onValueChange={(val) => handleSelectChange("selected_level", val)}
                              value={formData.selected_level}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Certificate">Certificate</SelectItem>
                                <SelectItem value="Diploma">Diploma</SelectItem>
                                <SelectItem value="Degree">Degree</SelectItem>
                                <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Study Category *</Label>
                            <Select
                              onValueChange={(val) => handleSelectChange("selected_category", val)}
                              value={formData.selected_category}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="STEM">STEM</SelectItem>
                                <SelectItem value="SPECIALIZED">Specialized Skills</SelectItem>
                                <SelectItem value="CRITICAL">Critical Skills</SelectItem>
                                <SelectItem value="HEALTH">Health Sciences</SelectItem>
                                <SelectItem value="BUSINESS">Business</SelectItem>
                                <SelectItem value="SOCIAL">Social Sciences</SelectItem>
                                <SelectItem value="HUMANITIES">Humanities</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="enrollment_year">Enrollment Year</Label>
                      <Input
                        id="enrollment_year"
                        type="number"
                        value={formData.enrollment_year || new Date().getFullYear()}
                        onChange={handleInputChange}
                        readOnly={!!selectedStudent}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enrollment_semester">Enrollment Semester</Label>
                      <Select
                        disabled={!!selectedStudent}
                        onValueChange={(val) => handleSelectChange("enrollment_semester", val)}
                        value={formData.enrollment_semester || "Semester 1"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Semester 1">Semester 1</SelectItem>
                          <SelectItem value="Semester 2">Semester 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {/* --- CASCADING DROPDOWNS END --- */}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(val) => handleSelectChange("status", val)}
                      defaultValue="Active"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Attachment">On Attachment</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                        <SelectItem value="Deferred">Deferred</SelectItem>
                        <SelectItem value="Graduated">Graduated</SelectItem>
                        <SelectItem value="Dropout">Dropout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* --- Disability Type --- */}
                  <div className="space-y-2">
                    <Label htmlFor="disability_type">Disability Type</Label>
                    <Select
                      onValueChange={(val) => {
                        setSelectedDisability(val);
                        handleSelectChange("disability_type", val);
                      }}
                      defaultValue="None"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISABILITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* --- Conditional Disability Specification --- */}
                {selectedDisability === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="disability_other">Specify Disability</Label>
                    <Input
                      id="disability_other"
                      placeholder="Describe the disability"
                      value={formData.disability_other || ""}
                      onChange={(e) => {
                        const upperVal = e.target.value.toUpperCase();
                        setFormData((prev) => ({ ...prev, disability_other: upperVal }));
                      }}
                      readOnly={!!selectedStudent}
                    />
                  </div>
                )}

                {/* --- Work for Fees Section --- */}
                <div className="flex items-center space-x-2 border p-4 rounded-md bg-muted/30">
                  <Switch
                    id="is_work_for_fees"
                    checked={isWorkForFees}
                    onCheckedChange={setIsWorkForFees}
                  />
                  <Label htmlFor="is_work_for_fees">Working for Fees?</Label>
                </div>

                {isWorkForFees && (
                  <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/10">
                    <div className="space-y-2">
                      <Label htmlFor="work_area">Work Area *</Label>
                      <Select
                        onValueChange={(val) => {
                          setSelectedWorkArea(val);
                          handleSelectChange("work_area", val);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORK_AREA_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours_pledged">Hours Pledged *</Label>
                      <Input
                        id="hours_pledged"
                        type="number"
                        placeholder="100"
                        value={formData.hours_pledged || ""}
                        onChange={handleInputChange}
                        readOnly={!!selectedStudent}
                      />
                    </div>
                  </div>
                )}

                {/* --- Conditional Work Area Specification --- */}
                {isWorkForFees && selectedWorkArea === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="work_area_other">Specify Work Area</Label>
                    <Input
                      id="work_area_other"
                      placeholder="Describe the work area"
                      value={formData.work_area_other || ""}
                      onChange={(e) => {
                        const upperVal = e.target.value.toUpperCase();
                        setFormData((prev) => ({ ...prev, work_area_other: upperVal }));
                      }}
                      readOnly={!!selectedStudent}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!isStudentDirectory && !selectedStudent) {
                        setShowFullForm(false);
                      } else {
                        setOpen(false);
                      }
                    }}
                  >
                    {!isStudentDirectory && !selectedStudent ? "Back" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Student
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}