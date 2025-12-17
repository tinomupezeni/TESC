import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, Users, Beaker, Download } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";

/* ---------------- API ---------------- */

const fetchEnrollment = async ({ queryKey }: any) => {
  const [, from, to] = queryKey;
  const token = localStorage.getItem("accessToken");

  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const res = await fetch(
    `http://127.0.0.1:8000/api/regions/enrollment/?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.json();
};

const fetchStats = async () => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(
    "http://127.0.0.1:8000/api/regions/statistics/",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
};

/* ---------------- COMPONENT ---------------- */

export default function Regional() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: enrollmentData = [], isLoading } = useQuery({
    queryKey: ["regional-enrollment", fromDate, toDate],
    queryFn: fetchEnrollment,
  });

  const { data: regionalStats = [] } = useQuery({
    queryKey: ["regional-stats"],
    queryFn: fetchStats,
  });

  const topProvince = regionalStats.reduce(
    (max: any, p: any) =>
      p.students > (max?.students || 0) ? p : max,
    null
  );

  const exportCSV = () => {
    const headers = ["Province", "Institutions", "Students", "Hubs"];
    const rows = regionalStats.map((r: any) =>
      [r.province, r.institutions, r.students, r.hubs].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "regional_statistics.csv";
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-7 w-7" />
              Regional Analysis
            </h1>
            <p className="text-muted-foreground">
              Institutional footprint and impact by province
            </p>
          </div>

          <Button onClick={exportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Date Filter */}
        <div className="flex gap-4">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {/* Metrics (Quick Actions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Provinces Covered"
            value={regionalStats.length}
            icon={MapPin}
            onClick={() => navigate("/institutions")}
          />

          <StatsCard
            title="Top Province (Enrollment)"
            value={topProvince?.province || "—"}
            description={
              topProvince
                ? `${topProvince.students.toLocaleString()} Students`
                : "No data"
            }
            icon={Users}
            variant="accent"
            onClick={() => {
              if (topProvince?.province) {
                navigate(
                  `/institutions?province=${encodeURIComponent(
                    topProvince.province
                  )}`
                );
              }
            }}
          />

          <StatsCard
            title="Institutions"
            value={topProvince?.institutions || "—"}
            icon={Building}
            variant="info"
            onClick={() => navigate("/institutions")}
          />

          <StatsCard
            title="Innovation Hubs"
            value={topProvince?.hubs || "—"}
            icon={Beaker}
            onClick={() => navigate("/hubs")}
          />
        </div>

        {/* Chart + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Enrollment by Province</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <p className="text-center mt-20">Loading…</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="province"
                      type="category"
                      width={100}
                    />
                    <Tooltip />
                    <Bar dataKey="students" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Statistics by Province</CardTitle>
            </CardHeader>
            <CardContent className="h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Province</TableHead>
                    <TableHead>Institutions</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Hubs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionalStats.map((p: any) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() =>
                        navigate(
                          `/institutions?province=${encodeURIComponent(
                            p.province
                          )}`
                        )
                      }
                    >
                      <TableCell className="font-medium">
                        {p.province}
                      </TableCell>
                      <TableCell>{p.institutions}</TableCell>
                      <TableCell>
                        {p.students.toLocaleString()}
                      </TableCell>
                      <TableCell>{p.hubs}</TableCell>
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
