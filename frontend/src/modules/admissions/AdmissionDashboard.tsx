import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  UserPlus,
  UserX,
  CheckCircle,
  Wallet,
  Percent,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Mock Data for Enrollment by Program Category
const enrollmentByProgram = [
  { name: "Education", Enrolled: 18200, Goal: 20000 },
  { name: "Engineering", Enrolled: 27100, Goal: 30000 },
  { name: "Industrial Arts", Enrolled: 14200, Goal: 15000 },
  { name: "Business", Enrolled: 9500, Goal: 10000 },
];

// --- COMPONENT ---
export default function AdmissionsDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-blue-600/90 rounded-lg p-4 sm:p-6 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 sm:h-8 sm:h-8" /> 
            <span className="truncate">Admissions Dashboard</span>
          </h1>
          <p className="text-sm sm:text-lg opacity-90">
            Overview of current enrollment figures, completion rates, and
            financial status.
          </p>
        </div>

        {/* Key Admissions Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="New Enrollments"
            value={28750}
            description="Enrolled this semester"
            icon={UserPlus}
            trend={{ value: 5.4, label: "YoY" }}
            variant="accent"
          />
          <StatsCard
            title="Total Graduates"
            value={18420}
            description="Completed courses"
            icon={CheckCircle}
            trend={{ value: 12.5, label: "YoY" }}
            variant="success"
          />
          <StatsCard
            title="Dropout Rate"
            value="12.7%"
            description="Program dropouts"
            icon={UserX}
            trend={{ value: -1.1, label: "reduction" }}
            variant="destructive"
          />
          <StatsCard
            title="Pending Fees"
            value="ZWL 4.5M"
            description="Outstanding payments"
            icon={Wallet}
            trend={{ value: 0.5, label: "monthly" }}
            variant="info"
          />
        </div>

        {/* Enrollment Chart and Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Enrollment by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-64 sm:h-96 p-2 sm:p-6 pt-0">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentByProgram} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      className="text-muted-foreground"
                      fontSize={10}
                      width={80}
                    />
                    <XAxis type="number" className="text-muted-foreground" fontSize={10} />
                    <Tooltip wrapperStyle={{ fontSize: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar
                      dataKey="Enrolled"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      name="Current"
                      barSize={15}
                    />
                    <Bar
                      dataKey="Goal"
                      fill="hsl(var(--accent))"
                      radius={[0, 4, 4, 0]}
                      name="Target"
                      barSize={15}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
              <StatsCard
                title="Registration"
                value="98.5%"
                description="Fully registered"
                icon={Percent}
                variant="success"
              />
              <StatsCard
                title="ISEOP Students"
                value={1240}
                description="Total enrolled"
                icon={ArrowUpRight}
                variant="default"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
