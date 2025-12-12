import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Handshake, Rocket, DollarSign } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// --- MOCK DATA ---
const startupData = [
  { name: "AgriTech", value: 25 },
  { name: "EdTech", value: 15 },
  { name: "FinTech", value: 10 },
  { name: "Manufacturing", value: 8 },
  { name: "Other", value: 7 },
];

const partnershipData = [
  { id: "P001", name: "Econet Wireless", focus: "FinTech & Telecoms", status: "Active" },
  { id: "P002", name: "Zimplats", focus: "Engineering & Mining", status: "Active" },
  { id: "P003", name: "Delta Corporation", focus: "Food Science", status: "Active" },
  { id: "P004", name: "CBZ Holdings", focus: "FinTech Incubation", status: "New" },
  { id: "P005", name: "SeedCo", focus: "AgriTech Research", status: "Active" },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent-foreground))", "hsl(var(--success))", "hsl(var(--info))", "hsl(var(--muted-foreground))"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// --- COMPONENT ---
export default function Industrialisation() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Factory className="h-7 w-7" />
            Industrialisation
          </h1>
          <p className="text-muted-foreground">
            Monitor industry linkages, startups, and commercialization
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Commercialized Products"
            value="85"
            description="Innovations now on the market"
            icon={DollarSign}
            variant="success"
          />
          <StatsCard
            title="Industry Partnerships"
            value="210"
            description="MOUs and active projects"
            icon={Handshake}
            variant="info"
          />
          <StatsCard
            title="Student Startups"
            value="65"
            description="Launched from innovation hubs"
            icon={Rocket}
            variant="accent"
          />
          <StatsCard
            title="Revenue Generated"
            value="$4.5M"
            description="From licenses & products"
            icon={DollarSign}
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Startup Sectors Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Student Startup Sectors</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Pie
                    data={startupData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                  >
                    {startupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Industry Partners Table */}
          <Card>
            <CardHeader>
              <CardTitle>Key Industry Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Focus Area</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnershipData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.focus}</TableCell>
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