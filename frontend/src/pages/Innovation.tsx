import { DashboardLayout } from "../components/layout/DashboardLayout"; // Fixed Import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, FileText, Beaker, Zap, Users, Factory, Globe } from "lucide-react";
import { StatsCard } from "../components/dashboard/StatsCard"; // Fixed Import
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
    { id: "IN001", name: "Solar-Powered Water Purifier", institution: "Harare Poly", stage: "Prototyping", status: "Active" },
    { id: "IN002", name: "Low-Cost Ventilator", institution: "Mutare Poly", stage: "Commercialized", status: "Complete" },
    { id: "IN003", name: "EdTech Learning Platform", institution: "Mkoba TC", stage: "Ideation", status: "Review" },
    { id: "IN004", name: "Drought-Resistant Maize AI", institution: "Chinhoyi Poly", stage: "Research", status: "Active" },
    { id: "IN005", name: "Artisan Skills Portal", institution: "Bulawayo ITC", stage: "Industrialisation", status: "Launched" },
    { id: "IN006", name: "Digital Records System", institution: "Gweru TC", stage: "Prototyping", status: "Active" },
];

const STAGE_FLOW_DATA = [
    { stage: 'Ideation', count: 55, color: 'hsl(var(--warning))' },
    { stage: 'Research', count: 35, color: 'hsl(var(--info))' },
    { stage: 'Prototype', count: 25, color: 'hsl(var(--accent))' },
    { stage: 'Industrialization', count: 15, color: 'hsl(var(--success))' },
    { stage: 'Commercialized', count: 8, color: 'hsl(var(--primary))' },
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

// --- Component to show the visual stage flow (simple list/status bar) ---
function InnovationStageFlow() {
    return (
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Innovation Project Pipeline</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {STAGE_FLOW_DATA.map((item, index) => (
                        <div key={item.stage} className="flex items-center space-x-4">
                            <span className="w-24 text-sm font-medium text-muted-foreground">{item.stage}</span>
                            <div className="flex-grow bg-muted rounded-full h-3 relative">
                                {/* Use an imaginary total of 150 projects for percentage calculation */}
                                <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ 
                                        width: `${(item.count / 150) * 100}%`, 
                                        backgroundColor: item.color 
                                    }} 
                                />
                            </div>
                            <span className="w-10 text-right font-bold" style={{ color: item.color }}>{item.count}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}


// --- MAIN COMPONENT ---
export default function InnovationOverview() {
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
                        value="138" // Sum of STAGE_FLOW_DATA counts
                        description="Total active projects"
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
                        title="Industrialised Projects"
                        value="15"
                        description="Moved past prototype stage"
                        icon={Factory}
                        variant="info"
                    />
                    <StatsCard
                        title="Innovation Hubs"
                        value="22"
                        description="Across all institutions"
                        icon={Globe}
                    />
                </div>

                {/* Charts and Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Innovation Project Pipeline Visualization */}
                    <InnovationStageFlow />
                    
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
                </div>
                
                {/* Detailed Active Innovations Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Project Tracking</CardTitle>
                        <p className="text-sm text-muted-foreground">List of all active projects across the TESC ecosystem.</p>
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
                                {innovationData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.institution}</TableCell>
                                        <TableCell>
                                            {/* Highlight status based on stage */}
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                                ${item.stage === 'Commercialized' ? 'bg-green-100 text-green-700' :
                                                  item.stage === 'Industrialisation' ? 'bg-blue-100 text-blue-700' :
                                                  item.stage === 'Prototyping' ? 'bg-yellow-100 text-yellow-700' :
                                                  'bg-gray-100 text-gray-700'
                                                }`}>
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
        </DashboardLayout>
    );
}