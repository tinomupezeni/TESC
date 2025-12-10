import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, FileText, Factory, Globe, Zap } from "lucide-react";
import { StatsCard } from "../components/dashboard/StatsCard";

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
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import { useInnovationData } from "@/hooks/useInnovationData";

// ------------------- Tooltip -------------------
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

// ------------------- Stage Pipeline Component -------------------
function InnovationStageFlow({ data }: { data: any[] }) {
    const TOTAL = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Innovation Project Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item) => (
                        <div key={item.stage} className="flex items-center space-x-4">
                            <span className="w-32 text-sm font-medium text-muted-foreground">
                                {item.stage}
                            </span>

                            <div className="flex-grow bg-muted rounded-full h-3 relative">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(item.count / TOTAL) * 100}%`,
                                        backgroundColor: item.color || "hsl(var(--primary))",
                                    }}
                                />
                            </div>

                            <span
                                className="w-10 text-right font-bold"
                                style={{ color: item.color }}
                            >
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ------------------- MAIN PAGE -------------------
export default function InnovationOverview() {
    const { loading, patentData, innovationProjects, stageFlowData } = useInnovationData();

    if (loading) return <DashboardLayout>Loading...</DashboardLayout>;

    const totalProjects = stageFlowData.reduce((s, i) => s + i.count, 0);

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
                        Track progress of projects across research, prototype, and commercialisation phases.
                    </p>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Projects in Pipeline"
                        value={totalProjects.toString()}
                        description="Total active innovation projects"
                        icon={Zap}
                        variant="accent"
                    />

                    <StatsCard
                        title="Patents Filed (This Year)"
                        value={patentData[patentData.length - 1]?.count || 0}
                        description="Latest recorded patent count"
                        icon={FileText}
                        variant="success"
                    />

                    <StatsCard
                        title="Industrialised Projects"
                        value={
                            stageFlowData.find((s) => s.stage.toLowerCase() === "industrialisation")
                                ?.count || 0
                        }
                        description="Projects past prototype"
                        icon={Factory}
                        variant="info"
                    />

                    <StatsCard
                        title="Innovation Hubs"
                        value="22"
                        description="From institutions data (static placeholder)"
                        icon={Globe}
                    />
                </div>

                {/* Charts & Stage Pipeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InnovationStageFlow data={stageFlowData} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Patents Filed Per Year</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={patentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Patents"
                                        stroke="hsl(var(--success))"
                                        strokeWidth={2}
                                        dot={{ fill: "hsl(var(--success))" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Projects Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Project Tracking</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            All innovation projects fetched from backend.
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
                                {innovationProjects.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.institution}</TableCell>
                                        <TableCell>{item.stage}</TableCell>
                                        <TableCell>{item.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
