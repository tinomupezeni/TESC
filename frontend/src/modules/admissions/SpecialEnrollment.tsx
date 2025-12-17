import { useState, useEffect } from "react"; // <-- ADDED THIS: Needed to talk to Django
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, UserCheck, CreditCard } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

// Note: We removed the "Mock Data" lists because we are getting them from the backend now!

export default function SpecialEnrollment() {
    // 1. Create a "State" to hold the data from your Django API
    const [backendData, setBackendData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 2. This function runs as soon as the page opens
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/enrollment/stats/") // This is your Django URL
            .then((response) => response.json())
            .then((data) => {
                setBackendData(data); // Save the data from Django
                setLoading(false);    // Stop showing the loading screen
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, []);

    // 3. If the data isn't here yet, show a loading message
    if (loading) {
        return <div className="p-10 text-center">Connecting to Django Server...</div>;
    }

    // 4. If something went wrong and we have no data
    if (!backendData) {
        return <div className="p-10 text-center text-red-500">Could not load data. Is the Django server running?</div>;
    }

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

                {/* Key Metrics - Using data from backendData.metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatsCard
                        title="DISABLED STUDENTS"
                        value={backendData.metrics.totalDisabled}
                        description="Students requiring special support"
                        icon={User}
                        variant="accent"
                    />
                    <StatsCard
                        title="WORK-FOR-FEES STUDENTS"
                        value={backendData.metrics.workForFeesTotal}
                        description="Participating in fee assistance"
                        icon={CreditCard}
                        variant="info"
                    />
                    <StatsCard
                        title="ISEOP STUDENTS"
                        value={backendData.metrics.iseopTotal}
                        description="Enrolled in the ISEOP program"
                        icon={UserCheck}
                        variant="success"
                    />
                    <StatsCard
                        title="ALBINO STUDENTS"
                        value={backendData.metrics.albinoTotal}
                        description="Students with albinism"
                        icon={User}
                        variant="default"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Pie Chart - Using backendData.specialStudents */}
                    <Card>
                        <CardHeader><CardTitle>Disabled Student Categories</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={backendData.specialStudents}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {backendData.specialStudents.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table - Using backendData.workForFeesData */}
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
                                    {backendData.workForFeesData.map((item: any) => (
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