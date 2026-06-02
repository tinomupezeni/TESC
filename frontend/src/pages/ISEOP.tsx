import { useState, useMemo, useEffect } from "react";
import { getIseopStudents } from "@/services/iseop.service";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
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
import {
  Users,
  GraduationCap,
  Building,
  Zap,
  RotateCcw,
  Info,
  AlertTriangle,
  FileDown,
  Download,
  Accessibility,
} from "lucide-react";
import { StudentView } from "@/components/student view";
import { IseopStudent } from "@/lib/types/iseop.types";
import { exportToExcel } from "@/lib/export-utils";

const TableRowSkeleton = () => (
  <TableRow>
    {Array(9).fill(0).map((_, i) => (
      <TableCell key={i}><Skeleton className="h-4 w-full" /></TableCell>
    ))}
  </TableRow>
);

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Active/Enrolled": return "default";
    case "Completed": return "success";
    case "Deferred": return "warning";
    default: return "outline";
  }
};

export default function ISEOPStudents() {
  const [allStudents, setAllStudents] = useState<IseopStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<IseopStudent | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Fetch
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getIseopStudents();
        setAllStudents(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // =======================
  // FILTERED STUDENTS
  // =======================
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s: any) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        s.full_name?.toLowerCase().includes(search) ||
        s.student_id?.toLowerCase().includes(search) ||
        s.program_name?.toLowerCase().includes(search) ||
        s.institution_name?.toLowerCase().includes(search);

      const matchesStatus = selectedStatus === "all" || s.status === selectedStatus;
      const matchesInstitution = selectedInstitution === "all" || s.institution_name === selectedInstitution;
      const matchesYear = selectedYear === "all" || s.enrollment_year?.toString() === selectedYear;
      const matchesGender = selectedGender === "all" || s.gender === selectedGender;

      return matchesSearch && matchesStatus && matchesInstitution && matchesYear && matchesGender;
    });
  }, [allStudents, searchTerm, selectedStatus, selectedInstitution, selectedYear, selectedGender]);

  // =======================
  // STATS
  // =======================
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    let active = 0, completed = 0, deferred = 0;
    let male = 0, female = 0;
    let disabilityTotal = 0, disabilityActive = 0, disabilityCompleted = 0;
    const programs = new Set<string>();

    filteredStudents.forEach((s: any) => {
      if (s.status === "Active/Enrolled") active++;
      if (s.status === "Completed") completed++;
      if (s.status === "Deferred") deferred++;
      if (s.gender === "Male") male++;
      if (s.gender === "Female") female++;
      if (s.program_name) programs.add(s.program_name);

      if (s.disability_type && s.disability_type !== "None") {
        disabilityTotal++;
        if (s.status === "Active/Enrolled") disabilityActive++;
        if (s.status === "Completed") disabilityCompleted++;
      }
    });

    return {
      total,
      active,
      completed,
      deferred,
      male,
      female,
      totalPrograms: programs.size,
      maleRate: total ? ((male / total) * 100).toFixed(1) : "0",
      femaleRate: total ? ((female / total) * 100).toFixed(1) : "0",
      disabilityTotal,
      disabilityActive,
      disabilityCompleted,
    };
  }, [filteredStudents]);

  // =======================
  // CHART DATA (FIXED LOGIC)
  // =======================
  const chartData = useMemo(() => {
    const temp: Record<string, { year: string; Enrolled: number; Completed: number }> = {};
    
    filteredStudents.forEach((s: any) => {
      const year = s.enrollment_year?.toString();
      if (!year || (selectedProgram !== "all" && s.program_name !== selectedProgram)) return;
      
      if (!temp[year]) temp[year] = { year, Enrolled: 0, Completed: 0 };
      
      /** * FIX: We count EVERY record as an enrollment for its respective year.
       * If we only counted "Active/Enrolled", students would disappear from 
       * the blue line as soon as they graduated.
       */
      temp[year].Enrolled++;

      // Count only those who have actually completed
      if (s.status === "Completed") {
        temp[year].Completed++;
      }
    });
    return Object.values(temp).sort((a, b) => Number(a.year) - Number(b.year));
  }, [filteredStudents, selectedProgram]);

  // =======================
  // PAGINATION
  // =======================
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  useEffect(() => setCurrentPage(1), [searchTerm, selectedStatus, selectedInstitution, selectedYear, selectedGender]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedInstitution("all");
    setSelectedYear("all");
    setSelectedGender("all");
    setSelectedProgram("all");
  };

  const uniqueInstitutions = Array.from(new Set(allStudents.map(s => s.institution_name).filter(Boolean)));
  const uniqueYears = Array.from(new Set(allStudents.map(s => s.enrollment_year).filter(Boolean).map(String))).sort();
  const uniquePrograms = Array.from(new Set(allStudents.map(s => s.program_name).filter(Boolean)));

  const handleExcelExport = () => exportToExcel(filteredStudents, `ISEOP_Report_${new Date().toLocaleDateString()}`);

  const handleCSVExport = () => {
    const headers = ["ID","Name","Institution","Program","Year","Gender","Disability","Status"];
    const rows = filteredStudents.map(s => [
      s.student_id, s.full_name, s.institution_name, s.program_name, s.enrollment_year, s.gender, s.disability_type ?? "None", s.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ISEOP_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const handlePDFExport = () => window.print();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">ISEOP Dashboard</h1>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Students" value={stats.total} description="All years" icon={Users} variant="accent" />
          <StatsCard title="Active Students" value={stats.active} description={`Active in ${new Date().getFullYear()}`} icon={Zap} variant="success" />
          <StatsCard title="Completed" value={stats.completed} description="Across all years" icon={GraduationCap} variant="info" />
          <StatsCard title="Deferred/Dropped" value={stats.deferred} description="Across all years" icon={AlertTriangle} variant="warning" />
          <StatsCard title="Male Students" value={stats.male} description={`${stats.maleRate}%`} icon={Users} variant="default" />
          <StatsCard title="Female Students" value={stats.female} description={`${stats.femaleRate}%`} icon={Users} variant="default" />
          <StatsCard title="Total Programs" value={stats.totalPrograms} description="Active programs" icon={Building} variant="default" />
          <StatsCard title="Special Needs" value={stats.disabilityTotal} description="All disabilities" icon={Accessibility} variant="info" />
        </div>

        {/* CHART */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Enrollment vs Completion Trends</CardTitle>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {uniquePrograms.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-64 sm:h-[350px] p-2 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" allowDecimals={false} fontSize={10} />
                <YAxis allowDecimals={false} fontSize={10} />
                <Tooltip wrapperStyle={{ fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="Enrolled" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }}>
                  <LabelList dataKey="Enrolled" position="top" offset={10} style={{ fontSize: '10px' }} />
                </Line>
                <Line type="monotone" dataKey="Completed" stroke="#22c55e" strokeWidth={2}>
                  <LabelList dataKey="Completed" position="top" offset={10} style={{ fontSize: '10px' }} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* FILTERS */}
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2">
              <Input placeholder="Search name, ID, program..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
              <SelectTrigger><SelectValue placeholder="Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {uniqueInstitutions.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={resetFilters} className="h-9 sm:col-span-2 lg:col-span-1"><RotateCcw className="h-4 w-4 mr-2" /> Reset</Button>
          </div>
        </Card>

        {/* TABLE */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Students ({filteredStudents.length})</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleExcelExport}><Download className="h-3 w-3 sm:mr-2" /> <span className="hidden sm:inline">Excel</span></Button>
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleCSVExport}><Download className="h-3 w-3 sm:mr-2" /> <span className="hidden sm:inline">CSV</span></Button>
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={handlePDFExport}><FileDown className="h-3 w-3 sm:mr-2" /> <span className="hidden sm:inline">PDF</span></Button>
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
                {loading ? Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />) : paginatedStudents.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-[10px] sm:text-xs">{s.student_id}</TableCell>
                    <TableCell className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{s.full_name}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{s.institution_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{s.program_name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{s.enrollment_year ?? "N/A"}</TableCell>
                    <TableCell className="hidden xl:table-cell text-xs">{s.gender ?? "N/A"}</TableCell>
                    <TableCell className="hidden xl:table-cell text-xs">{s.disability_type && s.disability_type !== "None" ? s.disability_type : "None"}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(s.status)} className="text-[10px] sm:text-xs whitespace-nowrap">{s.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedStudent(s)}>
                        <Info className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <StudentView data={selectedStudent} setdata={setSelectedStudent} />
    </DashboardLayout>
  );
}