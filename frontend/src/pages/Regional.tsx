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
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary" />
            Regional Analysis
          </h1>
          <p className="text-muted-foreground">Dynamic institutional footprint by location</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Provinces Covered" value={stats.provinces_covered} description="Active regions" icon={MapPin} />
          <StatsCard title="Top Location" value={stats.top_enrollment} description="Highest enrollment" icon={Users} variant="accent" />
          <StatsCard title="Total Institutions" value={stats.total_institutions} description="Registered" icon={Building} variant="info" />
          <StatsCard title="Innovation Hubs" value={chart_data.reduce((acc, curr) => acc + curr.hubs, 0)} description="Active centers" icon={Beaker} variant="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Enrollment by Location</CardTitle></CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart_data} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="location" type="category" fontSize={11} width={100} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="students" name="Students" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Statistics by Location</CardTitle></CardHeader>
            <CardContent className="h-96 overflow-y-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-center">Hubs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chart_data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-xs">
                        {/* Dynamic location from DB - Brackets removed */}
                        {item.location}
                      </TableCell>
                      <TableCell className="text-xs italic text-muted-foreground">
                        {item.institution_name}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {item.students.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center text-xs">{item.hubs}</TableCell>
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