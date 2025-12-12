
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Maximize, Clock, Zap } from "lucide-react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";

// --- MOCK DATA ---
const HUB_STATS = {
    totalHubs: 22,
    totalCapacity: 180,
    occupancyRate: "85%",
    activePrograms: 14,
};

const HUB_DATA = [
    { name: "Tech Launchpad", institution: "Harare Poly", capacity: 20, occupied: 18, services: 5, status: "High" },
    { name: "Rural Innovation Center", institution: "Mutare Poly", capacity: 15, occupied: 12, services: 3, status: "Medium" },
    { name: "Skills Accelerator", institution: "Mkoba TC", capacity: 10, occupied: 10, services: 4, status: "Full" },
    { name: "Agri-Tech Lab", institution: "Chinhoyi Poly", capacity: 25, occupied: 15, services: 6, status: "Medium" },
    { name: "Digital Workshop", institution: "Bulawayo ITC", capacity: 30, occupied: 28, services: 5, status: "High" },
];

// --- COMPONENT ---
export default function Hubs() {
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
                        Detailed statistics and occupancy tracking for all TESC Incubation Hubs.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Hubs"
                        value={HUB_STATS.totalHubs}
                        description="Physical and virtual centers"
                        icon={Building2}
                        variant="default"
                    />
                    <StatsCard
                        title="Total Capacity"
                        value={HUB_STATS.totalCapacity}
                        description="Seats/spaces available"
                        icon={Maximize}
                        variant="info"
                    />
                    <StatsCard
                        title="Occupancy Rate"
                        value={HUB_STATS.occupancyRate}
                        description="Average utilization across network"
                        icon={Users}
                        variant="accent"
                    />
                    <StatsCard
                        title="Active Programs"
                        value={HUB_STATS.activePrograms}
                        description="Events/workshops running now"
                        icon={Zap}
                        variant="success"
                    />
                </div>

                {/* Hubs Detail Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hub Occupancy and Services</CardTitle>
                        <p className="text-sm text-muted-foreground">View real-time status and activity of each incubation center.</p>
                    </CardHeader>
                    <CardContent>
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
                                {HUB_DATA.map((hub) => (
                                    <TableRow key={hub.name}>
                                        <TableCell className="font-medium">{hub.name}</TableCell>
                                        <TableCell>{hub.institution}</TableCell>
                                        <TableCell className="text-center">{hub.capacity}</TableCell>
                                        <TableCell className="text-center">{hub.occupied}</TableCell>
                                        <TableCell className="text-center">{hub.services}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                                ${hub.status === 'Full' ? 'bg-red-100 text-red-700' :
                                                  hub.status === 'High' ? 'bg-yellow-100 text-yellow-700' :
                                                  'bg-green-100 text-green-700'
                                                }`}>
                                                {hub.status}
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