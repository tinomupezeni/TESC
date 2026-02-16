import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import iseopService, {
  IseopStudent,
  IseopProgram,
} from "@/services/iseop.services";

interface IseopFormProps {
  student?: IseopStudent;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const IseopStudentFormDialog: React.FC<IseopFormProps> = ({
  student,
  trigger,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!student;

  const [programs, setPrograms] = useState<IseopProgram[]>([]);

  const [formData, setFormData] = useState<
    Partial<IseopStudent> & {
      national_id?: string;
      enrollment_date?: string | null;
      enrollment_year?: number | null;
      disability_type?: string;
      disability_other_text?: string;
    }
  >({
    institution: institutionId,
    first_name: "",
    last_name: "",
    student_id: "",
    national_id: "",
    email: "",
    program: null,
    enrollment_date: null,
    enrollment_year: null,
    gender: "Male",
    status: "Active/Enrolled",
    disability_type: "None",
    disability_other_text: "",
  });

  useEffect(() => {
    if (!open) return;
    iseopService
      .getPrograms()
      .then(setPrograms)
      .catch(() => toast.error("Failed to load programs"));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (student) {
      setFormData({
        ...student,
        program: student.program ?? null,
        national_id: (student as any).national_id ?? "",
        enrollment_date: student.enrollment_year
          ? `${student.enrollment_year}-01-01`
          : null,
        enrollment_year: student.enrollment_year ?? null,
        disability_type: (student as any).disability_type ?? "None",
        disability_other_text: "",
      });
    } else {
      setFormData({
        institution: institutionId,
        first_name: "",
        last_name: "",
        student_id: "",
        national_id: "",
        email: "",
        program: null,
        enrollment_date: null,
        enrollment_year: null,
        gender: "Male",
        status: "Active/Enrolled",
        disability_type: "None",
        disability_other_text: "",
      });
    }
  }, [open, student, institutionId]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };

    if (field === "enrollment_date" && value) {
      updated.enrollment_year = new Date(value).getFullYear();
    }

    if (field === "disability_type" && value !== "Other") {
      updated.disability_other_text = "";
    }

    setFormData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!institutionId) return toast.error("Institution not found");
    if (!formData.program) return toast.error("Please select a program");
    if (!formData.national_id)
      return toast.error("National ID is required");
    if (!formData.enrollment_date)
      return toast.error("Please select enrollment date");

    if (
      formData.disability_type === "Other" &&
      !formData.disability_other_text?.trim()
    ) {
      return toast.error("Please specify the disability");
    }

    const payload = {
      ...formData,
      disability_type: formData.disability_type, // keep enum intact
    };

    console.log("Submitting payload:", payload);

    setLoading(true);
    try {
      if (isEditing && student?.id) {
        await iseopService.updateStudent(student.id, payload);
        toast.success("Student updated");
      } else {
        await iseopService.createStudent(payload);
        toast.success("Student enrolled");
      }
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.national_id
          ? "National ID must be unique"
          : "Failed to save student"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {isEditing ? "Edit Student" : "Add Student"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <GraduationCap className="h-5 w-5" />
            {isEditing ? "Edit Student" : "Enroll Student"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                required
                value={formData.first_name}
                onChange={(e) =>
                  handleChange("first_name", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                required
                value={formData.last_name}
                onChange={(e) =>
                  handleChange("last_name", e.target.value)
                }
              />
            </div>
          </div>

          {/* Student ID + National ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student ID</Label>
              <Input
                required
                value={formData.student_id}
                onChange={(e) =>
                  handleChange("student_id", e.target.value)
                }
              />
            </div>
            <div>
              <Label>National ID</Label>
              <Input
                required
                value={formData.national_id}
                onChange={(e) =>
                  handleChange("national_id", e.target.value)
                }
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                handleChange("email", e.target.value)
              }
            />
          </div>

          {/* Program */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Program Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.program?.toString() || ""}
                onValueChange={(val) =>
                  handleChange("program", Number(val))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Gender + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Gender</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(val) => handleChange("gender", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status || ""}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active/Enrolled">Active / Enrolled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Disability */}
          <div>
            <Label>Disability</Label>
            <Select
              value={formData.disability_type || "None"}
              onValueChange={(val) => handleChange("disability_type", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Disability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Physical">Physical / Mobility Impairment</SelectItem>
                <SelectItem value="Amputation">Amputation</SelectItem>
                <SelectItem value="Paralysis">Paralysis</SelectItem>
                <SelectItem value="CerebralPalsy">Cerebral Palsy</SelectItem>
                <SelectItem value="SpinalCord">Spinal Cord Injury</SelectItem>
                <SelectItem value="Visual">Visual Impairment</SelectItem>
                <SelectItem value="Hearing">Hearing Impairment</SelectItem>
                <SelectItem value="Speech">Speech Impairment</SelectItem>
                <SelectItem value="DeafBlind">Deaf-Blindness</SelectItem>
                <SelectItem value="Intellectual">Intellectual Disability</SelectItem>
                <SelectItem value="Learning">Learning Disability</SelectItem>
                <SelectItem value="Autism">Autism Spectrum Disorder</SelectItem>
                <SelectItem value="ADHD">Attention Deficit Hyperactivity Disorder</SelectItem>
                <SelectItem value="Epilepsy">Epilepsy</SelectItem>
                <SelectItem value="MentalHealth">Mental / Psychosocial Disability</SelectItem>
                <SelectItem value="Albino">Albinism</SelectItem>
                <SelectItem value="DownSyndrome">Down Syndrome</SelectItem>
                <SelectItem value="SickleCell">Sickle Cell Disease</SelectItem>
                <SelectItem value="ChronicIllness">Chronic Illness</SelectItem>
                <SelectItem value="Multiple">Multiple Disabilities</SelectItem>
                <SelectItem value="Other">Other (Specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Other Disability Text */}
          {formData.disability_type === "Other" && (
            <div>
              <Label>Please specify</Label>
              <Input
                placeholder="Specify disability"
                value={formData.disability_other_text || ""}
                onChange={(e) =>
                  handleChange("disability_other_text", e.target.value)
                }
              />
            </div>
          )}

          {/* Enrollment Date */}
          <div>
            <Label>Enrollment Date</Label>
            <Input
              type="date"
              required
              value={formData.enrollment_date || ""}
              onChange={(e) =>
                handleChange("enrollment_date", e.target.value)
              }
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEditing ? "Update Student" : "Enroll Student"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
