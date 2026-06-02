import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, BookOpen, Loader2, UserPlus, FolderOpen } from "lucide-react";
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
    PieChart,
    Pie,
    Cell
} from "recharts";
import { getAdmissionStats } from "@/services/analysis.services";

const COLORS = ["#2563eb", "#e11d48", "#16a34a", "#d97706", "#7c3aed"];

export default function Admissions() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdmissionStats()
            .then(setData)
            .catch(err => console.error("Failed to load admissions", err))
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

    const stats = data?.stats || {};
    const trend = data?.trend || [];
    const genderData = data?.gender_distribution || [];
    const topPrograms = data?.top_programs || [];
    const recentAdmissions = data?.recent_admissions || [];

    const hasTrendData = trend.length > 0;
    const hasGenderData = genderData.length > 0;

    // Transform gender data for Recharts if needed
    const genderChartData = hasGenderData ? genderData : [{ gender: 'No Data', value: 1 }];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="pb-2 border-b">
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <UserPlus className="h-6 w-6 sm:h-7 sm:h-7 text-primary" />
                        Admissions Overview
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Tracking student enrollment trends and intake statistics.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard 
                        title="Current Intake" 
                        value={stats.current_intake || 0} 
                        description="Enrolled this year" 
                        icon={Calendar} 
                        variant="default"
                    />
                    <StatsCard 
                        title="Student Body" 
                        value={stats.total_enrolled || 0} 
                        description="Active across all years" 
                        icon={Users} 
                        variant="info"
                    />
                    <StatsCard 
                        title="Growth Rate" 
                        value={`${stats.growth_rate}%`} 
                        description="Vs last year" 
                        icon={TrendingUp} 
                        variant={stats.growth_rate >= 0 ? "success" : "destructive"} 
                    />
                    <StatsCard 
                        title="Top Program" 
                        value={topPrograms[0]?.program__name || "N/A"} 
                        description="Highest enrollment" 
                        icon={BookOpen} 
                        variant="accent"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    
                    {/* Enrollment Trend Chart (Span 4) */}
                    <Card className="lg:col-span-4">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Enrollment Trends (Last 5 Years)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 sm:h-80 relative p-2 sm:p-6 pt-0">
                            {hasTrendData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trend}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                        <XAxis dataKey="enrollment_year" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                                            cursor={{fill: 'hsl(var(--muted)/0.4)'}}
                                        />
                                        <Bar 
                                            dataKey="count" 
                                            name="Students" 
                                            fill="hsl(var(--primary))" 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={30}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-md">
                                    <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-xs">No historical enrollment data found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Demographics Pie Chart (Span 3) */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Intake Demographics</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 sm:h-80 relative p-2 sm:p-6 pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderChartData}
                                        dataKey="value"
                                        nameKey="gender"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={hasGenderData ? 5 : 0}
                                    >
                                        {genderChartData.map((entry: any, index: number) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={hasGenderData ? COLORS[index % COLORS.length] : '#e2e8f0'} 
                                            />
                                        ))}
                                    </Pie>
                                    {hasGenderData && <Tooltip wrapperStyle={{ fontSize: '10px' }} />}
                                    {hasGenderData && <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />}
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {!hasGenderData && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium bg-background/80 px-2 py-1 rounded">No Data</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Programs List */}
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Top Programs by Intake</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            {topPrograms.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {topPrograms.map((item: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] sm:text-xs shrink-0">
                                                    {index + 1}
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium truncate max-w-[200px] sm:max-w-none">{item.program__name}</span>
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
                                    No enrollment data for current year.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Admissions Table */}
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Recent Admissions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs">ID</TableHead>
                                        <TableHead className="text-xs">Name</TableHead>
                                        <TableHead className="text-xs hidden sm:table-cell">Program</TableHead>
                                        <TableHead className="text-right text-xs">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentAdmissions.length > 0 ? (
                                        recentAdmissions.map((student: any) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium text-[10px] sm:text-xs">{student.id}</TableCell>
                                                <TableCell className="text-[10px] sm:text-sm truncate max-w-[100px] sm:max-w-none">{student.name}</TableCell>
                                                <TableCell className="text-[10px] text-muted-foreground hidden sm:table-cell">{student.program}</TableCell>
                                                <TableCell className="text-right text-[10px] sm:text-xs">{student.date}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-xs sm:text-sm">
                                                No recent admissions found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}