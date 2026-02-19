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
import { Plus, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // Import Auth
import { createStudent, CreateStudentData } from "@/services/students.services";
// Import necessary services and types
import { getPrograms, Program } from "@/services/programs.services";
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

export function AddStudentDialog({
  onStudentAdded,
}: {
  onStudentAdded?: () => void;
}) {
  const { user } = useAuth(); // Get Institution ID from context
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Data State
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Selection State (for cascading dropdowns & toggles)
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [isWorkForFees, setIsWorkForFees] = useState(false);
  const [selectedDisability, setSelectedDisability] = useState<string>("None");
  const [selectedWorkArea, setSelectedWorkArea] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState<Partial<CreateStudentData>>({
    institution: user?.institution?.id,
    enrollment_year: new Date().getFullYear(),
    status: "Active",
    is_work_for_fees: false,
    disability_type: "None",
  });

  // --- 1. Fetch Data on Open ---
  useEffect(() => {
    const loadData = async () => {
      if (!open || !user?.institution?.id) return;

      setIsFetchingData(true);
      try {
        // Fetch all simultaneously for speed
        const [facData, deptData, progData] = await Promise.all([
          // 1. Get Faculties for this Inst
          getFaculties(user.institution.id),

          // 2. Get Departments for this Inst
          getDepartments({ institution: user.institution.id }),

          // 3. Get Programs for this Inst
          getPrograms({ institution_id: user.institution.id }),
        ]);

        setFaculties(facData || []);
        setDepartments(deptData || []);
        setPrograms(progData || []);
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

  // Filter Departments based on selected Faculty
  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) return [];
    return departments.filter(
      (d) => d.faculty.toString() === selectedFacultyId
    );
  }, [departments, selectedFacultyId]);

  // Filter Programs based on selected Department
  const filteredPrograms = useMemo(() => {
    if (!selectedDeptId) return [];
    return programs.filter((p) => p.department.toString() === selectedDeptId);
  }, [programs, selectedDeptId]);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (
    field: keyof CreateStudentData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.institution?.id) return;

    setIsLoading(true);

    try {
      if (
        !formData.student_id ||
        !formData.first_name ||
        !formData.last_name ||
        !formData.program
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validations for work for fees
      if (isWorkForFees && (!selectedWorkArea || !formData.hours_pledged)) {
        toast.error("Please specify work area and hours pledged");
        return;
      }

      // --- CRITICAL: Data Mapping & Cleanup for Backend ---
      const finalPayload: any = {
        ...formData,
        institution: user.institution.id,
        is_work_for_fees: isWorkForFees,
      };

      // 1. Handle Disability
      if (selectedDisability === "Other" && formData.disability_other) {
        finalPayload.disability_type = formData.disability_other;
      } else {
        finalPayload.disability_type = selectedDisability;
      }

      // 2. Handle Work Area strictly
      if (isWorkForFees) {
        if (selectedWorkArea === "Other" && formData.work_area_other) {
          // Send the specific string for "Other"
          finalPayload.work_area = formData.work_area_other;
        } else {
          // Send the value from options
          finalPayload.work_area = selectedWorkArea;
        }
        // --- FIX: Parse hours to Integer ---
        finalPayload.hours_pledged = parseInt(formData.hours_pledged as any, 10);
      } else {
        // If NOT working for fees, work_area MUST be null
        finalPayload.work_area = null;
        finalPayload.hours_pledged = 0; // Reset hours
      }

      // Remove the temporary fields from the payload
      delete finalPayload.disability_other;
      delete finalPayload.work_area_other;

      console.log("Submitting Payload:", finalPayload);

      await createStudent(finalPayload as CreateStudentData);

      toast.success("Student added successfully!");
      setOpen(false);
      // Reset form
      setFormData({
        institution: user.institution.id,
        enrollment_year: new Date().getFullYear(),
        status: "Active",
        is_work_for_fees: false,
        disability_type: "None",
      });
      setSelectedFacultyId("");
      setSelectedDeptId("");
      setIsWorkForFees(false);
      setSelectedDisability("None");
      setSelectedWorkArea("");

      if (onStudentAdded) onStudentAdded();
    } catch (error: any) {
      console.error("Backend Error Details:", error.response?.data);
      const errorMsg =
        error.response?.data?.detail || "Failed to create student";
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

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            {/* Personal Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  required
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  placeholder="ST001"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="national_id">National ID</Label>
                <Input
                  id="national_id"
                  placeholder="63-1234567A00"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("gender", val)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* --- CASCADING DROPDOWNS START --- */}
            <div className="p-4 bg-muted/50 rounded-md border space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Academic Placement
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* 1. Faculty Select (Filter Depts) */}
                <div className="space-y-2">
                  <Label>Faculty *</Label>
                  <Select
                    onValueChange={setSelectedFacultyId}
                    value={selectedFacultyId}
                  >
                    <SelectTrigger disabled={isFetchingData}>
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Department Select (Filter Programs) */}
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select
                    onValueChange={setSelectedDeptId}
                    value={selectedDeptId}
                    disabled={
                      !selectedFacultyId || filteredDepartments.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDepartments.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFacultyId && filteredDepartments.length === 0 && (
                    <p className="text-[10px] text-destructive">
                      No departments in this faculty.
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Program Select (Actual Value) */}
              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("program", val)}
                  disabled={!selectedDeptId || filteredPrograms.length === 0}
                  required
                >
                  <SelectTrigger
                    className={!formData.program ? "border-amber-400" : ""}
                  >
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
                {selectedDeptId && filteredPrograms.length === 0 && (
                  <p className="text-[10px] text-destructive">
                    No programs in this department.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment_year">Enrollment Year</Label>
                <Input
                  id="enrollment_year"
                  type="number"
                  defaultValue={new Date().getFullYear()}
                  onChange={handleInputChange}
                />
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
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Student
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}