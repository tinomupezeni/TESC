import { useEffect, useState, useCallback } from "react";
// 1. Import useAuth
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
import { Search, MoreVertical, Filter, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddStudentDialog } from "@/components/AddStudentDialog";
import { getStudents, Student } from "@/services/students.services"; // Ensure correct import path

const Students = () => {
  // 2. Get the user from AuthContext
  const { user } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // 3. Update fetch function to use user.institution.id
  const fetchStudents = useCallback(async () => {
    // Safety check: Don't fetch if user or institution is missing
    if (!user?.institution?.id) return;

    try {
      setLoading(true);
      
      // PASS THE ID HERE
      const data = await getStudents({ 
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
  }, [user]); // Re-create function if user changes

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Student Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage student registrations for <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Students Directory</CardTitle>
              <CardDescription>
                View and manage all registered students
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Pass the ID to the Add Dialog too if needed */}
              <AddStudentDialog 
                onStudentAdded={fetchStudents} 
                institutionId={user?.institution?.id} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters Bar */}
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
                       <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading students...
                     </TableCell>
                   </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {students.length === 0 
                        ? "No students found for this institution." 
                        : "No matching results."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.student_id}
                      </TableCell>
                      <TableCell>{student.full_name}</TableCell> 
                      <TableCell>{student.program_name}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>{student.enrollment_year}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.status === "Active"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            student.status === "Active" ? "bg-green-600 hover:bg-green-700" : ""
                          }
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
                            <DropdownMenuItem
                              onClick={() => setSelectedStudent(student)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Student</DropdownMenuItem>
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
            <p className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-medium">{selectedStudent.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">National ID</p>
                      <p className="font-medium">{selectedStudent.national_id || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedStudent.full_name}</p>
                    </div>
                     <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{selectedStudent.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{selectedStudent.date_of_birth || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Institution</p>
                      <p className="font-medium">{selectedStudent.institution_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="font-medium">{selectedStudent.program_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{selectedStudent.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enrollment Year</p>
                      <p className="font-medium">{selectedStudent.enrollment_year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;