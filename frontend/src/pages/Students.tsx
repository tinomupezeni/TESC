import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents } from "@/services/student.service";
import { Student } from "@/lib/types/academic.types";
import { useSpecialEnrollment } from "@/hooks/useSpecialEnrollment";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentView } from "@/components/student view";
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
import {
  Users,
  UserCheck,
  Download,
  Filter,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  FileText
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportBuilder } from "@/components/reports";

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
  </TableRow>
);

export default function Students() {
  const navigate = useNavigate();
  const { data: specialData, loading: specialLoading } = useSpecialEnrollment();

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [student, setstudent] = useState<Student | null>(null);

  // --- FILTERS STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedInstType, setSelectedInstType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const students = await getAllStudents();
        setAllStudents(students || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // --- DYNAMIC FILTER OPTIONS ---
  const filterOptions = useMemo(() => {
    return {
      institutions: Array.from(new Set(allStudents.map(s => s.institution_name))).filter(Boolean).sort(),
      programs: Array.from(new Set(allStudents.map(s => s.program_name))).filter(Boolean).sort(),
      genders: Array.from(new Set(allStudents.map(s => s.gender))).filter(Boolean).sort(),
      types: Array.from(new Set(allStudents.map(s => s.type))).filter(Boolean).sort(),
      years: Array.from(new Set(allStudents.map(s => s.enrollment_year?.toString()))).filter(Boolean).sort().reverse()
    };
  }, [allStudents]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedInstitution("all");
    setSelectedProgram("all");
    setSelectedGender("all");
    setSelectedInstType("all");
    setSelectedYear("all");
    setCurrentPage(1);
  };

  // --- FILTERING LOGIC ---
  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];
    return allStudents.filter((student) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        student.full_name.toLowerCase().includes(search) ||
        student.student_id.toLowerCase().includes(search);
      const matchesStatus =
        selectedStatus === "all" || student.status === selectedStatus;
      const matchesInst =
        selectedInstitution === "all" || student.institution_name === selectedInstitution;
      const matchesProg =
        selectedProgram === "all" || student.program_name === selectedProgram;
      const matchesGender =
        selectedGender === "all" || student.gender === selectedGender;
      const matchesInstType =
        selectedInstType === "all" || student.type === selectedInstType;
      const matchesYear =
        selectedYear === "all" || student.enrollment_year?.toString() === selectedYear;

      return matchesSearch && matchesStatus && matchesInst && matchesProg && matchesGender && matchesInstType && matchesYear;
    });
  }, [allStudents, searchTerm, selectedStatus, selectedInstitution, selectedProgram, selectedGender, selectedInstType, selectedYear]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedInstitution, selectedProgram, selectedGender, selectedInstType, selectedYear]);

  // --- EXPORT LOGIC ---
  const exportData = (type: 'csv' | 'excel') => {
    const headers = ["Student ID", "Full Name", "Institution", "Institution Type", "Program", "Gender", "Year", "Status"];
    const rows = filteredStudents.map(d => [
      d.student_id,
      d.full_name,
      d.institution_name,
      d.type,
      d.program_name,
      d.gender,
      d.enrollment_year,
      d.status
    ]);

    let content = "";
    let mimeType = "";
    let fileExtension = "";

    if (type === 'csv') {
      content = [headers, ...rows].map(e => e.join(",")).join("\n");
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
    } else {
      content = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      fileExtension = 'xls';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Student_Records.${fileExtension}`;
    link.click();
  };

  // --- STATS CALCULATION ---
  const totalStudents = filteredStudents.length;
  const femaleStudents = filteredStudents.filter((s) => s.gender === "Female").length;
  const femalePercentage = totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) : "0";
  const maleStudents = filteredStudents.filter((s) => s.gender === "Male").length;
  const malePercentage = totalStudents > 0 ? ((maleStudents / totalStudents) * 100).toFixed(1) : "0";
  // Updated disability count to be more robust based on types
  const disabledCount = filteredStudents.filter(s => s.disability_type && s.disability_type !== 'None' && s.disability_type !== 'none').length;
  const specialPercentage = totalStudents > 0 ? ((disabledCount / totalStudents) * 100).toFixed(1) : "0";

  if (isLoading && specialLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Student Records</h1>
              <p className="text-muted-foreground">Manage and track student information</p>
            </div>
            {/* Hides buttons in print */}
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={() => exportData('excel')} className="flex gap-2 font-bold border-blue-200">
                <Download className="h-4 w-4" /> Excel
              </Button>
              <Button onClick={() => exportData('csv')} variant="outline" className="flex gap-2 font-bold border-blue-200">
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button onClick={() => setReportBuilderOpen(true)} className="flex gap-2 font-bold bg-green-600 hover:bg-green-700">
                <FileText className="h-4 w-4" /> Generate Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print:grid print:grid-cols-4">
            <StatsCard title="Total Students" value={totalStudents.toLocaleString()} icon={Users} variant="accent" />
            <StatsCard title="Female Students" value={femaleStudents.toLocaleString()} description={`${femalePercentage}%`} icon={UserCheck} variant="success" />
            <StatsCard title="Male Students" value={maleStudents.toLocaleString()} description={`${malePercentage}%`} icon={UserCheck} variant="success" />
            <StatsCard title="Special Support" value={disabledCount.toLocaleString()} description={`${specialPercentage}%`} icon={Users} variant="warning" />
          </div>

          {/* FILTERS SECTION - Hides in print */}
          <Card className="p-4 border-blue-100 shadow-sm print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative lg:col-span-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger><SelectValue placeholder="Institution" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {filterOptions.institutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedInstType} onValueChange={setSelectedInstType}>
                <SelectTrigger><SelectValue placeholder="Inst. Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filterOptions.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger><SelectValue placeholder="Program" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {filterOptions.programs.map(prog => <SelectItem key={prog} value={prog}>{prog}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {filterOptions.genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {filterOptions.years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Attachment">Attachment</SelectItem>
                  <SelectItem value="Graduated">Graduated</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" onClick={resetFilters} className="text-slate-500 font-bold hover:text-blue-600 lg:col-span-1">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          </Card>

          <Card className="print:shadow-none print:border-none">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-4 print:hidden">
              <div>
                <CardTitle>Student Records ({filteredStudents.length})</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Institution Type</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right print:hidden">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-red-500 py-10">
                        <AlertCircle className="inline-block mr-2" /> Failed to load data.
                      </TableCell>
                    </TableRow>
                  ) : paginatedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        No students found matching filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.institution_name}</TableCell>
                        <TableCell>{student.type}</TableCell>
                        <TableCell>{student.program_name}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{student.enrollment_year}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "Active" ? "default" : "outline"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                          <Button variant="ghost" size="sm" onClick={() => setstudent(student)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      <StudentView data={student} setdata={setstudent} />

      {/* Report Builder Dialog */}
      <ReportBuilder
        reportType="students"
        open={reportBuilderOpen}
        onOpenChange={setReportBuilderOpen}
      />
    </>
  );
}