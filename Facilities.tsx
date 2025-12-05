import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Building, Bed, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

import facilityService, { Facility } from "@/services/facilities.services";

// Custom Tooltip for BarChart
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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  const [capacityData, setCapacityData] = useState<{ name: string; Capacity: number; Enrolled: number }[]>([]);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(0);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const data = await facilityService.getFacilities();

        setFacilities(data);

        // Group by facility type for chart
        const grouped: Record<string, { Capacity: number; Enrolled: number }> = {};

        data.forEach(f => {
          if (!grouped[f.facility_type]) grouped[f.facility_type] = { Capacity: 0, Enrolled: 0 };
          grouped[f.facility_type].Capacity += f.capacity;
          grouped[f.facility_type].Enrolled += f.enrolled || 0; // real enrolled
        });

        setCapacityData(Object.entries(grouped).map(([name, val]) => ({ name, ...val })));

        // Compute totals
        const totalCap = data.reduce((sum, f) => sum + f.capacity, 0);
        const totalEnr = data.reduce((sum, f) => sum + (f.enrolled || 0), 0);
        setTotalCapacity(totalCap);
        setTotalEnrolled(totalEnr);

      } catch (error) {
        console.error("Failed to fetch facilities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const utilization = totalCapacity ? (totalEnrolled / totalCapacity) * 100 : 0;

  if (loading) return <DashboardLayout><p>Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <School className="h-7 w-7" />
            Facilities & Capacity
          </h1>
          <p className="text-muted-foreground">Manage infrastructure, capacity, and resource utilization</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Capacity"
            value={totalCapacity.toLocaleString()}
            description="Across all facilities"
            icon={Building}
          />
          <StatsCard
            title="Current Enrollment"
            value={totalEnrolled.toLocaleString()}
            description="Students accommodated"
            icon={Users}
            variant="accent"
          />
          <StatsCard
            title="Total Hostel Beds"
            value={facilities
              .filter(f => f.facility_type === 'Accommodation')
              .reduce((sum, f) => sum + f.capacity, 0)
              .toLocaleString()}
            description="Available student beds"
            icon={Bed}
            variant="info"
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Capacity Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{utilization.toFixed(1)}%</div>
              <Progress value={utilization} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {totalEnrolled.toLocaleString()} / {totalCapacity.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment vs. Capacity by Facility Type</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Capacity" fill="hsl(var(--muted))" />
                  <Bar dataKey="Enrolled" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Facilities Table */}
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
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.facility_type}</TableCell>
                      <TableCell>{f.capacity.toLocaleString()}</TableCell>
                      <TableCell>{(f.enrolled || 0).toLocaleString()}</TableCell>
                      <TableCell>{f.status}</TableCell>
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
