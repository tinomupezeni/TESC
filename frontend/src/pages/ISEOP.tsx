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
        <h1 className="text-3xl font-bold">ISEOP Dashboard</h1>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Total Students" value={stats.total} description="Across all years/institutions" icon={Users} variant="accent" />
          <StatsCard title="Active Students" value={stats.active} description={`Active in ${new Date().getFullYear()}`} icon={Zap} variant="success" />
          <StatsCard title="Students that Completed Programs" value={stats.completed} description="Completed across all years" icon={GraduationCap} variant="info" />
          <StatsCard title="Deferred / Dropped" value={stats.deferred} description="Students that Deferred/Dropped across all years" icon={AlertTriangle} variant="warning" />
          <StatsCard title="Male Students" value={stats.male} description={`${stats.maleRate}% of total`} icon={Users} variant="default" />
          <StatsCard title="Female Students" value={stats.female} description={`${stats.femaleRate}% of total`} icon={Users} variant="default" />
          <StatsCard title="Total Programs" value={stats.totalPrograms} description="Active programs" icon={Building} variant="default" />
          <StatsCard title="Students with Disabilities" value={stats.disabilityTotal} description="All students with disabilities" icon={Accessibility} variant="info" />
          <StatsCard title="Active (Disability)" value={stats.disabilityActive} description="Currently active with disability" icon={Zap} variant="success" />
          <StatsCard title="Completed (Disability)" value={stats.disabilityCompleted} description="Completed programs with disability" icon={GraduationCap} variant="info" />
        </div>

        {/* CHART */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Enrollment vs Completion Trends</CardTitle>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-[200px]">
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
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" allowDecimals={false} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Enrolled" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }}>
                    <LabelList dataKey="Enrolled" position="top" offset={10} />
                  </Line>
                  <Line type="monotone" dataKey="Completed" stroke="#22c55e" strokeWidth={2}>
                    <LabelList dataKey="Completed" position="top" offset={10} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* FILTERS */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
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
            <Button variant="ghost" onClick={resetFilters}><RotateCcw className="h-4 w-4 mr-2" /> Reset</Button>
          </div>
        </Card>

        {/* TABLE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExcelExport}><Download className="h-4 w-4 mr-2" /> Excel</Button>
              <Button variant="outline" size="sm" onClick={handleCSVExport}><Download className="h-4 w-4 mr-2" /> CSV</Button>
              <Button variant="outline" size="sm" onClick={handlePDFExport}><FileDown className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Disability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />) : paginatedStudents.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.student_id}</TableCell>
                    <TableCell>{s.full_name}</TableCell>
                    <TableCell>{s.institution_name}</TableCell>
                    <TableCell>{s.program_name}</TableCell>
                    <TableCell>{s.enrollment_year ?? "N/A"}</TableCell>
                    <TableCell>{s.gender ?? "N/A"}</TableCell>
                    <TableCell>{s.disability_type && s.disability_type !== "None" ? s.disability_type : "None"}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(s.status)}>{s.status}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedStudent(s)}>
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