import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, Users, Beaker, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Rectangle
} from "recharts";
import { getRegionalStats, RegionalStats } from "@/services/analysis.services";

// Custom Tooltip for Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold text-sm">{label}</p>
        <p style={{ color: payload[0].fill }} className="text-xs">
          {`${payload[0].name}: ${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function Regional() {
  const [data, setData] = useState<RegionalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getRegionalStats();
        setData(response);
      } catch (error) {
        console.error("Failed to fetch regional stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { stats, chart_data } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary" />
            Regional Analysis
          </h1>
          <p className="text-muted-foreground">
            Analyze institutional footprint and impact by province
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Provinces Covered"
            value={stats.provinces_covered}
            description="Active regions"
            icon={MapPin}
          />
          <StatsCard
            title="Top Province (Enrollment)"
            value={stats.top_enrollment}
            description={`${stats.total_enrollment.toLocaleString()} Total Students`}
            icon={Users}
            variant="accent"
          />
          <StatsCard
            title="Total Institutions"
            value={stats.total_institutions}
            description="Across all provinces"
            icon={Building}
            variant="info"
          />
          {/* Mocking Innovation metric until backend logic is finalized */}
          <StatsCard
            title="Innovation Hubs"
            value={chart_data.reduce((acc, curr) => acc + curr.hubs, 0)}
            description="Active research centers"
            icon={Beaker}
            variant="success"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Enrollment by Province Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Student Enrollment by Province</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              {chart_data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart_data} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis 
                      dataKey="province" 
                      type="category" 
                      fontSize={11} 
                      stroke="hsl(var(--muted-foreground))" 
                      width={100} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar 
                      dataKey="students" 
                      name="Students"
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                      activeBar={<Rectangle fill="hsl(var(--primary))" stroke="hsl(var(--background))" />} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No regional data available.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regional Stats Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Statistics by Province</CardTitle>
            </CardHeader>
            <CardContent className="h-96 overflow-y-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Province</TableHead>
                    <TableHead className="text-center">Inst.</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-center">Hubs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chart_data.map((item) => (
                    <TableRow key={item.province}>
                      <TableCell className="font-medium text-xs">{item.province}</TableCell>
                      <TableCell className="text-center">{item.institutions}</TableCell>
                      <TableCell className="text-right">{item.students.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{item.hubs}</TableCell>
                    </TableRow>
                  ))}
                  {chart_data.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No data found</TableCell>
                    </TableRow>
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