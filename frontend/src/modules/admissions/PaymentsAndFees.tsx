import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DollarSign, Wallet, Percent, AlertTriangle, TrendingDown, Loader2, FolderOpen } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { getFinancialStats, FinancialStats } from "@/services/analysis.services";

export default function PaymentsAndFees() {
    const [data, setData] = useState<FinancialStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getFinancialStats();
                setData(response);
            } catch (error) {
                console.error("Failed to load financial stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to format money
    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return "$0";
        return new Intl.NumberFormat('en-ZW', {
            style: 'currency',
            currency: 'ZWL', // Or USD
            notation: "compact",
            maximumFractionDigits: 1
        }).format(amount);
    };

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
    const fee_structure = data?.fee_structure || [];
    const payment_data = data?.payment_data || [];
    // If no payment data exists, show empty chart state
    const hasPaymentData = payment_data.some(d => d.Collected > 0 || d.Target > 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="pb-2 border-b">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Wallet className="h-7 w-7 text-green-600" />
                        Payments & Fees Management
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor revenue collection, outstanding balances, and fee structure compliance.
                    </p>
                </div>

                {/* Key Financial Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Pending Fees"
                        value={formatCurrency(stats.totalPending)}
                        description="Outstanding student debt"
                        icon={AlertTriangle}
                        variant="destructive"
                    />
                    <StatsCard
                        title="Fees Compliance Rate"
                        value={`${stats.complianceRate || 0}%`}
                        description="Percentage of expected revenue collected"
                        icon={Percent}
                        variant="success"
                    />
                    <StatsCard
                        title="Students with Pending"
                        value={stats.studentsWithPending || 0}
                        description="Students with outstanding balances"
                        icon={TrendingDown}
                        variant="warning"
                    />
                    <StatsCard
                        title="Total Collected (YTD)"
                        value={formatCurrency(stats.totalCollectedYTD)}
                        description="Cumulative revenue collected this year"
                        icon={DollarSign}
                        variant="info"
                    />
                </div>

                {/* Charts and Fee Structure */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    {/* Monthly Collection Chart */}
                    <Card className="lg:col-span-3">
                        <CardHeader><CardTitle>Monthly Fees Collection</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-80 relative">
                                {!hasPaymentData && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-muted-foreground bg-background/50">
                                        <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                                        <p className="text-sm">No payment data recorded for this year.</p>
                                    </div>
                                )}
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hasPaymentData ? payment_data : [{ month: 'Jan', Target: 0, Collected: 0 }]}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis 
                                            fontSize={12} 
                                            stroke="hsl(var(--muted-foreground))" 
                                            tickFormatter={(val) => formatCurrency(val)}
                                        />
                                        {hasPaymentData && (
                                            <Tooltip 
                                                formatter={(val: number) => formatCurrency(val)}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                        )}
                                        <Legend />
                                        <Bar 
                                            dataKey="Target" 
                                            fill={hasPaymentData ? "hsl(var(--accent))" : "#e2e8f0"} 
                                            radius={[4, 4, 0, 0]} 
                                            name="Target" 
                                        />
                                        <Bar 
                                            dataKey="Collected" 
                                            fill={hasPaymentData ? "hsl(var(--success))" : "#e2e8f0"} 
                                            radius={[4, 4, 0, 0]} 
                                            name="Actual" 
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fee Structure Table */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Program Fee Structure</CardTitle>
                            <p className="text-sm text-muted-foreground">Top programs by annual fee cost.</p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Program</TableHead>
                                        <TableHead className="text-right">Annual Fee</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fee_structure.length > 0 ? (
                                        fee_structure.map((item: any, i: number) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-right font-bold text-primary">
                                                    {formatCurrency(item.annual_fee)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-32 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <p>No fee structures defined.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <Button variant="outline" className="mt-4 w-full">View All Programs</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Outstanding Balances</CardTitle>
                        <p className="text-sm text-muted-foreground">Students with significant pending payments.</p>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder until per-student balance logic is finalized on backend */}
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-md border border-dashed flex flex-col items-center justify-center gap-2">
                            <TrendingDown className="h-8 w-8 opacity-20" />
                            <p>Detailed individual debt analysis is calculating...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}