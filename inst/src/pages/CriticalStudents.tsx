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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  Loader2,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Components & Services
import { BulkUploadResolver } from "@/components/common/BulkUploadResolver";
import { AddStudentDialog } from "@/components/AddStudentDialog";
import { CriticalStudent, CriticalStudentsAPIResponse, getCriticalStudents } from "../services/reports.services";

const CriticalStudents = () => {
  const { user } = useAuth();
  
  const [students, setStudents] = useState<CriticalStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Summary stats states
  const [totalStudents, setTotalStudents] = useState(0);
  const [maleStudents, setMaleStudents] = useState(0);
  const [femaleStudents, setFemaleStudents] = useState(0);

  const fetchStudents = useCallback(async () => {
    if (!user?.institution?.id) return;
    try {
      setLoading(true);
      const apiResponse: CriticalStudentsAPIResponse = await getCriticalStudents(
        user.institution.id,
        searchQuery
      );
      setStudents(apiResponse.results);
      setTotalStudents(apiResponse.total_students);
      setMaleStudents(apiResponse.male_students);
      setFemaleStudents(apiResponse.female_students);

    } catch (error) {
      console.error("Failed to fetch critical students", error);
      toast.error("Failed to load critical students");
      setStudents([]);
      setTotalStudents(0);
      setMaleStudents(0);
      setFemaleStudents(0);
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const malePercentage = totalStudents > 0 ? ((maleStudents / totalStudents) * 100).toFixed(1) : "0.0";
  const femalePercentage = totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Critical Skills Students
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          View and manage students enrolled in critical skill programs for{" "}
          <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      {/* Main Content Area */}
      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Critical Skills Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Comprehensive list of critical program students</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <AddStudentDialog onStudentAdded={fetchStudents} defaultCategory="CRITICAL" />
              <div className="flex-1 sm:flex-none">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>Bulk Upload Critical Skills Students</DialogTitle></DialogHeader>
                    <BulkUploadResolver moduleType="critical_students" onSuccess={fetchStudents} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Male Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maleStudents} <span className="text-sm font-normal text-muted-foreground">({malePercentage}%)</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Female Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{femaleStudents} <span className="text-sm font-normal text-muted-foreground">({femalePercentage}%)</span></div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 sm:h-10"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-xs">Student ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Program</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">Gender</TableHead>
                  <TableHead className="text-right text-xs">Institution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading critical students...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                      No critical students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{student.student_id_number}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{student.full_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{student.program_name}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{student.gender}</TableCell>
                      <TableCell className="text-right text-[10px] sm:text-xs">{student.institution_name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CriticalStudents;
