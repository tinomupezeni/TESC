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
import { Label } from "@/components/ui/label"; // FIXED: Added missing import
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
  const [selectedCategory, setSelectedCategory] = useState("all"); // NEW
  const [selectedLevel, setSelectedLevel] = useState("all");       // NEW
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
      years: Array.from(new Set(allStudents.map(s => s.enrollment_year?.toString()))).filter(Boolean).sort().reverse(),
      categories: Array.from(new Set(allStudents.map(s => s.selected_category))).filter(Boolean).sort(), // NEW
      levels: Array.from(new Set(allStudents.map(s => s.selected_level))).filter(Boolean).sort()        // NEW
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
    setSelectedCategory("all"); // NEW
    setSelectedLevel("all");    // NEW
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
      const matchesCategory =
        selectedCategory === "all" || student.selected_category === selectedCategory; // NEW
      const matchesLevel =
        selectedLevel === "all" || student.selected_level === selectedLevel;       // NEW

      return matchesSearch && matchesStatus && matchesInst && matchesProg && matchesGender && matchesInstType && matchesYear && matchesCategory && matchesLevel;
    });
  }, [allStudents, searchTerm, selectedStatus, selectedInstitution, selectedProgram, selectedGender, selectedInstType, selectedYear, selectedCategory, selectedLevel]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedInstitution, selectedProgram, selectedGender, selectedInstType, selectedYear, selectedCategory, selectedLevel]);

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
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
          <p className="text-sm text-muted-foreground font-medium">Loading Student Records...</p>
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
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Student Records</h1>
              <p className="text-muted-foreground mt-1">Manage and track student information across the central system</p>
            </div>
            {/* Hides buttons in print */}
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={() => exportData('excel')} className="flex gap-2 font-bold border-blue-200 hover:bg-blue-50">
                <Download className="h-4 w-4" /> Excel
              </Button>
              <Button onClick={() => exportData('csv')} variant="outline" className="flex gap-2 font-bold border-blue-200 hover:bg-blue-50">
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button onClick={() => setReportBuilderOpen(true)} className="flex gap-2 font-bold bg-green-600 hover:bg-green-700 shadow-sm transition-all">
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

          {/* FILTERS SECTION - Optimized for visibility */}
          <Card className="border-blue-100 shadow-sm print:hidden overflow-hidden">
            <CardHeader className="bg-slate-50/50 py-3 px-4 border-b">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Filter className="h-4 w-4" /> Advanced Data Filters
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-6 gap-x-8">
                {/* Search Bar */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Search ID/Name</Label>
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Type student name or ID..."
                      className="pl-10 h-11 bg-white shadow-sm border-slate-200 focus-visible:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Institution Filter */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Institution</Label>
                  <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="All Institutions" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Registered Institutions</SelectItem>
                      {filterOptions.institutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Inst. Type Filter */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Institution Type</Label>
                  <Select value={selectedInstType} onValueChange={setSelectedInstType}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institution Categories</SelectItem>
                      {filterOptions.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Program Filter */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Program of Study</Label>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Academic Programs</SelectItem>
                      {filterOptions.programs.map(prog => <SelectItem key={prog} value={prog}>{prog}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Program Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subject Categories</SelectItem>
                      {filterOptions.categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Filter */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Academic Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Certificate/Degree Levels</SelectItem>
                      {filterOptions.levels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Gender</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="All Genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gender Groups</SelectItem>
                      {filterOptions.genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Enrollment Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Admission Years</SelectItem>
                      {filterOptions.years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Current Status</Label>
                  <div className="flex gap-2 w-full">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm flex-1">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Enrollment Statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Attachment">On Attachment</SelectItem>
                        <SelectItem value="Graduated">Graduated</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={resetFilters} 
                      title="Reset All Filters" 
                      className="shrink-0 h-11 w-11 border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border-none">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 print:hidden">
              <div>
                <CardTitle>Student Records ({filteredStudents.length})</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2 sm:px-3"
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Previous</span>
                </Button>
                <div className="text-xs sm:text-sm font-medium px-2 whitespace-nowrap">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || totalPages === 0}
                  className="h-8 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">Institution</TableHead>
                    <TableHead className="hidden xl:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Program</TableHead>
                    <TableHead className="hidden sm:table-cell">Gender</TableHead>
                    <TableHead className="hidden sm:table-cell">Year</TableHead>
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
                        <TableCell className="font-medium text-xs sm:text-sm">{student.student_id}</TableCell>
                        <TableCell className="max-w-[120px] sm:max-w-none truncate sm:whitespace-normal">{student.full_name}</TableCell>
                        <TableCell className="hidden lg:table-cell">{student.institution_name}</TableCell>
                        <TableCell className="hidden xl:table-cell">{student.type}</TableCell>
                        <TableCell className="hidden md:table-cell">{student.program_name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{student.gender}</TableCell>
                        <TableCell className="hidden sm:table-cell">{student.enrollment_year}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "Active" ? "default" : "outline"} className="text-[10px] sm:text-xs">
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                          <Button variant="ghost" size="sm" onClick={() => setstudent(student)} className="h-8 px-2">
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