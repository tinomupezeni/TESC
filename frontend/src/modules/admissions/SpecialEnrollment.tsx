import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, UserCheck, CreditCard,  Zap } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// Mock Data
const specialStudents = [
    { name: "Physically Disabled", value: 150, color: 'hsl(var(--primary))' },
    { name: "Albino Students", value: 25, color: 'hsl(var(--accent))' },
    { name: "Hearing Impaired", value: 50, color: 'hsl(var(--info))' },
    { name: "Visually Impaired", value: 30, color: 'hsl(var(--warning))' },
];

const workForFeesData = [
    { name: "Library Assistant", students: 45, hours: 1200 },
    { name: "Grounds Maintenance", students: 60, hours: 1800 },
    { name: "Labs Assistant", students: 30, hours: 900 },
    { name: "Admin Support", students: 25, hours: 750 },
];

// --- COMPONENT ---
export default function SpecialEnrollment() {
    const totalDisabled = specialStudents.reduce((sum, item) => sum + item.value, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="pb-2 border-b">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <User className="h-7 w-7 text-primary" />
                        Special Enrollment & Support
                    </h1>
                    <p className="text-muted-foreground">
                        Tracking vulnerable student groups and managing the Work-for-Fees and ISEOP programs.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Disabled/Albino"
                        value={totalDisabled}
                        description="Students requiring special support"
                        icon={User}
                        variant="accent"
                    />
                    <StatsCard
                        title="Work-for-Fees Students"
                        value={160}
                        description="Participating in fee assistance"
                        icon={CreditCard}
                        variant="info"
                    />
                    <StatsCard
                        title="ISEOP Students"
                        value={1240}
                        description="Enrolled in the ISEOP program"
                        icon={UserCheck}
                        variant="success"
                    />
                    <StatsCard
                        title="Albino Students"
                        value={25}
                        description="Students with albinism"
                        icon={User}
                        variant="default"
                    />
                </div>

                {/* Disabled Students Chart and Work-for-Fees Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Disabled Students Chart */}
                    <Card>
                        <CardHeader><CardTitle>Disabled Student Categories</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={specialStudents}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {specialStudents.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                            formatter={(value, name) => [`${value} students`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Work-for-Fees Table */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Work-for-Fees Program Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service Area</TableHead>
                                        <TableHead className="text-center">Students Assigned</TableHead>
                                        <TableHead className="text-right">Total Hours Pledged</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workForFeesData.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center">{item.students}</TableCell>
                                            <TableCell className="text-right">{item.hours}</TableCell>
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