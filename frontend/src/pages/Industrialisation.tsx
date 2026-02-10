import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Handshake, Rocket, DollarSign, Loader2, FolderOpen, Target, BarChart3, BriefcaseBusiness } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
// IMPORT BOTH HOOKS
import { useDetailedInnovations, usePartnerships } from "@/hooks/useInnovationAnalytics";

const SECTOR_COLORS: Record<string, string> = {
  agritech: "#6B7280",      // gray
  edtech: "#FACC15",        // yellow
  energy: "#3B82F6",        // blue
  fintech: "#10B981",       // green
  healthtech: "#F59E0B",    // amber
  manufacturing: "#8B5CF6", // purple
  mining: "#EF4444",        // red
  other: "#A855F7",         // custom purple
};

export default function Industrialisation() {
    // 1. Fetch data using both hooks
    const { data: projects, loading: loadingProjects } = useDetailedInnovations();
    const { data: partnerships, loading: loadingPartnerships } = usePartnerships();
    
    const loading = loadingProjects || loadingPartnerships;

    // 2. Process and filter data for stats calculation
    const calculatedStats = useMemo(() => {
        if (!projects) return { commercialised: 0, revenue: 0, startupCount: 0 };
        
        const commercialisedProjects = projects.filter(p => p.stage === 'commercialisation');
        const commercialisedCount = commercialisedProjects.length;
        
        // Assuming startupCount is a specific metric you need calculated
        const startupCount = projects.filter(p => p.stage === 'prototype' || p.stage === 'incubation').length;
        
        const totalRevenue = commercialisedProjects.reduce((sum, p) => sum + parseFloat(p.revenue_generated || "0"), 0);

        return {
            commercialised: commercialisedCount,
            startupCount: startupCount,
            revenue: totalRevenue,
        };
    }, [projects]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center h-[80vh] items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD', 
            notation: "compact" 
        }).format(amount);
    };

    // --- Chart Data: Filter for 'commercialisation' stage only ---
    const commercialisedProjects = projects?.filter(p => p.stage === 'commercialisation') || [];
    
    const sectorCounts = commercialisedProjects.reduce((acc, p) => {
        acc[p.sector] = (acc[p.sector] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const displaySectors = Object.entries(sectorCounts).map(([name, value]) => ({
        name,
        value
    }));

    const hasSectorData = displaySectors.length > 0;
    const chartData = hasSectorData ? displaySectors : [{ name: 'No Data', value: 1 }];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="pb-2 border-b">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Factory className="h-7 w-7 text-primary" /> 
                        Commercialisation
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor industry linkages, startups, and commercialization.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard 
                        title="Commercialised Projects" 
                        value={calculatedStats.commercialised} 
                        icon={BriefcaseBusiness} 
                        variant="success" 
                    />
                    <StatsCard 
                        title="Industry Partnerships" 
                        value={partnerships?.length || 0} // Uses partnerships hook
                        description="Active Agreements" 
                        icon={Handshake} 
                        variant="info" 
                    />
                    <StatsCard 
                        title="Student Startups" 
                        value={calculatedStats.startupCount} 
                        description="" 
                        icon={Rocket} 
                        variant="accent" 
                    />
                    <StatsCard 
                        title="Revenue Generated" 
                        value={formatMoney(calculatedStats.revenue)} 
                        description="Total Income" 
                        icon={DollarSign} 
                        variant="danger" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Sector Chart */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-emerald-600" />
                            <CardTitle>Commercialised Project Sectors</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80 relative">
                            {!hasSectorData && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <span className="text-muted-foreground font-medium bg-background/80 px-2 py-1 rounded">
                                        No Commercialised Data
                                    </span>
                                </div>
                            )}
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    {hasSectorData && <Tooltip />}
                                    {hasSectorData && <Legend verticalAlign="bottom" height={36} />}
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={0}
                                        stroke="none"
                                    >
                                        {chartData.map((entry) => (
                                            <Cell
                                                key={entry.name}
                                                fill={SECTOR_COLORS[entry.name] || '#e2e8f0'}
                                                opacity={1}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Partnerships Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Target className="h-5 w-5 text-sky-600" />
                            <CardTitle>Recent Partnerships</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border max-h-[320px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Partner Name</TableHead>
                                            <TableHead>Focus Area</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {partnerships && partnerships.length > 0 ? (
                                            partnerships.slice(0, 10).map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.partner_name}</TableCell>
                                                    <TableCell>{item.focus_area}</TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {item.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-48 text-center">
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                        <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
                                                        <p>No partnership data available.</p>
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
            </div>
        </DashboardLayout>
    );
}