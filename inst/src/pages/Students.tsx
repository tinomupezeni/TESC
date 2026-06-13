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
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Student Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage student registrations for <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Students Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all registered students</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <UploadStudentsDialog onSuccess={fetchStudents} />
              </div>
              <div className="flex-1 sm:flex-none">
                <AddStudentDialog 
                  onStudentAdded={fetchStudents} 
                  institutionId={user?.institution?.id} 
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Name, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 sm:h-10"
              />
            </div>
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="w-full md:w-[200px] h-9 sm:h-10 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Filter className="h-3.5 w-3.5 mr-2 shrink-0" />
                  <SelectValue placeholder="All Programs" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {Array.from(new Set(students.map(s => s.program_name).filter(Boolean))).map(progName => (
                   <SelectItem key={progName} value={progName as string}>{progName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-xs">ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs">Program</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Gender</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">Enrollment</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                      {students.length === 0 ? "No students found." : "No matching results."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{student.student_id}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{student.full_name}</TableCell> 
                      <TableCell className="hidden lg:table-cell text-xs">{student.program_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{student.gender}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{student.enrollment_year}</TableCell>
                      <TableCell>
                        <Badge
                          variant={student.status === "Active" ? "default" : student.status === "Graduated" ? "outline" : "destructive"}
                          className={`text-[10px] sm:text-xs px-1.5 py-0.5 whitespace-nowrap ${student.status === "Active" ? "bg-green-600 hover:bg-green-700" : ""}`}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
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
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left">
              Showing {filteredStudents.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={handlePrevPage} disabled={currentPage === 1 || loading}>
                <ChevronLeft className="h-4 w-4 sm:mr-1" /> Prev
              </Button>
              <div className="text-[10px] sm:text-xs font-medium px-2 whitespace-nowrap">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleNextPage} disabled={currentPage >= totalPages || loading}>
                Next <ChevronRight className="h-4 w-4 sm:ml-1" />
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>Detailed information for {selectedStudent?.full_name}</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Full Name:</span>
                      <span className="font-medium">{selectedStudent.full_name}</span>
                      
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="font-medium">{selectedStudent.gender || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <span className="font-medium">{selectedStudent.date_of_birth || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">National ID:</span>
                      <span className="font-medium">{selectedStudent.national_id || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Disability:</span>
                      <span className="font-medium">{selectedStudent.disability_type || 'None'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Student ID:</span>
                      <span className="font-medium">{selectedStudent.student_id}</span>
                      
                      <span className="text-muted-foreground">Program:</span>
                      <span className="font-medium">{selectedStudent.program_name || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Enrollment Year:</span>
                      <span className="font-medium">{selectedStudent.enrollment_year}</span>
                      
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">
                        <Badge variant="outline">{selectedStudent.status}</Badge>
                      </span>

                      {selectedStudent.status === 'Dropout' && (
                        <>
                          <span className="text-muted-foreground">Dropout Reason:</span>
                          <span className="font-medium text-destructive">{selectedStudent.dropout_reason || 'Unspecified'}</span>
                        </>
                      )}

                      {selectedStudent.status === 'Graduated' && (
                        <>
                          <span className="text-muted-foreground">Graduation Year:</span>
                          <span className="font-medium">{selectedStudent.graduation_year || 'N/A'}</span>
                          <span className="text-muted-foreground">Final Grade:</span>
                          <span className="font-medium">{selectedStudent.final_grade || 'N/A'}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Work for Fees Information (if applicable) */}
              {selectedStudent.is_work_for_fees && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Work For Fees details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground block">Enrolled:</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Yes</Badge>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block">Work Area:</span>
                        <span className="font-medium">{selectedStudent.work_area || 'Not Assigned'}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground block">Hours Pledged:</span>
                        <span className="font-medium">{selectedStudent.hours_pledged || 0} hrs</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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