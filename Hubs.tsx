import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Maximize, Zap } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/dashboard/StatsCard";

/* ---------------- API ---------------- */

const fetchHubStats = async () => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://127.0.0.1:8000/api/hubs/stats/", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch hub statistics");
  return res.json();
};

const fetchHubs = async () => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://127.0.0.1:8000/api/hubs/", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch hubs");
  return res.json();
};

/* ---------------- COMPONENT ---------------- */

export default function Hubs() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["hub-stats"],
    queryFn: fetchHubStats,
  });

  const { data: hubs = [], isLoading: hubsLoading } = useQuery({
    queryKey: ["hubs"],
    queryFn: fetchHubs,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="pb-2 border-b">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Incubation Hubs Management
          </h1>
          <p className="text-muted-foreground">
            Real-time statistics and occupancy tracking for all incubation hubs
          </p>
        </div>

        {/* QUICK ACTION METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <StatsCard
            title="Total Hubs"
            value={stats?.total_hubs ?? "—"}
            description="View all hubs"
            icon={Building2}
            onClick={() => navigate("/hubs")}
          />

          <StatsCard
            title="Total Capacity"
            value={stats?.total_capacity ?? "—"}
            description="Hubs with available space"
            icon={Maximize}
            variant="info"
            onClick={() => navigate("/hubs?available=true")}
          />

          <StatsCard
            title="Occupancy Rate"
            value={stats ? `${stats.occupancy_rate}%` : "—"}
            description="High & full hubs"
            icon={Users}
            variant="accent"
            onClick={() => navigate("/hubs?status=high")}
          />

          <StatsCard
            title="Active Programs"
            value={stats?.active_programs ?? "—"}
            description="Manage programs"
            icon={Zap}
            variant="success"
            onClick={() => navigate("/programs")}
          />

        </div>

        {/* HUBS TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Hub Occupancy and Services</CardTitle>
          </CardHeader>

          <CardContent>
            {hubsLoading || statsLoading ? (
              <p className="text-center py-10 text-muted-foreground">
                Loading hub data…
              </p>
            ) : hubs.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hub Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead className="text-center">Capacity</TableHead>
                    <TableHead className="text-center">Occupied</TableHead>
                    <TableHead className="text-center">Services</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {hubs.map((hub: any) => (
                    <TableRow
                      key={hub.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => navigate(`/hubs/${hub.id}`)}
                    >
                      <TableCell className="font-medium">{hub.name}</TableCell>
                      <TableCell>{hub.institution}</TableCell>
                      <TableCell className="text-center">{hub.capacity}</TableCell>
                      <TableCell className="text-center">{hub.occupied}</TableCell>
                      <TableCell className="text-center">{hub.services}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full
                            ${
                              hub.status === "Full"
                                ? "bg-red-100 text-red-700"
                                : hub.status === "High"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                        >
                          {hub.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-10 text-muted-foreground">
                No hubs available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
