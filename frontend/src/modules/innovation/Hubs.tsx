import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  Maximize,
  Zap,
  Loader2,
  FolderOpen,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { getHubStats } from "@/services/analysis.services"; // Or innovation.services depending on where you put it

export default function Hubs() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHubStats()
      .then(setData)
      .catch((err) => console.error("Failed to load hubs:", err))
      .finally(() => setLoading(false));
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center h-[80vh] items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // 2. Safe Data Access
  const stats = data?.stats || {};
  const hubData = data?.hub_data || [];
  const hasData = hubData.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-2 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 sm:h-7 sm:h-7 text-primary" />
            Incubation Hubs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Statistics and occupancy tracking for TESC Incubation Hubs.
          </p>
        </div>

        {/* Key Metrics - defaults to 0 if null */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Hubs"
            value={stats.totalHubs || 0}
            description="Physical centers"
            icon={Building2}
          />
          <StatsCard
            title="Total Capacity"
            value={stats.totalCapacity || 0}
            description="Seats available"
            icon={Maximize}
            variant="info"
          />
          <StatsCard
            title="Occupancy Rate"
            value={stats.occupancyRate || "0%"}
            description="Utilization"
            icon={Users}
            variant="accent"
          />
          <StatsCard
            title="Active Programs"
            value={stats.activePrograms || 0}
            description="High activity hubs"
            icon={Zap}
            variant="success"
          />
        </div>

        {/* Hubs Table with Empty State */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Hub Occupancy and Services</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="rounded-md border-0 sm:border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hub Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Institution</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Capacity</TableHead>
                    <TableHead className="text-center">Occupied</TableHead>

                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hasData ? (
                    hubData.map((hub: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          {hub.name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">{hub.institution}</TableCell>
                        <TableCell className="text-center hidden md:table-cell text-xs">
                          {hub.capacity}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {hub.occupied}
                        </TableCell>

                        <TableCell className="text-right">
                          <span
                            className={`px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full 
                                                        ${
                                                          hub.status === "Full"
                                                            ? "bg-red-100 text-red-700"
                                                            : hub.status ===
                                                              "High"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                        }`}
                          >
                            {hub.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // EMPTY STATE ROW
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                          <p className="font-medium text-sm">
                            No innovation hubs found
                          </p>
                          <p className="text-[10px]">
                            No hubs have been registered in the system yet.
                          </p>
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
    </DashboardLayout>
  );
}
