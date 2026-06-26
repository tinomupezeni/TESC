import React, { useEffect, useState, useRef } from "react";
import iseopService, { IseopStudent } from "@/services/iseop.services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, FileDown } from "lucide-react"; 
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
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
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
      toast.error("Failed to delete student.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await iseopService.bulkUploadStudents(file);
      
      // Handle response from the new backend logic
      if (response.error_count > 0) {
        toast.warning(`Uploaded ${response.created_count} students. ${response.error_count} rows failed.`);
        console.error("Bulk upload errors:", response.errors);
      } else {
        toast.success(`Successfully uploaded ${response.created_count} students!`);
      }

      // Refresh local table
      await fetchStudents();
      
      // Trigger parent refresh (updates Program Manager tab/page)
      if (onRefresh) onRefresh();

    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Ensure CSV headers are correct: student_id, first_name, last_name, national_id, program, status");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const headers = "student_id,first_name,last_name,national_id,email,gender,program,status,enrollment_date\n";
    const blob = new Blob([headers], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "iseop_student_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">ISEOP Students</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage and bulk import students via CSV.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={downloadTemplate} className="h-8 text-[10px] sm:text-xs">
                <FileDown className="mr-2 h-3.5 w-3.5" />
                Template
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
                className="h-8 text-[10px] sm:text-xs"
            >
                <UploadCloud className="mr-2 h-3.5 w-3.5" />
                Bulk Upload
            </Button>
            
            <IseopStudentFormDialog 
                onSuccess={() => { fetchStudents(); if(onRefresh) onRefresh(); }} 
                trigger={<Button size="sm" className="h-8 text-[10px] sm:text-xs">Add Student</Button>} 
            />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-muted-foreground text-sm">Loading student records...</div>
      ) : (
        <div className="border rounded-lg bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="hidden lg:table-cell text-xs">Email</TableHead>
                <TableHead className="hidden sm:table-cell text-xs">Program</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-blue-600 text-[10px] sm:text-xs">{student.student_id}</TableCell>
                    <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{student.email || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-medium truncate max-w-[150px] inline-block">
                            {student.program_name || 'Unassigned'}
                        </span>
                    </TableCell>
                    <TableCell>
                        <span className={`capitalize px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold whitespace-nowrap ${
                            student.status === 'Active/Enrolled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {student.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <IseopStudentFormDialog
                          student={student}
                          onSuccess={() => { fetchStudents(); if(onRefresh) onRefresh(); }}
                          trigger={<Button size="sm" variant="ghost" className="h-7 w-7 p-0 sm:h-8 sm:px-2 sm:w-auto text-[10px]">Edit</Button>}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 sm:h-8 sm:px-2 sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px]"
                          onClick={() => handleDelete(student.id)}
                        >
                          <span className="hidden sm:inline">Delete</span>
                          <span className="sm:hidden">×</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-xs sm:text-sm">
                    No student records found.
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