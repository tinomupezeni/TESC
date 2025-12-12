// frontend/src/pages/Statistics.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Building, GraduationCap, UserCheck } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "react-router-dom";
import { useInstitutionData } from "@/hooks/useInstitutionData";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent-foreground))", "hsl(var(--success))"];

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Statistics() {
  const { institutions, totalEnrolled, capacityData, isLoading } = useInstitutionData();

  // Totals
  const totalInstitutions = institutions.length;
  const totalStudents = totalEnrolled;
  const totalPrograms = institutions.reduce((sum, inst) => sum + (inst.program_count || 0), 0);
  const totalStaff = institutions.reduce((sum, inst) => sum + (inst.staff || 0), 0);

  // Pie chart for distribution by type
  const distributionData = institutions.reduce(
    (acc: { name: string; value: number }[], inst) => {
      const typeEntry = acc.find((e) => e.name === inst.type);
      if (typeEntry) typeEntry.value += inst.students_count || 0;
      else acc.push({ name: inst.type, value: inst.students_count || 0 });
      return acc;
    },
    []
  );

  // Bar chart for student-staff ratio
  const ratioData = institutions.map((inst) => ({
    name: inst.name,
    ratio: inst.staff ? (inst.students_count || 0) / inst.staff : 0,
  }));

  if (isLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              TESC Statistics
            </h1>
            <p className="text-muted-foreground">Overall insights and analytics for all institutions</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/institutions" className="cursor-pointer hover:opacity-90">
            <StatsCard title="Total Institutions" value={totalInstitutions} description="All institution types" icon={Building} />
          </Link>

          <Link to="/students" className="cursor-pointer hover:opacity-90">
            <StatsCard title="Total Students" value={totalStudents} description="Currently enrolled" icon={Users} variant="accent" />
          </Link>

          <Link to="" className="cursor-pointer hover:opacity-90">
            <StatsCard title="Total Programs" value={totalPrograms} description="Across all institutions" icon={GraduationCap} variant="info" />
          </Link>

          {/* Staff Quick Action */}
          <Card className="cursor-pointer hover:opacity-90 col-span-1">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-green-500" />
                  <h2 className="text-lg font-bold">Total Staff: {totalStaff}</h2>
                </div>
                <span className="text-sm text-muted-foreground">{totalPrograms} Programs</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
              {institutions.map(
                (inst) =>
                  inst.programs?.length > 0 && (
                    <div key={inst.id} className="border-b border-muted pb-1">
                      <h3 className="font-semibold">{inst.name}</h3>
                      <ul className="pl-4 list-disc text-sm text-muted-foreground">
                        {inst.programs.map((prog: any) => (
                          <li key={prog.id}>{prog.name}</li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment per Institution */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment per Institution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Enrolled" fill="hsl(var(--primary))" />
                  <Bar dataKey="Capacity" fill="hsl(var(--muted))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Student Distribution by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Student Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Student-Staff Ratio */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Student-Staff Ratio</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratioData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ratio" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}