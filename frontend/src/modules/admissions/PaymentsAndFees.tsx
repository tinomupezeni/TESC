
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DollarSign, Wallet, Percent, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";

// --- MOCK DATA ---
const FINANCIAL_STATS = {
    totalPending: "ZWL 4.5M",
    complianceRate: "78.2%",
    studentsWithPending: 1850,
    totalCollectedYTD: "ZWL 12.8M",
};

const FEE_STRUCTURE = [
    { program: 'Education (3 Yrs)', fees: 45000, deadline: '2025-08-30' },
    { program: 'Engineering (4 Yrs)', fees: 58000, deadline: '2025-08-30' },
    { program: 'Industrial Arts (2 Yrs)', fees: 35000, deadline: '2025-08-30' },
];

const PAYMENT_COMPLIANCE_DATA = [
    { month: 'Jul', Target: 1.5, Collected: 1.2 },
    { month: 'Aug', Target: 2.1, Collected: 1.8 },
    { month: 'Sep', Target: 2.5, Collected: 2.2 },
    { month: 'Oct', Target: 2.8, Collected: 2.7 },
    { month: 'Nov', Target: 3.2, Collected: 2.9 },
];

// --- COMPONENT ---
export default function PaymentsAndFees() {
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
                        value={FINANCIAL_STATS.totalPending}
                        description="Outstanding student debt"
                        icon={AlertTriangle}
                        variant="destructive"
                    />
                    <StatsCard
                        title="Fees Compliance Rate"
                        value={FINANCIAL_STATS.complianceRate}
                        description="Percentage of required payment collected"
                        icon={Percent}
                        trend={{ value: 1.5, label: "increase this month" }}
                        variant="success"
                    />
                    <StatsCard
                        title="Students with Pending Fees"
                        value={FINANCIAL_STATS.studentsWithPending}
                        description="Students with outstanding balances"
                        icon={TrendingDown}
                        variant="warning"
                    />
                    <StatsCard
                        title="Total Collected (YTD)"
                        value={FINANCIAL_STATS.totalCollectedYTD}
                        description="Cumulative revenue collected so far"
                        icon={DollarSign}
                        variant="info"
                    />
                </div>

                {/* Charts and Fee Structure */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    {/* Monthly Collection Chart */}
                    <Card className="lg:col-span-3">
                        <CardHeader><CardTitle>Monthly Fees Collection (ZWL Millions)</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={PAYMENT_COMPLIANCE_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Target" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Collected" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fee Structure Table */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Current Fee Structure</CardTitle>
                            <p className="text-sm text-muted-foreground">Standard fees by major program category.</p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Program</TableHead>
                                        <TableHead className="text-right">Fees (ZWL)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {FEE_STRUCTURE.map((item) => (
                                        <TableRow key={item.program}>
                                            <TableCell className="font-medium">{item.program}</TableCell>
                                            <TableCell className="text-right font-bold">{item.fees.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button variant="outline" className="mt-4 w-full">View Detailed Invoices</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Payments Table (High-level data) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Pending Balances</CardTitle>
                        <p className="text-sm text-muted-foreground">List of students with the largest outstanding debt.</p>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead className="text-right">Amount Due (ZWL)</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Mock Data for Top Pending Balances */}
                                {[
                                    { id: 'S001', name: 'Nkomo, S.', program: 'Engineering', amount: 15500, status: 'Overdue' },
                                    { id: 'S002', name: 'Moyo, T.', program: 'Education', amount: 12000, status: 'Due Soon' },
                                    { id: 'S003', name: 'Chari, B.', program: 'Industrial Arts', amount: 9800, status: 'Overdue' },
                                    { id: 'S004', name: 'Zuma, K.', program: 'Engineering', amount: 8700, status: 'Due Soon' },
                                ].map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.program}</TableCell>
                                        <TableCell className="text-right font-bold text-red-600">{student.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                                ${student.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {student.status}
                                            </span>
                                        </TableCell>
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