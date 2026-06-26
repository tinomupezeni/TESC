import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Building, Bed, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useStatistics } from "@/hooks/useStatistics";
import { useFacilities, Facility } from "@/hooks/useFacilities";
import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// Custom tooltip for chart
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

export default function Facilities() {
  const { data: statsData, loading: statsLoading } = useStatistics();
  const {
    data: facilities,
    loading: facilitiesLoading,
    error,
  } = useFacilities();

  if (error) return <div>Error loading facilities: {error}</div>;

  // Calculate total capacity and enrollment for utilization
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalCurrentUsage = facilities.reduce(
    (sum, f) => sum + (f.current_usage || 0),
    0
  );
  const utilization =
    totalCapacity > 0 ? (totalCurrentUsage / totalCapacity) * 100 : 0;

  // Prepare data for chart: group by facility type
  const chartData = facilities.reduce<{
    [key: string]: { name: string; capacity: number; usage: number };
  }>((acc, f) => {
    const key = f.facility_type;
    if (!acc[key]) {
      acc[key] = { name: key, capacity: 0, usage: 0 };
    }
    acc[key].capacity += f.capacity;

    acc[key].usage += f.current_usage || 0;
    return acc;
  }, {});

  const capacityData = Object.values(chartData);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <School className="h-6 w-6 sm:h-7 sm:h-7" />
            Facilities & Capacity
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage infrastructure, capacity, and resource utilization
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Capacity"
            value={totalCapacity.toLocaleString()}
            description="Student accommodation & learning"
            icon={Building}
          />
          <StatsCard
            title="Current Usage"
            value={totalCurrentUsage.toLocaleString()}
            description="Students currently using facilities"
            icon={Users}
            variant="accent"
          />

        
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Capacity Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold mb-2">
                {utilization.toFixed(1)}%
              </div>
              <Progress value={utilization} className="h-2" />
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                {totalCurrentUsage.toLocaleString()} /{" "}
                {totalCapacity.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment vs Capacity Chart */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Capacity vs. Current Usage by Facility Type</CardTitle>
            </CardHeader>
            <CardContent className="h-64 sm:h-80 p-2 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="capacity" fill="hsl(var(--accent))" />
                  <Bar
                    dataKey="usage"
                    fill="hsl(var(--primary))"
                    name="Current Usage"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Major Facilities Table */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Major Facilities Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Capacity</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilitiesLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : facilities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No facilities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    facilities.map((f: Facility) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{f.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">{f.facility_type}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">{f.capacity.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">
                          {f.current_usage.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {f.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
