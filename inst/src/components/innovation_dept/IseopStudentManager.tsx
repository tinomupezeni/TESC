import React, { useEffect, useState, useRef } from "react";
import iseopService, { IseopStudent, IseopProgram } from "@/services/iseop.services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, Loader2, Download } from "lucide-react";
import { IseopStudentFormDialog } from "@/components/innovation_dept/IseopFormDialog";
import { useAuth } from "@/context/AuthContext";

// CSV Validation Helper
const validateCSV = async (file: File, programs: IseopProgram[]) => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",");
  const requiredHeaders = [
    "student_id",
    "first_name",
    "last_name",
    "national_id",
    "email",
    "program",
    "gender",
    "status",
    "enrollment_date",
  ];
  for (const h of requiredHeaders) {
    if (!headers.includes(h)) {
      toast.error(`Missing column: ${h}`);
      return false;
    }
  }

  const programIds = programs.map((p) => p.id.toString());
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = row[idx]?.trim() || "";
    });

    if (!rowObj.student_id || !rowObj.national_id) {
      toast.error(`Row ${i + 1}: student_id and national_id are required`);
      return false;
    }

    if (!programIds.includes(rowObj.program)) {
      toast.error(`Row ${i + 1}: program ID ${rowObj.program} is invalid`);
      return false;
    }

    if (!["Male", "Female", "Other"].includes(rowObj.gender)) {
      toast.error(`Row ${i + 1}: gender must be Male, Female, or Other`);
      return false;
    }

    if (!["Active/Enrolled", "Completed", "Deferred"].includes(rowObj.status)) {
      toast.error(`Row ${i + 1}: status must be Active/Enrolled, Completed, or Deferred`);
      return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(rowObj.enrollment_date)) {
      toast.error(`Row ${i + 1}: enrollment_date must be YYYY-MM-DD`);
      return false;
    }
  }

  return true;
};

const IseopStudentManager = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<IseopStudent[]>([]);
  const [programs, setPrograms] = useState<IseopProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const institutionId = user?.institution?.id || user?.institution_id;

  const fetchStudents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = institutionId ? { institution_id: institutionId } : {};
      const [studentsData, programsData] = await Promise.all([
        iseopService.getIseopStudents(params),
        iseopService.getPrograms(),
      ]);

      setPrograms(programsData);
      setStudents(studentsData); // Use backend `program_name` directly
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await iseopService.deleteStudent(id);
      toast.success("Student deleted!");
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student.");
    }
  };

  const downloadTemplate = () => {
    const csvContent = `student_id,first_name,last_name,national_id,email,program,gender,status,enrollment_date
S1001,John,Doe,12345678,john.doe@example.com,1,Male,Active/Enrolled,2023-01-01
S1002,Jane,Smith,87654321,jane.smith@example.com,2,Female,Active/Enrolled,2023-01-01`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "iseop_students_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(await validateCSV(file, programs))) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      await iseopService.bulkUploadStudents(file);
      toast.success("Students uploaded successfully!");
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload students.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">ISEOP Students</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" /> Download CSV Template
          </Button>

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Bulk Upload CSV
          </Button>

          <IseopStudentFormDialog
            onSuccess={fetchStudents}
            trigger={<Button size="sm">Add Student</Button>}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading students...
                </TableCell>
              </TableRow>
            ) : students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{student.full_name || `${student.first_name} ${student.last_name}`}</TableCell>
                  <TableCell>{student.email || <span className="text-muted-foreground">N/A</span>}</TableCell>
                  <TableCell>{student.program_name || "Unassigned"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize text-secondary-foreground">
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <IseopStudentFormDialog
                      student={student}
                      onSuccess={fetchStudents}
                      trigger={<Button size="sm" variant="outline">Edit</Button>}
                    />
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(student.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No students found. Add one or upload a CSV.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IseopStudentManager;
