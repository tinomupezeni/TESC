import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MoreVertical, 
  Filter, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Pencil,
  Trash2 // Imported Trash icon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddStudentDialog } from "@/components/AddStudentDialog";
// Changed import to use the default export object for consistency
import studentService, { Student } from "@/services/students.services";
import { UploadStudentsDialog } from "@/components/helpers/UploadStudentsDialog";
import { EditStudentDialog } from "@/components/EditStudentDialog"; 
import { toast } from "sonner"; // Assuming you use sonner or similar for notifications

const Students = () => {
  const { user } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  
  // Dialog States
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const fetchStudents = useCallback(async () => {
    if (!user?.institution?.id) return;

    try {
      setLoading(true);
      const data = await studentService.getStudents({ 
        institution: user.institution.id 
      });
      
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleEditSuccess = () => {
    setStudentToEdit(null);
    fetchStudents();
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      setIsDeleting(true);
      await studentService.deleteStudent(studentToDelete.id);
      toast.success("Student deleted successfully");
      setStudentToDelete(null);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Client-Side Filtering ---
  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (student.full_name?.toLowerCase() || "").includes(searchLower) ||
      (student.student_id?.toLowerCase() || "").includes(searchLower) ||
      (student.national_id?.toLowerCase() || "").includes(searchLower);

    const matchesProgram =
      filterProgram === "all" || student.program_name === filterProgram;

    return matchesSearch && matchesProgram;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage student registrations for <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Students Directory</CardTitle>
              <CardDescription>View and manage all registered students</CardDescription>
            </div>
            <div className="flex gap-2">
              <UploadStudentsDialog onSuccess={fetchStudents} />
              <AddStudentDialog 
                onStudentAdded={fetchStudents} 
                institutionId={user?.institution?.id} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Name, ID, or National ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {Array.from(new Set(students.map(s => s.program_name).filter(Boolean))).map(progName => (
                   <SelectItem key={progName} value={progName as string}>{progName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={7} className="h-24 text-center">
                       <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                     </TableCell>
                   </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {students.length === 0 ? "No students found." : "No matching results."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.full_name}</TableCell> 
                      <TableCell>{student.program_name}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>{student.enrollment_year}</TableCell>
                      <TableCell>
                        <Badge
                          variant={student.status === "Active" ? "default" : student.status === "Graduated" ? "outline" : "destructive"}
                          className={student.status === "Active" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStudentToEdit(student)}>
                                <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setStudentToDelete(student)}
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredStudents.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1 || loading}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages || loading}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the student record for{" "}
              <span className="font-semibold text-foreground">{studentToDelete?.full_name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{selectedStudent.student_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedStudent.full_name}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditStudentDialog 
        student={studentToEdit} 
        onClose={() => setStudentToEdit(null)} 
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default Students;