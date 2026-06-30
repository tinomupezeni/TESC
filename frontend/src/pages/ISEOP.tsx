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
import { Label } from "@/components/ui/label";
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
  FileText,
  Info,
  FileDown,
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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // --- FILTERS STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedInstType, setSelectedInstType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // --- ROW BACKGROUND COLORS (CLASSIC BROWN palette) ---
  const rowColors = [
    "#5c5a14a",  // Classic Brown
    "#80461b",   // Russet
    "#734a12",   // Umber
    "#a47b5b",   // Doe
    "#4e312d",   // Espresso
    "#5b3101",   // Chocolate
    "#c36334",   // Cowhide
    "#a87b5b",   // Cork
    "#8b3410",   // Robusta
    "#dda154",   // Peanut
    "#645345",   // Wolf Brown
    "#5e1b17"    // Brownie
  ];

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
      categories: Array.from(new Set(allStudents.map(s => s.selected_category))).filter(Boolean).sort(),
      levels: Array.from(new Set(allStudents.map(s => s.selected_level))).filter(Boolean).sort()
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
    setSelectedCategory("all");
    setSelectedLevel("all");
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
        selectedCategory === "all" || student.selected_category === selectedCategory;
      const matchesLevel =
        selectedLevel === "all" || student.selected_level === selectedLevel;

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
  const exportData = (type: 'csv' | 'excel' | 'pdf') => {
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
    } else if (type === 'excel') {
      content = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      fileExtension = 'xls';
    } else {
      alert("PDF export not implemented yet");
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Student_Records.${fileExtension}`;
    link.click();
  };

  const handleExcelExport = () => exportData('excel');
  const handleCSVExport = () => exportData('csv');
  const handlePDFExport = () => exportData('pdf');

  // --- STATS CALCULATION ---
  const totalStudents = filteredStudents.length;
  const femaleStudents = filteredStudents.filter((s) => s.gender === "Female").length;
  const femalePercentage = totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) : "0";
  const maleStudents = filteredStudents.filter((s) => s.gender === "Male").length;
  const malePercentage = totalStudents > 0 ? ((maleStudents / totalStudents) * 100).toFixed(1) : "0";

  // FIXED: Use inclusivity_category instead of disability_type
  const disabledCount = filteredStudents.filter(s => {
    const category = s.inclusivity_category || s.disability_type; // fallback
    return category && category !== 'None' && category !== 'none';
  }).length;
  const specialPercentage = totalStudents > 0 ? ((disabledCount / totalStudents) * 100).toFixed(1) : "0";

  // Helper for status badge
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Graduated": return "success";
      case "Suspended": return "destructive";
      default: return "outline";
    }
  };

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
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">ISEOP STUDENT RECORDS </h1>
              <p className="text-muted-foreground mt-1">Manage and track all Iseop student information </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={handleExcelExport} className="flex gap-2 font-bold border-blue-200 hover:bg-blue-50">
                <Download className="h-4 w-4" /> Excel
              </Button>
              <Button onClick={handleCSVExport} variant="outline" className="flex gap-2 font-bold border-blue-200 hover:bg-blue-50">
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button onClick={() => setReportBuilderOpen(true)} className="flex gap-2 font-bold bg-green-600 hover:bg-green-700 shadow-sm transition-all">
                <FileText className="h-4 w-4" /> Generate Report
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print:grid print:grid-cols-4">
            <StatsCard title="Total Students" value={totalStudents.toLocaleString()} icon={Users} variant="default" />
            <StatsCard title="Female Students" value={femaleStudents.toLocaleString()} description={`${femalePercentage}%`} icon={UserCheck} variant="default" />
            <StatsCard title="Male Students" value={maleStudents.toLocaleString()} description={`${malePercentage}%`} icon={UserCheck} variant="default" />
            <StatsCard title="Special Support" value={disabledCount.toLocaleString()} description={`${specialPercentage}%`} icon={Users} variant="default" />
          </div>

          {/* Filters Card (dark theme) */}
          <Card className="border-blue-100 shadow-sm print:hidden overflow-hidden">
            <CardHeader className="bg-sky-50 py-3 px-4 border-b border-sky-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-700">
                <Filter className="h-4 w-4" /> 
                Advanced Data Filters
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-6 gap-x-8">
                {/* Search */}
                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Search ID/Name</Label>
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Type student name or ID..."
                      className="pl-10 h-11 bg-white shadow-sm border-slate-600 focus-visible:ring-blue-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Institution</Label>
                  <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                    <SelectTrigger className="h-11 bg-white border-slate-600 shadow-sm">
                      <SelectValue placeholder="All Institutions" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Registered Institutions</SelectItem>
                      {filterOptions.institutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Institution Type</Label>
                  <Select value={selectedInstType} onValueChange={setSelectedInstType}>
                    <SelectTrigger className="h-11 bg-white border-slate-600 shadow-sm">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institution Categories</SelectItem>
                      {filterOptions.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Program</Label>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                    <SelectTrigger className="h-11 bg-white border-slate-600 shadow-sm">
                      <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Academic Programs</SelectItem>
                      {filterOptions.programs.map(prog => <SelectItem key={prog} value={prog}>{prog}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Program Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-11 bg-white border-slate-600 shadow-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subject Categories</SelectItem>
                      {filterOptions.categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="h-11 bg-white border-slate-600 shadow-sm">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Certificate/Degree Levels</SelectItem>
                      {filterOptions.levels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Gender</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="h-11 bg-white border-slate-600 shadow-sm">
                      <SelectValue placeholder="All Genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gender Groups</SelectItem>
                      {filterOptions.genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-11 bg-white border-slate-600 shadow-sm">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Admission Years</SelectItem>
                      {filterOptions.years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 ml-1">Status</Label>
                  <div className="flex gap-2 w-full">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="h-11 bg-white border-slate-600 shadow-sm flex-1">
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
                      className="shrink-0 h-11 w-11 border-slate-600 bg-slate-600 text-white hover:bg-slate-500 transition-colors"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STUDENTS TABLE with brown row backgrounds */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Students ({filteredStudents.length})</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleExcelExport}>
                  <Download className="h-3 w-3 sm:mr-2" /> <span className="hidden sm:inline">Excel</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleCSVExport}>
                  <Download className="h-3 w-3 sm:mr-2" /> <span className="hidden sm:inline">CSV</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2" onClick={handlePDFExport}>
                  <FileDown className="h-3 w-3 sm:mr-2" /> <span className="hidden sm:inline">PDF</span>
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
                    <TableHead className="hidden md:table-cell">Program</TableHead>
                    <TableHead className="hidden sm:table-cell">Year</TableHead>
                    <TableHead className="hidden xl:table-cell">Gender</TableHead>
                    <TableHead className="hidden xl:table-cell">Disability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : paginatedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        No students found matching filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((s: any, index: number) => (
                      <TableRow
                        key={s.id}
                        style={{ backgroundColor: rowColors[index % rowColors.length] }}
                        className="text-white"
                      >
                        <TableCell className="font-medium text-[10px] sm:text-xs">
                          {s.student_id}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                          {s.full_name}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">
                          {s.institution_name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs">
                          {s.program_name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">
                          {s.enrollment_year ?? "N/A"}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs">
                          {s.gender ?? "N/A"}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs">
                          {s.inclusivity_category && s.inclusivity_category !== "None"
                            ? s.inclusivity_category
                            : "None"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(s.status)}
                            className="text-[10px] sm:text-xs whitespace-nowrap"
                          >
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedStudent(s)}
                          >
                            <Info className="h-4 w-4" />
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

      <StudentView data={selectedStudent} setdata={setSelectedStudent} />
      <ReportBuilder reportType="students" open={reportBuilderOpen} onOpenChange={setReportBuilderOpen} hideFilters={true} defaultFilters={{ is_iseop: true }} />
    </>
  );
}