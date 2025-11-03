import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, FileText, Beaker, Zap, Users } from "lucide-react";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// --- MOCK DATA ---
const patentData = [
  { year: "2019", Patents: 5 },
  { year: "2020", Patents: 8 },
  { year: "2021", Patents: 14 },
  { year: "2022", Patents: 22 },
  { year: "2023", Patents: 35 },
  { year: "2024", Patents: 45 },
];

const innovationData = [
  { id: "IN001", name: "Solar-Powered Water Purifier", institution: "Harare Poly", status: "Patented" },
  { id: "IN002", name: "Low-Cost Ventilator", institution: "Mutare Poly", status: "Commercialized" },
  { id: "IN003", name: "EdTech Learning Platform", institution: "Mkoba TC", status: "Prototyping" },
  { id: "IN004", name: "Drought-Resistant Maize AI", institution: "Chinhoyi Poly", status: "Research" },
  { id: "IN005", name: "Artisan Skills Portal", institution: "Bulawayo ITC", status: "Launched" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold">{label}</p>
        <p style={{ color: payload[0].stroke }}>
          {`${payload[0].name}: ${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

// --- COMPONENT ---
export default function Innovation() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-7 w-7" />
            Innovation Department
          </h1>
          <p className="text-muted-foreground">
            Track research, development, and innovation hubs
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Innovations"
            value="150"
            description="Projects currently in development"
            icon={Zap}
            variant="accent"
          />
          <StatsCard
            title="Patents Filed (2024)"
            value="45"
            description="+10 from 2023"
            icon={FileText}
            variant="success"
          />
          <StatsCard
            title="Innovation Hubs"
            value="22"
            description="Across all institutions"
            icon={Beaker}
            variant="info"
          />
          <StatsCard
            title="Research Grants"
            value="$1.2M"
            description="Total funding acquired"
            icon={Users}
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patents Filed Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Patents Filed Per Year</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Patents"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--success))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Innovations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Innovations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {innovationData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.institution}</TableCell>
                      <TableCell>{item.status}</TableCell>
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