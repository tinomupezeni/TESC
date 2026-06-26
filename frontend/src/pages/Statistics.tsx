import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Building, GraduationCap, UserCheck } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useStatistics } from "@/hooks/useStatistics";
import { useStudentDistribution } from "@/hooks/useStudentDistribution";
import { useStudentTeacherRatio } from "@/hooks/useRatios";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { InstitutionOverview } from "@/components/dashboard/InstitutionOverview";
import { useNavigate } from "react-router-dom";

// RECHARTS
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
} from "recharts";

// ----- BAR CHART COLORS (Denim, Cornflower, Powder, Carolina, Glacier, Iceberg) -----
const BAR_COLORS = [
  "#1565C0", // Denim (dark blue)
  "#6495ED", // Cornflower (medium blue)
  "#B0E0E6", // Powder (light blue)
  "#4A8FE4", // Carolina (bright blue)
  "#B6D4E7", // Glacier (pale ice blue)
  "#71A6D2", // Iceberg (soft blue)
];

// ----- PIE CHART COLORS (using your existing theme colours) -----
const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--success))",
];

// ----- CUSTOM TOOLTIP -----
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
      <p className="font-bold">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

// ----- REUSABLE BAR CHART (optional – you can use it elsewhere) -----
export function MyBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ----- MAIN STATISTICS PAGE -----
export default function Statistics() {
  const { data, loading, error } = useStatistics();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />
              TESC STATISTICS
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Overall insights and analytics for all institutions
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        {loading && <p className="text-muted-foreground">Loading statistics…</p>}
        {error && <p className="text-red-500">Failed to load statistics.</p>}

        {!loading && data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="TOTAL INSTITUTIONS"
              value={data.total_institutions ?? 0}
              description="All types"
              icon={Building}
              variant="default"
              onClick={() => navigate("/institutions")}
            />

            <StatsCard
              title="TOTAL STUDENTS"
              value={data.total_students ?? 0}
              description="Enrolled"
              icon={Users}
              variant="default"
              onClick={() => navigate("/students")}
            />

            <StatsCard
              title="TOTAL PROGRAMS"
              value={data.total_programs ?? 0}
              description="Active"
              icon={GraduationCap}
              variant="default"
              onClick={() => navigate("/programs")}
            />

            <StatsCard
              title="TOTAL STAFF"
              value={data.total_staff ?? 0}
              description="Personnel"
              icon={UserCheck}
              variant="default"
              onClick={() => navigate("/staff")}
            />
          </div>
        )}

        {!loading && !data && !error && (
          <p className="text-muted-foreground">No statistics available.</p>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnrollmentChart />
          <InstitutionOverview />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Student Distribution by Institution Type</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <StudentDistributionChart />
            </CardContent>
          </Card>
          {/* You can add another chart here if needed */}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ----- STUDENT DISTRIBUTION PIE CHART -----
export function StudentDistributionChart() {
  const { data, loading, error } = useStudentDistribution();

  if (loading) return <p>Loading student distribution…</p>;
  if (error) return <p>Failed to load distribution.</p>;
  if (!data) return <p>No data available.</p>;

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}