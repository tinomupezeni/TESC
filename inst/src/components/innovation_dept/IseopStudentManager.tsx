import React, { useEffect, useState, useRef } from "react";
import iseopService, { IseopStudent } from "@/services/iseop.services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, FileDown } from "lucide-react"; 
import { IseopStudentFormDialog } from "@/components/innovation_dept/IseopFormDialog"; 
import { UploadIseopStudentsDialog } from "@/components/innovation_dept/UploadIseopStudentsDialog";

interface IseopStudentManagerProps {
  onRefresh?: () => void;
}

const IseopStudentManager = ({ onRefresh }: IseopStudentManagerProps) => {
  const [students, setStudents] = useState<IseopStudent[]>([]);
  const [loading, setLoading] = useState(true);

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



  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">ISEOP Students</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage and bulk import students via CSV.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <UploadIseopStudentsDialog 
                onSuccess={() => { fetchStudents(); if(onRefresh) onRefresh(); }} 
            />
            
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