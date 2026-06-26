import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, UserCheck, CreditCard, Loader2, Inbox, BarChart as BarChartIcon } from "lucide-react";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { useSpecialEnrollment } from "@/hooks/useSpecialEnrollment";

const COLOR_MAP: Record<string, string> = {
  Physical: "#2563EB", Albino: "#D946EF", Hearing: "#0EA5E9", Visual: "#FBBF24",
  Amputation: "#F97316", Paralysis: "#6B7280", CerebralPalsy: "#EC4899",
  SpinalCord: "#F59E0B", Speech: "#14B8A6", DeafBlind: "#8B5CF6",
  Intellectual: "#84CC16", Learning: "#FACC15", Autism: "#06B6D4",
  ADHD: "#FB7185", Epilepsy: "#4F46E5", MentalHealth: "#C026D3",
  DownSyndrome: "#0EA5E9", SickleCell: "#F59E0B", ChronicIllness: "#10B981",
  Multiple: "#EF4444", Other: "#9CA3AF",
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderLegendText = (value: string, entry: any) => {
  const { payload } = entry;
  return (
    <span className="text-xs font-medium text-muted-foreground mr-2">
      {value}: <span className="text-foreground">{payload.value}</span>
    </span>
  );
};

export default function SpecialEnrollmentDashboard() {
  const { data, pieData, iseopPieData, loading, error } = useSpecialEnrollment();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center text-red-500">
          {error || "Failed to load data."}
        </div>
      </DashboardLayout>
    );
  }

  // --- Aggregate Top 5 for Bar Chart ---
  const combinedDisabilities = [...(data.students.special_students || []), ...(data.iseop.special_students || [])];
  const aggregated = combinedDisabilities.reduce<Record<string, number>>((acc, item) => {
    acc[item.inclusivity_category] = (acc[item.inclusivity_category] || 0) + item.value;
    return acc;
  }, {});
    
  const top5Data = Object.entries(aggregated)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value,
      color: COLOR_MAP[name] || "#9CA3AF",
    }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="pb-2 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 sm:h-7 sm:h-7 text-primary" />
            Special Needs & Work-for-Fees
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Tracking student support and work-for-fees allocations.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title="Special Needs (Normal)" value={data.students.counts.disabled} icon={User} variant="accent" />
          <StatsCard title="Work-for-Fees" value={data.students.counts.work_for_fees} icon={CreditCard} variant="info" />
          <StatsCard title="Special Needs (ISEOP)" value={data.iseop.counts.total} icon={UserCheck} variant="success" />
        </div>

        {/* First Row: The Two Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">Disability Categories (Normal)</CardTitle></CardHeader>
            <CardContent className="h-64 sm:h-80 p-2 sm:p-6">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} labelLine={false} label={renderCustomizedLabel}>
                      {pieData.map((entry, index) => <Cell key={index} fill={COLOR_MAP[entry.name] || "#6B7280"} />)}
                    </Pie>
                    <Tooltip wrapperStyle={{ fontSize: '10px' }} />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} formatter={(v) => <span className="text-[10px]">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">Disability Categories (ISEOP)</CardTitle></CardHeader>
            <CardContent className="h-64 sm:h-80 p-2 sm:p-6">
              {iseopPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={iseopPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}labelLine={false} label={renderCustomizedLabel}>
                      {iseopPieData.map((entry, index) => <Cell key={index} fill={COLOR_MAP[entry.name] || "#6B7280"} />)}
                    </Pie>
                    <Tooltip wrapperStyle={{ fontSize: '10px' }} />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} formatter={(v) => <span className="text-[10px]">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Top 5 Bar Chart and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChartIcon className="h-5 w-5 text-primary" />
                Top 5 Disabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 sm:h-80 p-2 sm:p-6">
              {top5Data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5Data} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {top5Data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">Work-for-Fees Allocation</CardTitle></CardHeader>
            <CardContent className="p-0 sm:p-6">
              {data.students.work_for_fees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Service Area</TableHead>
                      <TableHead className="text-center text-xs">Students</TableHead>
                      <TableHead className="text-right text-xs">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.students.work_for_fees.map((item) => (
                      <TableRow key={item.work_area}>
                        <TableCell className="font-medium text-[10px] sm:text-xs">{item.work_area}</TableCell>
                        <TableCell className="text-center text-[10px] sm:text-xs">{item.students}</TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs">{item.hours} hrs</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <NoData />}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function NoData() {
  return (
    <div className="flex flex-col items-center justify-center h-full opacity-50 py-10">
      <Inbox className="mb-2" /> No records found
    </div>
  );
}