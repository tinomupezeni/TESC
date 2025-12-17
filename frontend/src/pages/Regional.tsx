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
import { getRegionalStats } from "@/services/analysis.services";

// --- Interfaces ---

export interface ProvinceStat {
  province_name: string;
  total_enrollment: number;
  total_institutions: number;
}

export interface RegionalStats {
  stats: {
    provinces_covered: number;
    top_enrollment: string;
    total_enrollment: number;
    provinces: ProvinceStat[]; 
  };
  chart_data: Array<{
    province: string;
    students: number;
    institutions: number;
    hubs: number;
  }>;
}

// --- Helper Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold text-sm mb-1">{label}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.fill }} className="text-xs font-medium">
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Main Component ---

export default function Regional() {
  const [data, setData] = useState<RegionalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getRegionalStats();
        console.log("Regional Data Received:", response);
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
        {/* 1. Header Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary" />
            Regional Analysis
          </h1>
          <p className="text-muted-foreground">
            Institutional footprint and student distribution by province.
          </p>
        </div>

        {/* 2. Key Metrics Grid (Dynamically generates cards for Harare, Mutare, etc.) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Provinces Covered"
            value={stats.provinces_covered}
            description="Active regions"
            icon={MapPin}
          />
          <StatsCard
            title="Top Province"
            value={stats.top_enrollment}
            description={`${stats.total_enrollment.toLocaleString()} total students`}
            icon={Users}
            variant="accent"
          />
    
          {/* This part creates a card for EACH province found in the data */}
          {stats.provinces?.map((province) => (
            <StatsCard
              key={province.province_name}
              title={`${province.province_name} Institutions`}
              value={province.total_institutions}
              description={`${province.total_enrollment.toLocaleString()} total students`}
              icon={Building}
              variant="info"
            />
          ))}

          <StatsCard
            title="Innovation Hubs"
            value={chart_data?.reduce((acc, curr) => acc + curr.hubs, 0) || 0}
            description="Active research centers"
            icon={Beaker}
            variant="success"
          />
        </div>

        {/* 3. Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Enrollment Bar Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Student Enrollment by Province</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[450px] w-full">
              {chart_data && chart_data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={chart_data} 
                    layout="vertical" 
                    margin={{ left: 30, right: 30, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis 
                      dataKey="province" 
                      type="category" 
                      fontSize={12} 
                      stroke="hsl(var(--muted-foreground))" 
                      width={120}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar 
                      dataKey="students" 
                      name="Students"
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <p>No regional data found.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Statistics Table (The fix you requested is here) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] overflow-y-auto p-0">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Province</TableHead>
                    <TableHead className="text-center">Inst.</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-center">Hubs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* DYNAMIC TABLE ROWS START HERE */}
                  {chart_data?.map((item) => (
                    <TableRow key={item.province} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-xs py-3">{item.province}</TableCell>
                      <TableCell className="text-center">{item.institutions}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {item.students.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] ${item.hubs > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.hubs}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* DYNAMIC TABLE ROWS END HERE */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}