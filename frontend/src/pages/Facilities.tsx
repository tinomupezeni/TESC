// frontend/src/pages/Facilities.tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Building, Bed, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Rectangle } from "recharts";
import { useInstitutionData } from "@/hooks/useInstitutionData";

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
  const {
    facilities,
    totalCapacity,
    totalEnrolled,
    totalHostelBeds,
    utilization,
    capacityData,
    isLoading,
  } = useInstitutionData();

  if (isLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <School className="h-7 w-7" />
            Facilities & Capacity
          </h1>
          <p className="text-muted-foreground">
            Manage infrastructure, capacity, and resource utilization
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Capacity" value={totalCapacity.toLocaleString()} description="Student accommodation & learning" icon={Building} />
          <StatsCard title="Current Enrollment" value={totalEnrolled.toLocaleString()} description="Across all institutions" icon={Users} variant="accent" />
          <StatsCard title="Total Hostel Beds" value={totalHostelBeds.toLocaleString()} description="Available student beds" icon={Bed} variant="info" />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Capacity Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{utilization.toFixed(1)}%</div>
              <Progress value={utilization} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{totalEnrolled.toLocaleString()} / {totalCapacity.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment vs. Capacity by Type</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Capacity" fill="hsl(var(--muted))" activeBar={<Rectangle fill="hsl(var(--muted-foreground))" />} />
                  <Bar dataKey="Enrolled" fill="hsl(var(--primary))" activeBar={<Rectangle fill="hsl(var(--primary-foreground))" />} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Major Facilities Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map((facility) => (
                    <TableRow key={facility.id}>
                      <TableCell className="font-medium">{facility.name}</TableCell>
                      <TableCell>{facility.type}</TableCell>
                      <TableCell>{facility.capacity.toLocaleString()}</TableCell>
                      <TableCell>{facility.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}