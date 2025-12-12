import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, FileText, Factory, Globe, Zap, Loader2, FolderOpen } from "lucide-react";
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
import { getInnovationOverview } from "@/services/analysis.services";

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

// Sub-component for Pipeline
function InnovationStageFlow({ data, total }: { data: any[], total: number }) {
    const order = ['Ideation', 'Research', 'Prototype', 'Incubation', 'Industrialization', 'Commercialized'];
    const sortedData = data ? data.sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage)) : [];
    const hasData = sortedData.length > 0;

    return (
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Innovation Project Pipeline</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {hasData ? (
                        sortedData.map((item) => (
                            <div key={item.stage} className="flex items-center space-x-4">
                                <span className="w-32 text-sm font-medium text-muted-foreground">{item.stage}</span>
                                <div className="flex-grow bg-muted rounded-full h-3 relative overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-500" 
                                        style={{ 
                                            width: `${(item.count / (total || 1)) * 100}%`, 
                                            backgroundColor: item.color 
                                        }} 
                                    />
                                </div>
                                <span className="w-10 text-right font-bold" style={{ color: item.color }}>{item.count}</span>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No active projects in the pipeline.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function InnovationOverview() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getInnovationOverview()
            .then(setData)
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
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

    // Safe Data Access
    const stats = data?.stats || {};
    const pipeline = data?.pipeline || [];
    const projects = data?.projects || [];
    const patentTrend = data?.patent_trend || [];
    
    // Check if trends actually have data (non-zero)
    const hasTrendData = patentTrend.some((p: any) => p.Patents > 0);

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
                    <StatsCard
                        title="Projects in Pipeline"
                        value={stats.total_projects || 0}
                        description="Total active projects"
                        icon={Zap}
                        variant="accent"
                    />
                    <StatsCard
                        title="Patents Filed"
                        value={stats.patents_filed || 0}
                        description="Cumulative total"
                        icon={FileText}
                        variant="success"
                    />
                    <StatsCard
                        title="Industrialised Projects"
                        value={stats.industrial_projects || 0}
                        description="Moved past prototype stage"
                        icon={Factory}
                        variant="info"
                    />
                    <StatsCard
                        title="Innovation Hubs"
                        value={stats.hubs || 0}
                        description="Across all institutions"
                        icon={Globe}
                    />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Pipeline Visualization */}
                    <InnovationStageFlow data={pipeline} total={stats.total_projects} />
                    
                    {/* Patents Filed Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Patents Filed Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            {hasTrendData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={patentTrend}>
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
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-sm">No patent data recorded yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Detailed Active Innovations Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Project Activity</CardTitle>
                        <p className="text-sm text-muted-foreground">List of recently updated projects across the ecosystem.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Stage</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.length > 0 ? (
                                        projects.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.institution}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                                        ${['Commercialized', 'Industrialised'].includes(item.stage) ? 'bg-green-100 text-green-700' :
                                                          ['Industrialization', 'Scaling / Startup'].includes(item.stage) ? 'bg-blue-100 text-blue-700' :
                                                          item.stage === 'Prototyping' ? 'bg-yellow-100 text-yellow-700' :
                                                          'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {item.stage}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{item.status}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <p>No projects found.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}