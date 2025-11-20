import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserX, DollarSign, HeartCrack, TrendingDown } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// Mock Data for Dropout Reasons (from meeting notes: marital, financial)
const dropoutReasons = [
    { name: 'Financial Hardship', value: 550, percent: '65%', color: 'hsl(var(--destructive))' },
    { name: 'Academic Failure', value: 150, percent: '18%', color: 'hsl(var(--warning))' },
    { name: 'Marital/Personal Issues', value: 80, percent: '9%', color: 'hsl(var(--accent))' },
    { name: 'Health/Medical', value: 70, percent: '8%', color: 'hsl(var(--info))' },
];

const COLORS = dropoutReasons.map(d => d.color);

// --- COMPONENT ---
export default function DropoutAnalysis() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="pb-2 border-b">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <UserX className="h-7 w-7 text-destructive" />
                        Student Dropout Analysis
                    </h1>
                    <p className="text-muted-foreground">
                        Investigating dropout rates and primary contributing factors to improve retention.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Dropouts (2024)"
                        value={850}
                        description="Students who left their program"
                        icon={UserX}
                        variant="destructive"
                    />
                    <StatsCard
                        title="Financial Hardship"
                        value={550}
                        description="Primary cause (65% of total)"
                        icon={DollarSign}
                        variant="default"
                    />
                    <StatsCard
                        title="Marital Issues"
                        value={80}
                        description="Secondary concern"
                        icon={HeartCrack}
                        variant="accent"
                    />
                    <StatsCard
                        title="Retention Goal"
                        value="90%"
                        description="Target completion rate"
                        icon={TrendingDown}
                        variant="success"
                    />
                </div>

                {/* Chart and Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Dropout Reason Pie Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle>Dropout Reasons Distribution</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dropoutReasons}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            animationDuration={500}
                                        >
                                            {dropoutReasons.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                            formatter={(value, name, props) => [`${value} students`, props.payload.name]}
                                        />
                                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Items / Summary */}
                    <Card>
                        <CardHeader><CardTitle>Retention Strategy</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                High rate of financial hardship suggests a critical need for targeted student financial support programs.
                            </p>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="text-right">Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dropoutReasons.map(d => (
                                        <TableRow key={d.name}>
                                            <TableCell>{d.name}</TableCell>
                                            <TableCell className="text-right">{d.value}</TableCell>
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