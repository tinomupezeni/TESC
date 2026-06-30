import { useEffect, useState, useMemo, useCallback } from "react";
import { ReportBuilder } from "@/components/reports";
import { ExportButtons } from "@/components/ExportButtons";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  User,
  GraduationCap
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { getStemStudents, StemStudent } from "@/services/reports.services";

export default function StemStudents() {
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  const exportData = (type: 'csv' | 'excel') => {
    const headers = ["Student ID", "Name", "Program", "Gender", "Institution"];
    const rows = filteredData.map((s: any) => [
      s.student_id_number || s.student_id || "N/A",
      s.full_name || "N/A",
      s.program_name || "N/A",
      s.gender || "N/A",
      s.institution_name || "N/A"
    ]);

    let content = "";
    let mimeType = "";
    let fileExtension = "";

    if (type === 'csv') {
      content = [headers, ...rows].map(e => e.join(",")).join("\n");
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
    } else {
      content = [headers.join("\\t"), ...rows.map(r => r.join("\\t"))].join("\n");
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      fileExtension = 'xls';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Export_Records.${fileExtension}`;
    link.click();
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [instFilter, setInstFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [students, setStudents] = useState<StemStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStemStudents();
      setStudents(data.results);
    } catch (error) {
      console.error("Failed to fetch STEM students", error);
      toast.error("Failed to load STEM students data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const institutions = useMemo(() => {
    const instSet = new Set(students.map(s => s.institution_name).filter(Boolean));
    return Array.from(instSet).sort();
  }, [students]);

  const filteredData = useMemo(() => {
    return students.filter(student => {
      const name = student.full_name || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesInst = instFilter === "all" || student.institution_name === instFilter;
      const matchesGender = genderFilter === "all" || student.gender === genderFilter;

      return matchesSearch && matchesInst && matchesGender;
    });
  }, [students, searchTerm, instFilter, genderFilter]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const male = filteredData.filter(s => s.gender === "Male").length;
    const female = filteredData.filter(s => s.gender === "Female").length;
    const maleRatio = total > 0 ? ((male / total) * 100).toFixed(1) : "0";
    const femaleRatio = total > 0 ? ((female / total) * 100).toFixed(1) : "0";
    return { total, male, female, maleRatio, femaleRatio };
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredData, currentPage]);

  const resetFilters = () => {
    setSearchTerm("");
    setInstFilter("all");
    setGenderFilter("all");
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:mb-8">
<div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:h-8 text-blue-600" />
            STEM STUDENT RECORDS & STATISTICS
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            System-wide statistics and records of students enrolled in STEM programs.
          </p>
        </div>
<ExportButtons onExport={exportData} onGenerateReport={() => setReportBuilderOpen(true)} />
</div>

        {/* Filters Section */}
        <Card className="p-4 border-blue-100 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search name, ID, program..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <Select value={instFilter} onValueChange={(v) => { setInstFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={resetFilters} className="text-slate-500 font-bold hover:text-blue-600">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset Filters
            </Button>
          </div>
        </Card>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="TOTAL STEM STUDENTS" value={stats.total} icon={Users} variant="default" />
          <StatsCard title="MALE STEM STUDENTS" value={`${stats.male} (${stats.maleRatio}%)`} icon={User} variant="default" />
          <StatsCard title="FEMALE STEM STUDENTS" value={`${stats.female} (${stats.femaleRatio}%)`} icon={User} variant="default" />
        </div>

        {/* Data Table Card */}
        <Card className="shadow-sm border-blue-50">
          <CardContent className="p-0 sm:pt-6">
            <div className="rounded-md border border-blue-100 dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                    <TableHead className="font-bold w-[120px]">Student ID</TableHead>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Program</TableHead>
                    <TableHead className="font-bold">Gender</TableHead>
                    <TableHead className="font-bold text-right">Institution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 animate-pulse font-bold text-blue-600">
                        Loading STEM students...
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No STEM student records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((student) => (
                      <TableRow key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-mono text-xs text-blue-700 dark:text-blue-400">{student.student_id_number}</TableCell>
                        <TableCell className="font-bold text-sm text-slate-900 dark:text-slate-100">{student.full_name}</TableCell>
                        <TableCell className="text-sm">{student.program_name}</TableCell>
                        <TableCell className="text-sm">{student.gender}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{student.institution_name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                Showing <strong>{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of {filteredData.length} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-blue-200 h-8 px-2"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <div className="text-xs font-bold px-2 whitespace-nowrap">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-blue-200 h-8 px-2"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ReportBuilder reportType="students" open={reportBuilderOpen} onOpenChange={setReportBuilderOpen} hideFilters={true} defaultFilters={{ program__category: 'STEM' }} />
</DashboardLayout>
  );
}
