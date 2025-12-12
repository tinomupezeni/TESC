import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, UserCheck, UserPlus, Download, Filter, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import AddStudent from "@/modules/students/AddStudent";

// --- UPDATED IMPORTS ---
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents } from "@/services/student.service";
import { Student } from "@/lib/types/academic.types";
import { Skeleton } from "@/components/ui/skeleton";
// -----------------------

// --- TableRow Skeleton ---
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-40" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-12" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-20 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-8 w-16" />
    </TableCell>
  </TableRow>
);
// -------------------------

export default function Students() {
  const [addStudent, setAddStudent] = useState(false);
  const navigate = useNavigate()

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // --- Data Fetching States (replaces useQuery) ---
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  // ------------------------------------------------

  // --- Data Fetching with useEffect ---
  useEffect(() => {
    
    const fetchStudents = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        // Assumes this service handles pagination (returns .results)
        const students = await getAllStudents();
        console.log("hello");
        setAllStudents(students);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []); // Empty dependency array means this runs once on mount
  // ------------------------------------

  // --- Client-side Filtering (no change needed) ---
  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];

    return allStudents.filter((student) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        student.full_name.toLowerCase().includes(search) ||
        student.student_id.toLowerCase().includes(search);

      const matchesStatus =
        selectedStatus === "all" || student.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [allStudents, searchTerm, selectedStatus]);

  // --- Dynamic Stats (no change needed) ---
  const totalStudents = allStudents?.length || 0;
  const activeStudents = useMemo(
    () => allStudents?.filter((s) => s.status === "Active").length || 0,
    [allStudents]
  );
  const femaleStudents = useMemo(
    () => allStudents?.filter((s) => s.gender === "Female").length || 0,
    [allStudents]
  );
  const femalePercentage =
    totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) : 0;

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Student Records</h1>
              <p className="text-muted-foreground">
                Manage and track student information across all institutions
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
             
            </div>
          </div>

          {/* Student Statistics (Dynamic) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Total Students"
              value={isLoading ? "..." : totalStudents.toLocaleString()}
              description="All enrolled students"
              icon={Users}
              variant="accent"
            />
            <StatsCard
              title="Female Students"
              value={isLoading ? "..." : femaleStudents.toLocaleString()}
              description={isLoading ? "..." : `${femalePercentage}% of total`}
              icon={UserCheck}
              variant="success"
            />
            <StatsCard
              title="Students with Disabilities"
              value={1247} // This data is not in the model, left as static
              description="2.1% receiving support"
              icon={Users}
              variant="warning"
            />
          </div>

          {/* Filters and Search (Functional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search and Filter Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Attachment">Attachment</SelectItem>
                    <SelectItem value="Graduated">Graduated</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Deferred">Deferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Student Records Table (Dynamic) */}
          <Card>
            <CardHeader>
              <CardTitle>Student Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <>
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                    </>
                  )}

                  {isError && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-red-500"
                      >
                        <AlertCircle className="inline-block mr-2" />
                        Failed to load student data. Please try again.
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading && !isError && filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No students found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading &&
                    !isError &&
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.student_id}
                        </TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.institution}</TableCell>
                        <TableCell>{student.program}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === "Active"
                                ? "default"
                                : student.status === "Attachment"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/students/${student.id}`)
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

      <AddStudent open={addStudent} onOpenChange={setAddStudent} />
    </>
  );
}