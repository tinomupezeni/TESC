import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  User,
  Accessibility,
  FileText
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useGraduationStats } from "@/hooks/useGraduation";
import { ReportBuilder } from "@/components/reports";
import { StudentView } from "@/components/student view";
import { Badge } from "@/components/ui/badge";
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
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

const COLORS = ["#0ea5e9", "#f43f5e", "#8b5cf6", "#f59e0b"];

const GRADE_MAP: { [key: string]: { bg: string; text: string; border: string; hex: string } } = {
  Distinction: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#f59e0b' },
  Credit: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hex: '#3b82f6' },
  Pass: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#10b981' },
  Fail: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', hex: '#f43f5e' }
};

const getGradeStyles = (grade: string) => {
  const style = GRADE_MAP[grade];
  return style ? `${style.bg} ${style.text} ${style.border}` : 'bg-slate-50 text-slate-700 border-slate-200';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
      <p className="font-bold border-b mb-1 pb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-mono font-bold">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function Statistics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [instNameFilter, setInstNameFilter] = useState("all");
  const [instTypeFilter, setInstTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  const { data: gradData, loading: gradLoading } = useGraduationStats();

  const graduatesOnly = useMemo(() => {
    if (!gradData) return [];
    return gradData.filter(student => student.status === "Graduated");
  }, [gradData]);

  const filterOptions = useMemo(() => {
    return {
      years: Array.from(new Set(graduatesOnly.map(d => d.graduation_year?.toString()))).filter(Boolean).sort().reverse(),
      genders: Array.from(new Set(graduatesOnly.map(d => d.gender))).filter(Boolean),
      institutions: Array.from(new Set(graduatesOnly.map(d => d.institution_name))).filter(Boolean).sort(),
      types: Array.from(new Set(graduatesOnly.map(d => d.type))).filter(Boolean).sort(),
      // FIX: standardized to program_category
      categories: Array.from(new Set(graduatesOnly.map(d => d.program_category))).filter(Boolean).sort(),
    };
  }, [graduatesOnly]);

  const resetFilters = () => {
    setSearchTerm("");
    setYearFilter("all");
    setGenderFilter("all");
    setInstNameFilter("all");
    setInstTypeFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return graduatesOnly.filter(item => {
      const name = item.full_name || `${item.first_name} ${item.last_name}`;
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.student_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === "all" || item.graduation_year?.toString() === yearFilter;
      const matchesGender = genderFilter === "all" || item.gender === genderFilter;
      const matchesInst = instNameFilter === "all" || item.institution_name === instNameFilter;
      const matchesType = instTypeFilter === "all" || item.type === instTypeFilter;
      // FIX: standardized to program_category
      const matchesCategory = categoryFilter === "all" || item.program_category === categoryFilter;

      return matchesSearch && matchesYear && matchesGender && matchesInst && matchesType && matchesCategory;
    });
  }, [graduatesOnly, searchTerm, yearFilter, genderFilter, instNameFilter, instTypeFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totals = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => ({
      total: acc.total + 1,
      male: acc.male + (curr.gender === 'Male' ? 1 : 0),
      female: acc.female + (curr.gender === 'Female' ? 1 : 0),
      distinctions: acc.distinctions + (curr.final_grade === 'Distinction' ? 1 : 0),
      disabilities: acc.disabilities + (curr.disability_type && curr.disability_type !== 'None' ? 1 : 0)

    }), { total: 0, male: 0, female: 0, distinctions: 0, disabilities: 0 });

    const disabilityPerc = counts.total > 0
      ? ((counts.disabilities / counts.total) * 100).toFixed(1)
      : "0";

    return { ...counts, disabilityPerc };
  }, [filteredData]);

  const exportData = (type: 'csv' | 'excel') => {
    const headers = ["ID", "Name", "Program", 'Program Category', "Institution", "Type", "Year", "Grade", "Disabilities", "Gender"];
    const rows = filteredData.map(d => [
      d.student_id,
      d.full_name || `${d.first_name} ${d.last_name}`,
      d.program_name || 'N/A', // Corrected key
      d.program_category || 'N/A', // Corrected key
      d.institution_name,
      d.type,
      d.graduation_year,
      d.final_grade,
      d.disabilities,
      d.gender
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
    link.download = `Graduation_Report.${fileExtension}`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              Graduation Analytics
            </h1>
          </div>
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

        {/* Filters Section */}
        <Card className="p-4 border-blue-100 dark:border-slate-800 print:hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <Select value={instNameFilter} onValueChange={(v) => { setInstNameFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {filterOptions.institutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={instTypeFilter} onValueChange={(v) => { setInstTypeFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Inst. Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filterOptions.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterOptions.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {filterOptions.years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                {filterOptions.genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={resetFilters} className="text-slate-500 font-bold hover:text-blue-600">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </Card>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Graduates" value={totals.total} icon={Users} variant="default" />
          <StatsCard title="Male Graduates" value={totals.male} icon={User} variant="default" />
          <StatsCard title="Female Graduates" value={totals.female} icon={User} variant="accent" />
          <StatsCard
            title="Graduates with Disabilities"
            value={totals.disabilities}
            description={`${totals.disabilityPerc}% of total`}
            icon={Accessibility}
            variant="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="print:break-inside-avoid border-blue-50/50">
            <CardHeader><CardTitle className="text-lg font-bold">Gender Distribution (%)</CardTitle></CardHeader>
            <CardContent>
              <GenderDistributionChart data={filteredData} />
            </CardContent>
          </Card>
          <Card className="print:break-inside-avoid border-blue-50/50">
            <CardHeader><CardTitle className="text-lg font-bold">Program Performance (by Grade %)</CardTitle></CardHeader>
            <CardContent>
              <ProgramPerformanceChart data={filteredData} />
            </CardContent>
          </Card>
        </div>

        <Card className="print:shadow-none print:border-none shadow-sm border-blue-50">
          <CardContent className="pt-6">
            <div className="rounded-md border border-blue-100 dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                    <TableHead className="font-bold">Student ID</TableHead>
                    <TableHead className="font-bold">Full Name</TableHead>
                    <TableHead className="font-bold">Institution</TableHead>
                    <TableHead className="font-bold">Program</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="text-center font-bold">Year</TableHead>
                    <TableHead className="font-bold">Grade</TableHead>
                    <TableHead className="text-right print:hidden font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-10 animate-pulse font-bold text-blue-600">Loading graduates...</TableCell></TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No graduated records found matching filters.</TableCell></TableRow>
                  ) : (
                    paginatedData.map((grad) => (
                      <TableRow key={grad.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-medium font-mono text-xs text-blue-700 dark:text-blue-400">{grad.student_id}</TableCell>
                        <TableCell className="font-bold text-slate-900 dark:text-slate-100">{grad.full_name || `${grad.first_name} ${grad.last_name}`}</TableCell>
                        <TableCell className="text-xs font-medium">{grad.institution_name}</TableCell>
                        <TableCell className="text-xs font-medium">{grad.program_name || 'N/A'}</TableCell>
                        <TableCell className="text-xs font-medium">{grad.program_category || 'N/A'}</TableCell>
                        <TableCell className="text-center font-bold">{grad.graduation_year}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-bold ${getGradeStyles(grad.final_grade)}`}>
                            {grad.final_grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                          <Button variant="ghost" size="sm" className="font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setSelectedStudent(grad)}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <StudentView data={selectedStudent} setdata={setSelectedStudent} />

            <div className="flex items-center justify-between space-x-2 py-4 print:hidden">
              <div className="text-sm text-muted-foreground font-medium">
                Showing <strong>{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of {filteredData.length} graduates
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-blue-200"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-blue-200"
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

      {/* Report Builder Dialog */}
      <ReportBuilder
        reportType="graduates"
        open={reportBuilderOpen}
        onOpenChange={setReportBuilderOpen}
      />
    </DashboardLayout>
  );
}

// --- Chart Components ---
function GenderDistributionChart({ data }: { data: any[] }) {
  const chartData = useMemo(() => {
    const total = data.length;
    const counts = data.reduce((acc: any, curr) => {
      const g = curr.gender || "Other";
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]: [string, any]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1)
    }));
  }, [data]);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProgramPerformanceChart({ data }: { data: any[] }) {
  const { chartData, availableGrades } = useMemo(() => {
    const gradesSet = new Set<string>();

    const map = data.reduce((acc: any, curr) => {
      // FIX: Standardized key to curr.program_name
      const n = curr.program_name || "Unknown Program";
      const grade = curr.final_grade;

      if (!acc[n]) acc[n] = { name: n, total: 0 };
      if (grade) {
        acc[n][grade] = (acc[n][grade] || 0) + 1;
        acc[n].total += 1;
        gradesSet.add(grade);
      }
      return acc;
    }, {});

    const sortedData = Object.values(map)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 6)
      .map((item: any) => {
        const percentified = { ...item };
        Array.from(gradesSet).forEach(grade => {
          if (item[grade]) {
            percentified[`${grade}_perc`] = ((item[grade] / item.total) * 100).toFixed(0) + '%';
          }
        });
        return percentified;
      });

    return {
      chartData: sortedData,
      availableGrades: Array.from(gradesSet).sort()
    };
  }, [data]);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={120} fontSize={10} fontWeight="bold" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {availableGrades.map((grade) => (
            <Bar
              key={grade}
              dataKey={grade}
              stackId="a"
              fill={GRADE_MAP[grade]?.hex || "#94a3b8"}
              radius={[2, 2, 2, 2]}
            >
              <LabelList
                dataKey={`${grade}_perc`}
                position="center"
                style={{ fill: '#fff', fontSize: '10px', fontWeight: 'bold' }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}