import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Student,
  updateStudent,
  UpdateStudentData,
} from "@/services/students.services";
import { getPrograms, Program } from "@/services/programs.services";
import {
  getFaculties,
  getDepartments,
  Faculty,
  Department,
} from "@/services/faculties.services";

// Define all possible status and fee choices
const STUDENT_STATUS_CHOICES = [
  { value: "Active", label: "Active" },
  { value: "Attachment", label: "On Attachment" },
  { value: "Graduated", label: "Graduated" },
  { value: "Suspended", label: "Suspended" },
  { value: "Deferred", label: "Deferred" },
  { value: "Dropout", label: "Dropout" },
];

const DROPOUT_REASON_CHOICES = [
  { value: "Financial", label: "Financial Hardship" },
  { value: "Academic", label: "Academic Failure" },
  { value: "Medical", label: "Health/Medical" },
  { value: "Personal", label: "Personal/Family Issues" },
  { value: "Transfer", label: "Transfer to other Institution" },
  { value: "Other", label: "Other" },
];

const FEE_STATUS_CHOICES = [
  { value: "FullyPaid", label: "Fully Paid Fees" },
  { value: "PartiallyPaid", label: "Partially Paid" },
  { value: "SpecialFees", label: "On Special Fees Payment" },
  { value: "Disabled", label: "Disabled/Waiver" },
];

const FINAL_GRADE_CHOICES = [
  { value: "Distinction", label: "Distinction" },
  { value: "Credit", label: "Credit" },
  { value: "Pass", label: "Pass" },
  { value: "Fail", label: "Fail" },
];

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

// --- Updated Disability & Work Options ---
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

interface EditStudentDialogProps {
  student: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditStudentDialog: React.FC<EditStudentDialogProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateStudentData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Academic Data States
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Initial Academic Selection State
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  // --- Local State for New Fields ---
  const [isWorkForFees, setIsWorkForFees] = useState(false);
  const [selectedDisability, setSelectedDisability] = useState<string>("None");
  const [selectedWorkArea, setSelectedWorkArea] = useState<string>("");

  // --- 1. Load data and Initialize form state ---
  useEffect(() => {
    if (student) {
      // Type casting to handle extended fields not in base Student type
      const studentExt = student as any;

      // Reset and populate form data
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        student_id: student.student_id,
        national_id: student.national_id || "",
        gender: student.gender,
        date_of_birth: student.date_of_birth || "",
        enrollment_year: student.enrollment_year,
        status: student.status,
        program: student.program, // This is the Program ID
        institution: student.institution,
        graduation_year: studentExt.graduation_year || null,
        final_grade: studentExt.final_grade || null,
        dropout_reason: studentExt.dropout_reason || null,
        // New fields
        hours_pledged: studentExt.hours_pledged || 0,
        fee_status: studentExt.fee_status || "PartiallyPaid"
      });

      // Initialize local states for dropdowns/switches
      setIsWorkForFees(studentExt.is_work_for_fees || false);
      
      // Handle "Other" case for disability
      if (studentExt.disability_type && !DISABILITY_OPTIONS.some(o => o.value === studentExt.disability_type)) {
          setSelectedDisability("Other");
          setFormData(prev => ({...prev, disability_other: studentExt.disability_type}));
      } else {
          setSelectedDisability(studentExt.disability_type || "None");
      }

      // Handle "Other" case for work area
      if (studentExt.work_area && !WORK_AREA_OPTIONS.some(o => o.value === studentExt.work_area)) {
          setSelectedWorkArea("Other");
          setFormData(prev => ({...prev, work_area_other: studentExt.work_area}));
      } else {
          setSelectedWorkArea(studentExt.work_area || "");
      }

      // Fetch all academic data
      const loadAcademicData = async (instId: number) => {
        setIsFetchingData(true);
        try {
          const [facData, deptData, progData] = await Promise.all([
            getFaculties(instId),
            getDepartments({ institution: instId }),
            getPrograms({ institution_id: instId }),
          ]);

          setFaculties(facData || []);
          setDepartments(deptData || []);
          setPrograms(progData || []);

          // Retain previously saved values for dropdowns
          const currentProgram = progData?.find(
            (p) => p.id === student.program
          );
          if (currentProgram) {
            setSelectedDeptId(currentProgram.department.toString());
            
            const currentDept = deptData?.find(
              (d) => d.id === currentProgram.department
            );
            if (currentDept) {
              setSelectedFacultyId(currentDept.faculty.toString());
            }
          }
        } catch (error) {
          console.error("Failed to load academic structure", error);
          toast.error("Failed to load dropdown data");
        } finally {
          setIsFetchingData(false);
        }
      };

      if (student.institution) {
        loadAcademicData(student.institution);
      }

      setError("");
    }
  }, [student]);

  // --- 2. Cascading Filter Logic ---
  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) return [];
    return departments.filter(
      (d) => d.faculty.toString() === selectedFacultyId
    );
  }, [departments, selectedFacultyId]);

  const filteredPrograms = useMemo(() => {
    if (!selectedDeptId) return [];
    return programs.filter((p) => p.department.toString() === selectedDeptId);
  }, [programs, selectedDeptId]);

  // --- 3. Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    const val = type === "number" && value ? parseInt(value, 10) : value;
    setFormData((prev) => ({ ...prev, [id]: val }));
  };

  const handleSelectChange = (
    field: keyof UpdateStudentData,
    value: string
  ) => {
    let finalValue: string | number | null = value;
    if (field === "enrollment_year" || field === "graduation_year") {
      finalValue = parseInt(value, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));

    // Reset specific fields when status changes
    if (field === "status") {
      if (value !== "Graduated") {
        setFormData((prev) => ({
          ...prev,
          graduation_year: null,
          final_grade: null,
        }));
      }
      if (value !== "Dropout") {
        setFormData((prev) => ({ ...prev, dropout_reason: null }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.id || !student.institution) return;

    // Validate work for fees
    if (isWorkForFees && (!selectedWorkArea || !formData.hours_pledged)) {
        toast.error("Please specify work area and hours pledged");
        return;
    }

    setIsLoading(true);

    try {
      // --- CRITICAL: Data Mapping & Cleanup for Backend ---
      const dataToSend: any = {
        ...formData,
        date_of_birth: formData.date_of_birth && formData.date_of_birth.trim() !== "" 
          ? formData.date_of_birth 
          : null,
        program: parseInt(formData.program as any, 10),
        institution: student.institution,
        graduation_year: formData.status === "Graduated" ? formData.graduation_year : null,
        final_grade: formData.status === "Graduated" ? formData.final_grade : null,
        dropout_reason: formData.status === "Dropout" ? formData.dropout_reason : null,
        
        // --- Mapping New Fields ---
        is_work_for_fees: isWorkForFees,
        hours_pledged: isWorkForFees ? parseInt(formData.hours_pledged as any, 10) : 0,
      };

      // Handle Disability Mapping
      if (selectedDisability === "Other" && formData.disability_other) {
          dataToSend.disability_type = formData.disability_other;
      } else {
          dataToSend.disability_type = selectedDisability;
      }

      // Handle Work Area Mapping
      if (isWorkForFees) {
          if (selectedWorkArea === "Other" && formData.work_area_other) {
              dataToSend.work_area = formData.work_area_other;
          } else {
              dataToSend.work_area = selectedWorkArea;
          }
      } else {
          dataToSend.work_area = null;
      }

      // Remove temporary fields not expected by backend
      delete dataToSend.disability_other;
      delete dataToSend.work_area_other;

      await updateStudent(student.id, dataToSend);

      toast.success(`Student ${student.student_id} updated successfully!`);
      onSuccess();
    } catch (error: any) {
      console.error("Failed to update student:", error);
      const errorMsg =
        error.response?.data?.detail || "Failed to update student";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Find the selected program object to display its category
  const selectedProgramObj = useMemo(() => {
    return programs.find(p => p.id.toString() === formData.program?.toString());
  }, [programs, formData.program]);

  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Details</DialogTitle>
          <DialogDescription>
            Update the profile for **{student?.full_name}** (
            {student?.student_id})
          </DialogDescription>
        </DialogHeader>

        {(isFetchingData || isLoading) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- Section 1: Personal Details --- */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-2">
              Personal & ID Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ""}
                  required
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ""}
                  required
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  value={formData.student_id || ""}
                  required
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="national_id">National ID</Label>
                <Input
                  id="national_id"
                  value={formData.national_id || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("gender", val)}
                  value={formData.gender || ""}
                  required
                  disabled={isLoading}
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
                  value={formData.date_of_birth || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* --- Section 2: Academic Placement --- */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="text-lg font-semibold border-b pb-2">
              Academic Placement
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Faculty Select */}
              <div className="space-y-2">
                <Label>Faculty *</Label>
                <Select
                  onValueChange={setSelectedFacultyId}
                  value={selectedFacultyId}
                  disabled={isLoading || isFetchingData}
                >
                  <SelectTrigger>
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

              {/* 2. Department Select */}
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  onValueChange={setSelectedDeptId}
                  value={selectedDeptId}
                  disabled={
                    isLoading ||
                    !selectedFacultyId ||
                    filteredDepartments.length === 0
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
              </div>

              {/* 3. Program Select */}
              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("program", val)}
                  value={formData.program?.toString()}
                  disabled={
                    isLoading ||
                    !selectedDeptId ||
                    filteredPrograms.length === 0
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPrograms.map((prog) => (
                      <SelectItem key={prog.id} value={prog.id.toString()}>
                        {prog.name} ({prog.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Program Category</Label>
              <Input 
                value={selectedProgramObj?.category ? PROGRAM_CATEGORIES.find(c => c.value === selectedProgramObj.category)?.label : "N/A"} 
                disabled 
                className="bg-muted"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrollment_year">Enrollment Year</Label>
                <Input
                  id="enrollment_year"
                  type="number"
                  value={formData.enrollment_year || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* --- Section 3: Status & Financial --- */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-2">
              Enrollment & Financial Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Student Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Student Status *</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("status", val)}
                  value={formData.status || ""}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_STATUS_CHOICES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Financial Status */}
              <div className="space-y-2">
                <Label htmlFor="fee_status">Fees Payment Status</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("fee_status", val)}
                  value={formData.fee_status || ""}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee status" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_STATUS_CHOICES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* --- Disability & Work for Fees Fields --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                    <Label htmlFor="disability_type">Disability Status</Label>
                    <Select
                        onValueChange={setSelectedDisability}
                        value={selectedDisability}
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select disability" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            {DISABILITY_OPTIONS.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedDisability === "Other" && (
                        <Input
                            id="disability_other"
                            placeholder="Specify disability"
                            value={formData.disability_other || ""}
                            onChange={handleInputChange}
                            className="mt-2"
                        />
                    )}
                </div>

                <div className="flex items-center gap-4 pt-8">
                    <Switch
                        id="is_work_for_fees"
                        checked={isWorkForFees}
                        onCheckedChange={setIsWorkForFees}
                        disabled={isLoading}
                    />
                    <Label htmlFor="is_work_for_fees">Participating in Work for Fees</Label>
                </div>
            </div>

            {isWorkForFees && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-md bg-muted/30">
                    <div className="space-y-2">
                        <Label htmlFor="work_area">Work Area</Label>
                        <Select
                            onValueChange={setSelectedWorkArea}
                            value={selectedWorkArea}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select work area" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                                {WORK_AREA_OPTIONS.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedWorkArea === "Other" && (
                            <Input
                                id="work_area_other"
                                placeholder="Specify work area"
                                value={formData.work_area_other || ""}
                                onChange={handleInputChange}
                                className="mt-2"
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hours_pledged">Hours Pledged</Label>
                        <Input
                            id="hours_pledged"
                            type="number"
                            placeholder="E.g. 50"
                            value={formData.hours_pledged || ""}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            )}
            {/* ----------------------------------------------- */}

            {/* Conditional Fields: GRADUATED */}
            {formData.status === "Graduated" && (
              <div className="grid grid-cols-2 gap-4 p-3 border border-green-500/50 rounded-md bg-green-500/10">
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    value={formData.graduation_year || ""}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="final_grade">Final Grade</Label>
                  <Select
                    onValueChange={(val) =>
                      handleSelectChange("final_grade", val)
                    }
                    value={formData.final_grade || ""}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select final grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {FINAL_GRADE_CHOICES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Conditional Fields: DROPOUT */}
            {formData.status === "Dropout" && (
              <div className="space-y-2 p-3 border border-red-500/50 rounded-md bg-red-500/10">
                <Label htmlFor="dropout_reason">Dropout Reason</Label>
                <Select
                  onValueChange={(val) =>
                    handleSelectChange("dropout_reason", val)
                  }
                  value={formData.dropout_reason || ""}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {DROPOUT_REASON_CHOICES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
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
};