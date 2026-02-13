import { useState, useEffect, useCallback } from "react";
import {
  Search, Filter, MoreVertical, Pencil,
  ChevronLeft, ChevronRight, Loader2, Plus, UserMinus, UserPlus
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import {
  IseopStudent, updatestudents, unenrollStudent, enrollStudent,
  getAvailableStudents, WorkArea
} from "@/services/iseop.services";
import { useAuth } from "@/context/AuthContext";

const WORK_AREAS: WorkArea[] = ['Library', 'Grounds', 'Labs', 'Admin', 'Cafeteria', 'Maintenance'];

interface IseopStudentManagerProps {
  students: IseopStudent[];
  loading?: boolean;
  onRefresh: () => void;
}

const IseopStudentManager = ({ students = [], loading, onRefresh }: IseopStudentManagerProps) => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterWorkArea, setFilterWorkArea] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IseopStudent | null>(null);
  const [editForm, setEditForm] = useState({
    work_area: '' as WorkArea | '',
    hours_pledged: 0,
    is_work_for_fees: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Unenroll dialog state
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [unenrollingStudent, setUnenrollingStudent] = useState<IseopStudent | null>(null);

  // Add/Enroll dialog state
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<IseopStudent[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<IseopStudent | null>(null);
  const [enrollForm, setEnrollForm] = useState({
    work_area: '' as WorkArea | '',
    hours_pledged: 0,
    is_work_for_fees: false,
  });

  const itemsPerPage = 10;

  // --- Fetch available students for enrollment ---
  const fetchAvailableStudents = useCallback(async (search?: string) => {
    setLoadingAvailable(true);
    try {
      const data = await getAvailableStudents({
        institution_id: institutionId,
        search: search || undefined,
      });
      setAvailableStudents(data);
    } catch (error) {
      console.error("Failed to fetch available students:", error);
      toast.error("Failed to load available students");
    } finally {
      setLoadingAvailable(false);
    }
  }, [institutionId]);

  // Fetch available students when enroll dialog opens
  useEffect(() => {
    if (enrollDialogOpen) {
      fetchAvailableStudents();
    }
  }, [enrollDialogOpen, fetchAvailableStudents]);

  // Debounced search for available students
  useEffect(() => {
    if (enrollDialogOpen) {
      const timer = setTimeout(() => {
        fetchAvailableStudents(studentSearchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [studentSearchQuery, enrollDialogOpen, fetchAvailableStudents]);

  // --- Filtering ---
  const filtered = students.filter((s) => {
    const matchesSearch =
      (s.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (s.student_id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesWorkArea = filterWorkArea === "all" || s.work_area === filterWorkArea;
    return matchesSearch && matchesWorkArea;
  });

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

  // --- Edit handlers ---
  const handleEditClick = (student: IseopStudent) => {
    setEditingStudent(student);
    setEditForm({
      work_area: student.work_area || '',
      hours_pledged: student.hours_pledged || 0,
      is_work_for_fees: student.is_work_for_fees || false,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingStudent) return;
    setSubmitting(true);
    try {
      await updatestudents(editingStudent.id, {
        work_area: editForm.work_area || undefined,
        hours_pledged: editForm.hours_pledged,
        is_work_for_fees: editForm.is_work_for_fees,
      });
      toast.success("Student updated successfully");
      setEditDialogOpen(false);
      setEditingStudent(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Unenroll handlers ---
  const handleUnenrollClick = (student: IseopStudent) => {
    setUnenrollingStudent(student);
    setUnenrollDialogOpen(true);
  };

  const handleUnenrollConfirm = async () => {
    if (!unenrollingStudent) return;
    setSubmitting(true);
    try {
      await unenrollStudent(unenrollingStudent.id);
      toast.success("Student unenrolled successfully");
      setUnenrollDialogOpen(false);
      setUnenrollingStudent(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to unenroll student");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Enroll handlers ---
  const handleOpenEnrollDialog = () => {
    setSelectedStudent(null);
    setEnrollForm({
      work_area: '',
      hours_pledged: 0,
      is_work_for_fees: false,
    });
    setStudentSearchQuery("");
    setEnrollDialogOpen(true);
  };

  const handleEnrollSubmit = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student to enroll");
      return;
    }
    setSubmitting(true);
    try {
      await enrollStudent({
        student_id: selectedStudent.id,
        work_area: enrollForm.work_area || undefined,
        hours_pledged: enrollForm.hours_pledged,
        is_work_for_fees: enrollForm.is_work_for_fees,
      });
      toast.success(`${selectedStudent.full_name} enrolled successfully`);
      setEnrollDialogOpen(false);
      setSelectedStudent(null);
      onRefresh();
    } catch (error) {
      toast.error("Failed to enroll student");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">ISEOP Students</CardTitle>
              <CardDescription>Manage students enrolled in ISEOP and Work-for-Fees programs</CardDescription>
            </div>
            <Button
              onClick={handleOpenEnrollDialog}
              className="gap-2 bg-[#002e5b] hover:bg-[#001f3d]"
            >
              <Plus className="h-4 w-4" /> Add Student
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterWorkArea} onValueChange={setFilterWorkArea}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Work Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Work Areas</SelectItem>
                {WORK_AREAS.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Student ID</TableHead>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Program</TableHead>
                  <TableHead className="font-bold">Work Area</TableHead>
                  <TableHead className="font-bold text-center">Hours</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-blue-700">{student.student_id}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900">{student.full_name}</div>
                        <div className="text-xs text-slate-500">{student.email}</div>
                      </TableCell>
                      <TableCell>{student.program_name}</TableCell>
                      <TableCell>{student.work_area || '-'}</TableCell>
                      <TableCell className="text-center">{student.hours_pledged}</TableCell>
                      <TableCell>
                        {student.is_work_for_fees ? (
                          <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            Work-for-Fees
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            ISEOP
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(student)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-orange-600"
                              onClick={() => handleUnenrollClick(student)}
                            >
                              <UserMinus className="h-4 w-4 mr-2" /> Unenroll
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Enroll Student Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Enroll Student in ISEOP
            </DialogTitle>
            <DialogDescription>
              Search and select a student to enroll in the ISEOP program
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Student Search */}
            <div className="space-y-2">
              <Label>Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or student ID..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Available Students List */}
            <div className="space-y-2">
              <Label>Select Student</Label>
              <div className="border rounded-md max-h-[200px] overflow-y-auto">
                {loadingAvailable ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No available students found
                  </div>
                ) : (
                  availableStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 border-b last:border-b-0 ${
                        selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.student_id} - {student.program_name}
                        </div>
                      </div>
                      {selectedStudent?.id === student.id && (
                        <Badge variant="default" className="bg-blue-600">Selected</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ISEOP Details */}
            {selectedStudent && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-sm">ISEOP Enrollment Details</h4>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="enroll_work_area">Work Area</Label>
                    <Select
                      value={enrollForm.work_area}
                      onValueChange={(value: WorkArea) => setEnrollForm({ ...enrollForm, work_area: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select work area (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORK_AREAS.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="enroll_hours">Hours Pledged</Label>
                    <Input
                      id="enroll_hours"
                      type="number"
                      min="0"
                      value={enrollForm.hours_pledged}
                      onChange={(e) => setEnrollForm({ ...enrollForm, hours_pledged: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enroll_work_for_fees"
                      checked={enrollForm.is_work_for_fees}
                      onChange={(e) => setEnrollForm({ ...enrollForm, is_work_for_fees: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="enroll_work_for_fees">Enroll in Work-for-Fees Program</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEnrollSubmit}
              disabled={submitting || !selectedStudent}
              className="bg-[#002e5b] hover:bg-[#001f3d]"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enroll Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Student ISEOP Details</DialogTitle>
            <DialogDescription>
              Update work assignment for {editingStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="work_area">Work Area</Label>
              <Select
                value={editForm.work_area}
                onValueChange={(value: WorkArea) => setEditForm({ ...editForm, work_area: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work area" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_AREAS.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours_pledged">Hours Pledged</Label>
              <Input
                id="hours_pledged"
                type="number"
                value={editForm.hours_pledged}
                onChange={(e) => setEditForm({ ...editForm, hours_pledged: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_work_for_fees"
                checked={editForm.is_work_for_fees}
                onChange={(e) => setEditForm({ ...editForm, is_work_for_fees: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_work_for_fees">Work for Fees Program</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unenroll Confirmation Dialog */}
      <Dialog open={unenrollDialogOpen} onOpenChange={setUnenrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Unenrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll {unenrollingStudent?.full_name} from the ISEOP program?
              This will remove their work-for-fees status and work area assignment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnenrollDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleUnenrollConfirm} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Unenroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IseopStudentManager;
