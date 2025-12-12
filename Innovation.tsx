import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, FileText, Zap, Factory, Globe } from "lucide-react";
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

const generateColor = (index: number) => {
    const colors = ["#34d399", "#60a5fa", "#facc15", "#f97316", "#a78bfa", "#f43f5e"];
    return colors[index % colors.length];
};

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

function InnovationStageFlow({ stages, onStageClick }: { stages: { stage: string; count: number; }[], onStageClick: (stage: string) => void }) {
    const totalProjects = stages.reduce((acc, s) => acc + s.count, 0) || 1;

    if (!stages.length) {
        return (
            <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Innovation Project Pipeline</CardTitle></CardHeader>
                <CardContent>No data found</CardContent>
            </Card>
        );
    }

    return (
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Innovation Project Pipeline</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {stages.map((item, index) => (
                        <div 
                            key={item.stage} 
                            className="flex items-center space-x-4 cursor-pointer hover:bg-muted rounded"
                            onClick={() => onStageClick(item.stage)}
                        >
                            <span className="w-24 text-sm font-medium text-muted-foreground">{item.stage}</span>
                            <div className="flex-grow bg-muted rounded-full h-3 relative">
                                <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${(item.count / totalProjects) * 100}%`, backgroundColor: generateColor(index) }}
                                />
                            </div>
                            <span className="w-10 text-right font-bold" style={{ color: generateColor(index) }}>{item.count}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function InnovationOverview() {
    const navigate = useNavigate();
    const [patentData, setPatentData] = useState<any[]>([]);
    const [innovationData, setInnovationData] = useState<any[]>([]);
    const [stageFlow, setStageFlow] = useState<{ stage: string; count: number }[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        const fetchData = async () => {
            try {
                const patentRes = await fetch("http://127.0.0.1:8000/api/patents/", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const patents = await patentRes.json();
                setPatentData(Array.isArray(patents) ? patents : []);

                const innovationRes = await fetch("http://127.0.0.1:8000/api/innovations/", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const innovations = await innovationRes.json();
                setInnovationData(Array.isArray(innovations) ? innovations : []);

                // Stage flow summary
                const stagesSummary: Record<string, number> = {};
                (Array.isArray(innovations) ? innovations : []).forEach((item: any) => {
                    stagesSummary[item.stage] = (stagesSummary[item.stage] || 0) + 1;
                });
                setStageFlow(Object.entries(stagesSummary).map(([stage, count]) => ({ stage, count })));
            } catch (error) {
                console.error("Error fetching data:", error);
                setPatentData([]);
                setInnovationData([]);
                setStageFlow([]);
            }
        };

        fetchData();
    }, []);

    const handleStageClick = (stage: string) => {
        navigate(`/institutions?stage=${encodeURIComponent(stage)}`);
    };

    const handleRowClick = (institutionId: number) => {
        navigate(`/institutions/${institutionId}`);
    };

    // --- Quick Actions Data ---
    const quickActions = [
        { title: "View Ideation Projects", stage: "Ideation", icon: Lightbulb },
        { title: "View Prototyping Projects", stage: "Prototyping", icon: Zap },
        { title: "View Industrialized Projects", stage: "Industrialization", icon: Factory },
        { title: "View Commercialized Projects", stage: "Commercialized", icon: Globe },
    ];

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

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Card 
                            key={action.stage} 
                            className="cursor-pointer hover:shadow-lg transition"
                            onClick={() => handleStageClick(action.stage)}
                        >
                            <CardContent className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{action.title}</p>
                                    <p className="text-2xl font-bold">
                                        {innovationData.filter(i => i.stage === action.stage).length}
                                    </p>
                                </div>
                                <action.icon className="h-8 w-8 text-accent" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Projects in Pipeline" value={stageFlow.reduce((a, b) => a + b.count, 0).toString()} description="Total active projects" icon={Zap} variant="accent" />
                    <StatsCard title="Patents Filed (2024)" value={patentData.length.toString()} description="+10 from 2023" icon={FileText} variant="success" />
                    <StatsCard title="Industrialised Projects" value={innovationData.filter(i => i.stage === "Industrialization" || i.stage === "Commercialized").length.toString()} description="Moved past prototype stage" icon={Factory} variant="info" />
                    <StatsCard title="Innovation Hubs" value="22" description="Across all institutions" icon={Globe} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InnovationStageFlow stages={stageFlow} onStageClick={handleStageClick} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Patents Filed Per Year</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            {patentData.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={patentData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="year" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: "hsl(var(--success))" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center mt-10 text-muted-foreground">No data found</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Project Tracking</CardTitle>
                        <p className="text-sm text-muted-foreground">List of all active projects across the TESC ecosystem.</p>
                    </CardHeader>
                    <CardContent>
                        {innovationData.length ? (
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
                                    {innovationData.map((item: any) => (
                                        <TableRow 
                                            key={item.id} 
                                            className="cursor-pointer hover:bg-muted"
                                            onClick={() => handleRowClick(item.institution_id)}
                                        >
                                            <TableCell className="font-medium">{item.id}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.institution_name}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                                    ${item.stage === "Commercialized" ? "bg-green-100 text-green-700" :
                                                      item.stage === "Industrialization" ? "bg-blue-100 text-blue-700" :
                                                      item.stage === "Prototyping" ? "bg-yellow-100 text-yellow-700" :
                                                      "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {item.stage}
                                                </span>
                                            </TableCell>
                                            <TableCell>{item.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground">No data found</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
