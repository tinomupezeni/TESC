import React, { useEffect, useState, useRef } from "react";
import iseopService, { IseopStudent } from "@/services/iseop.services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud } from "lucide-react"; 
// --- IMPORT THE DIALOG ---
// Adjust the path to where your dialog component is located
import { IseopStudentFormDialog } from "@/components/innovation_dept/IseopFormDialog"; 

interface IseopStudentManagerProps {
  onRefresh?: () => void;
}

const IseopStudentManager = ({ onRefresh }: IseopStudentManagerProps) => {
  const [students, setStudents] = useState<IseopStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await iseopService.getStudents();
      console.log("Raw API Student Response:", data);
      
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error("Expected array, got:", data);
        setStudents([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await iseopService.deleteStudent(id);
      toast.success("Student deleted!");
      fetchStudents();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await iseopService.bulkUploadStudents(file);
      toast.success("Students uploaded successfully!");
      fetchStudents();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload students. Please check file format.");
    } finally {
      setLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">ISEOP Students</h2>
        <div className="flex gap-2">
            {/* --- BULK UPLOAD INPUT & BUTTON --- */}
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
                <UploadCloud className="mr-2 h-4 w-4" />
                Bulk Upload CSV
            </Button>
            
            {/* --- ADD STUDENT DIALOG --- */}
            <IseopStudentFormDialog 
                onSuccess={fetchStudents} 
                trigger={<Button size="sm">Add Student</Button>} 
            />
        </div>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    {/* Correctly mapping to the fields in IseopStudent interface */}
                    <TableCell>{student.first_name}</TableCell>
                    <TableCell>{student.last_name}</TableCell>
                    <TableCell>{student.email || "N/A"}</TableCell>
                    <TableCell>{student.program_name || 'N/A' }</TableCell>
                    <TableCell className="capitalize">{student.status}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      {/* --- EDIT STUDENT DIALOG --- */}
                      <IseopStudentFormDialog
                        student={student}
                        onSuccess={fetchStudents}
                        trigger={<Button size="sm" variant="outline">Edit</Button>}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default IseopStudentManager;