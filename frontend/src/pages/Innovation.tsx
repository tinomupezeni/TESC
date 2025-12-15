import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, FileText, Beaker, Zap, Users, Factory, Globe } from "lucide-react";
import { StatsCard } from "../components/dashboard/StatsCard";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
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
import { useInnovationStats } from "@/hooks/useInnovationStats";
import { useDetailedInnovations } from "@/hooks/useDetailedInnovations";

// --- MOCK DATA ---
const patentData = [
    { year: "2019", Patents: 5 },
    { year: "2020", Patents: 8 },
    { year: "2021", Patents: 14 },
    { year: "2022", Patents: 22 },
    { year: "2023", Patents: 35 },
    { year: "2024", Patents: 45 },
];

const STAGE_COLORS = [
  "#4ade80", "#60a5fa", "#facc15", "#f97316", "#a78bfa", "#f472b6", "#22d3ee"
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
                <p className="font-bold">{label}</p>
                <p style={{ color: payload[0].stroke || payload[0].fill }}>
                    {`${payload[0].name}: ${payload[0].value.toLocaleString()}`}
                </p>
            </div>
        );
    }
    return null;
};

interface StageData {
  stage: string;
  count: number;
  color: string;
}

function InnovationStageFlow() {
  const { data, loading, error } = useInnovationStats();

  if (loading) return <div>Loading...</div>;
  if (error || !data) return <div>Error loading data</div>;

  const stageKeys = Object.keys(data).filter(
    (key) => !["total_innovations", "innovation_hubs", "active_institutions"].includes(key)
  );

  const stageFlowData: StageData[] = stageKeys.map((key, idx) => ({
    stage: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    count: data[key as keyof typeof data] as number,
    color: STAGE_COLORS[idx % STAGE_COLORS.length],
  }));

  if (!stageFlowData.find((s) => s.stage === "Commercialized")) {
    stageFlowData.push({
      stage: "Commercialized",
      count: 0,
      color: STAGE_COLORS[stageFlowData.length % STAGE_COLORS.length],
    });
  }

  const totalInnovations = data.total_innovations || 1;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Innovation Project Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stageFlowData.map((item) => (
            <div key={item.stage} className="flex items-center space-x-4">
              <span className="w-24 text-sm font-medium text-muted-foreground">{item.stage}</span>
              <div className="flex-grow bg-muted rounded-full h-3 relative">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: item.count > 0 ? `${(item.count / totalInnovations) * 100}%` : "0%",
                    backgroundColor: item.count > 0 ? item.color : "transparent",
                  }}
                />
              </div>
              <span className="w-10 text-right font-bold" style={{ color: item.color }}>
                {item.count > 0 ? item.count : "-"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function InnovationDashboard() {
    const { data: innovationData, loading, error } = useDetailedInnovations();
    const { data: statsData, loading: statsLoading, error: statsError } = useInnovationStats();

    if (loading || statsLoading) return <DashboardLayout><div className="p-6">Loading...</div></DashboardLayout>;
    if (error || statsError) return <DashboardLayout><div className="p-6 text-red-600">Failed to load data</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="pb-2 border-b">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Lightbulb className="h-7 w-7 text-accent" />
                        Innovation Lifecycle Management
                    </h1>
                    <p className="text-muted-foreground">
                        Track progress of all projects across the Ideation, Prototyping, and Commercialisation phases.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Projects in Pipeline" value={String(statsData?.total_innovations ?? 0)} description="Total active projects" icon={Zap} variant="accent" />
                    <StatsCard title="Patents Filed (2024)" value="45" description="+10 from 2023" icon={FileText} variant="success" />
                    <StatsCard title="Industrialised Projects" value={String(statsData?.industrialization ?? 0)} description="Moved past prototype stage" icon={Factory} variant="success" />
                    <StatsCard title="Innovation Hubs" value={String(statsData?.innovation_hubs ?? 0)} description="Across all institutions" icon={Globe} />
                </div>

                {/* Charts and Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InnovationStageFlow />
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
                                    <Line type="monotone" dataKey="Patents" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: "hsl(var(--success))" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Active Innovations Table */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Project Tracking</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                List of all active projects across the TESC ecosystem.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Stage</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {innovationData?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.id}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.institution}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full 
                                                        ${item.stage === "Market Ready"
                                                            ? "bg-green-100 text-green-700"
                                                            : item.stage === "Industrialisation"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : item.stage === "Prototyping"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {item.stage}
                                                </span>
                                            </TableCell>
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
