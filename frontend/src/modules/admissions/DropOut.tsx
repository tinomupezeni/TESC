import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserX, DollarSign, HeartCrack, AlertCircle, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getDropoutAnalysis, DropoutStats } from "@/services/analysis.services";

export default function DropoutAnalysis() {
  const [stats, setStats] = useState<DropoutStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getDropoutAnalysis();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dropout stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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

  if (!stats) return null;

  const { total_dropouts, chart_data } = stats;

  // Map reasons for quick access
  const reasonMap = chart_data.reduce((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {} as Record<string, number>);

  // Determine top reason
  const topReasonItem = chart_data.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev,
    { name: "N/A", value: 0, color: "#000000" }
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="pb-2 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <UserX className="h-6 w-6 sm:h-7 sm:h-7 text-destructive" />
            Dropout Analysis
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Overview of student attrition across the higher education landscape.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Dropouts"
            value={total_dropouts}
            description="All institutions"
            icon={UserX}
            variant="destructive"
          />
          <StatsCard 
  title="Financial Hardship"
  value={reasonMap["Financial Hardship"] || 0}
  description={
    total_dropouts
      ? `${(((reasonMap["Financial Hardship"] || 0) / total_dropouts) * 100).toFixed(1)}%`
      : "0%"
  }
  icon={DollarSign}
  variant="default"
/>
          <StatsCard
            title="Personal Issues"
            value={reasonMap["Personal/Family Issues"] || 0}
            description="Marital/Family"
            icon={HeartCrack}
            variant="accent"
          />
          <StatsCard
            title="Primary Cause"
            value={topReasonItem.name}
            description={`${topReasonItem.value} cases`}
            icon={AlertCircle}
            variant="warning"
          />
        </div>

        {/* Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Dropout Reasons Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="h-64 sm:h-96 relative">
                {!total_dropouts && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">No Data Available</span>
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
  <Pie
    data={chart_data.filter(entry => entry.value > 0)}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    innerRadius={50}
    outerRadius={80}
    sm:innerRadius={80}
    sm:outerRadius={120}
    paddingAngle={2}
    stroke="none"
    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
  >
    {chart_data
      .filter(entry => entry.value > 0)
      .map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
  </Pie>
  {total_dropouts > 0 && (
    <>
      <Tooltip
        contentStyle={{
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontSize: '10px'
        }}
      />
      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
    </>
  )}
</PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Breakdown by Reason</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-right text-xs">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chart_data.map((d) => (
                    <TableRow key={d.name}>
                      <TableCell className="flex items-center gap-2 py-2 sm:py-3 text-[10px] sm:text-xs">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="truncate">{d.name}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-[10px] sm:text-xs">{d.value}</TableCell>
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
