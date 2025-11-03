import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Building, GraduationCap, UserCheck } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

// --- RECHARTS IMPORTS ---
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
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
  Rectangle
} from "recharts";

// --- DATA FOR CHARTS ---

// Data for EnrollmentChart (from your example)
const enrollmentData = [
  { year: "2019", "Teachers Colleges": 12500, "Polytechnics": 18000, "Industrial Training": 8500 },
  { year: "2020", "Teachers Colleges": 13200, "Polytechnics": 19500, "Industrial Training": 9200 },
  { year: "2021", "Teachers Colleges": 14100, "Polytechnics": 21000, "Industrial Training": 10100 },
  { year: "2022", "Teachers Colleges": 15300, "Polytechnics": 23500, "Industrial Training": 11500 },
  { year: "2023", "Teachers Colleges": 16800, "Polytechnics": 25200, "Industrial Training": 12800 },
  { year: "2024", "Teachers Colleges": 18200, "Polytechnics": 27100, "Industrial Training": 14200 },
];

// Data for DistributionChart (using 2024 numbers)
const distributionData = [
  { name: "Polytechnics", value: 27100 },
  { name: "Teachers Colleges", value: 18200 },
  { name: "Industrial Training", value: 14200 },
];

// Data for RatioChart (example data)
const ratioData = [
  { name: "Harare Poly", ratio: 28 },
  { name: "Mkoba TC", ratio: 22 },
  { name: "Bulawayo ITC", ratio: 15 },
  { name: "Mutare Poly", ratio: 25 },
  { name: "Masvingo Poly", ratio: 26 },
];

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

// --- MAIN STATISTICS PAGE ---

export default function Statistics() {
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
            <p className="text-muted-foreground">
              Overall insights and analytics for all institutions
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Institutions"
            value={78}
            description="All institution types"
            icon={Building}
            variant="default"
          />
          <StatsCard
            title="Total Students (2024)"
            value={59500} // Sum of 2024 data
            description="Currently enrolled"
            icon={Users}
            variant="accent"
          />
          <StatsCard
            title="Total Programs"
            value={420}
            description="Across all institutions"
            icon={GraduationCap}
            variant="info" 
          />
           <StatsCard
            title="Total Staff"
            value={3850}
            description="Lecturing & Admin"
            icon={UserCheck}
            variant="success"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Student Enrollment Trends (Your Component) */}
          <EnrollmentChart />

          {/* Chart 2: Student Distribution by Type (Donut Chart) */}
          <DistributionChart />

          {/* Chart 3: Staff vs. Student Ratio (Bar Chart) */}
           <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Student-Staff Ratio (Example Institutions)</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-80 w-full">
                 <RatioChart />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- CHART COMPONENTS ---

/**
 * Your provided Enrollment Trends Line Chart
 */
export function EnrollmentChart() {
  return (
    <Card className="lg:col-span-1"> {/* Modified this to fit grid */}
      <CardHeader>
        <CardTitle>Enrollment Trends (2019-2024)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Teachers Colleges" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="Polytechnics" 
                stroke="hsl(var(--accent-foreground))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="Industrial Training" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * New Donut Chart for Student Distribution
 */
function DistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Distribution (2024)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Pie
                data={distributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                fill="#8884d8"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * New Bar Chart for Student-Staff Ratios
 */
function RatioChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ratioData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          label={{ value: 'Students per Staff', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="ratio" 
          name="Student-Staff Ratio"
          fill="hsl(var(--primary))" 
          activeBar={<Rectangle fill="hsl(var(--primary-foreground))" />} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}