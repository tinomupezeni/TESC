import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, Users, Beaker } from "lucide-react";
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
  Legend,
  Rectangle
} from "recharts";

// --- MOCK DATA ---
const regionalEnrollmentData = [
  { province: "Harare", Students: 18500 },
  { province: "Bulawayo", Students: 9200 },
  { province: "Midlands", Students: 8800 },
  { province: "Manicaland", Students: 6500 },
  { province: "Masvingo", Students: 5400 },
  { province: "Mash. East", Students: 3100 },
  { province: "Mash. West", Students: 4600 },
  { province: "Mash. Central", Students: 1200 },
  { province: "Mat. North", Students: 900 },
  { province: "Mat. South", Students: 1300 },
];

const regionalStatsData = [
  { id: 1, province: "Harare", institutions: 12, students: 18500, hubs: 5 },
  { id: 2, province: "Bulawayo", institutions: 10, students: 9200, hubs: 4 },
  { id: 3, province: "Midlands", institutions: 11, students: 8800, hubs: 3 },
  { id: 4, province: "Manicaland", institutions: 8, students: 6500, hubs: 2 },
  { id: 5, province: "Masvingo", institutions: 7, students: 5400, hubs: 2 },
  { id: 6, province: "Mash. West", institutions: 6, students: 4600, hubs: 2 },
  // ...other provinces
];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold">{label}</p>
        <p style={{ color: payload[0].fill }}>
          {`${payload[0].name}: ${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

// --- COMPONENT ---
export default function Regional() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-7 w-7" />
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
            value="10"
            description="Presence in all 10 provinces"
            icon={MapPin}
          />
          <StatsCard
            title="Top Province (Enrollment)"
            value="Harare"
            description="18,500 Students"
            icon={Users}
            variant="accent"
          />
          <StatsCard
            title="Top Province (Institutions)"
            value="Harare"
            description="12 Institutions"
            icon={Building}
            variant="info"
          />
          <StatsCard
            title="Top Province (Innovation)"
            value="Harare"
            description="5 Innovation Hubs"
            icon={Beaker}
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalEnrollmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="province" type="category" fontSize={12} stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="Students" 
                    fill="hsl(var(--primary))" 
                    activeBar={<Rectangle fill="hsl(var(--primary-foreground))" />} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Regional Stats Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Statistics by Province</CardTitle>
            </CardHeader>
            <CardContent className="h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Province</TableHead>
                    <TableHead>Institutions</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Hubs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionalStatsData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.province}</TableCell>
                      <TableCell>{item.institutions}</TableCell>
                      <TableCell>{item.students.toLocaleString()}</TableCell>
                      <TableCell>{item.hubs}</TableCell>
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