import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Handshake, Rocket, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// --- Helper for dynamic colors ---
const COLORS = ["#34d399", "#60a5fa", "#facc15", "#f97316", "#a78bfa", "#f43f5e"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-2 shadow-sm text-card-foreground">
        <p className="font-bold">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Industrialisation() {
  const navigate = useNavigate();

  const [startupData, setStartupData] = useState<any[]>([]);
  const [partnershipData, setPartnershipData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    commercialized: 0,
    partnerships: 0,
    startups: 0,
    revenue: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const fetchData = async () => {
      try {
        // Fetch student startups
        const startupRes = await fetch("http://127.0.0.1:8000/api/startups/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const startups = await startupRes.json();
        setStartupData(Array.isArray(startups) ? startups : []);

        // Fetch partnerships
        const partnerRes = await fetch("http://127.0.0.1:8000/api/partnerships/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const partners = await partnerRes.json();
        setPartnershipData(Array.isArray(partners) ? partners : []);

        // Fetch key metrics
        const metricsRes = await fetch("http://127.0.0.1:8000/api/industrialisation/stats/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const metrics = await metricsRes.json();
        setStats(metrics);
      } catch (error) {
        console.error("Error fetching industrialisation data:", error);
        setStartupData([]);
        setPartnershipData([]);
        setStats({ commercialized: 0, partnerships: 0, startups: 0, revenue: 0 });
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    { title: "Commercialized Products", value: stats.commercialized, icon: DollarSign, filter: "commercialized" },
    { title: "Industry Partnerships", value: stats.partnerships, icon: Handshake, filter: "partnerships" },
    { title: "Student Startups", value: stats.startups, icon: Rocket, filter: "startups" },
    { title: "Revenue Generated", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, filter: "revenue" },
  ];

  const handleQuickAction = (filter: string) => {
    switch(filter) {
      case "commercialized":
        navigate("/industrialisation/commercialized");
        break;
      case "partnerships":
        navigate("/industrialisation/partnerships");
        break;
      case "startups":
        navigate("/industrialisation/startups");
        break;
      case "revenue":
        navigate("/industrialisation/revenue");
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Factory className="h-7 w-7" />
            Industrialisation
          </h1>
          <p className="text-muted-foreground">
            Monitor industry linkages, startups, and commercialization
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className="cursor-pointer hover:shadow-lg transition border-t-4"
              style={{ borderTopColor: COLORS[Math.floor(Math.random()*COLORS.length)] }}
              onClick={() => handleQuickAction(action.filter)}
            >
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{action.title}</p>
                  <p className="text-2xl font-bold">{action.value}</p>
                </div>
                <action.icon className="h-8 w-8" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Startup Sectors Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Student Startup Sectors</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {startupData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Pie
                      data={startupData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                    >
                      {startupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground mt-10">No data found</p>
              )}
            </CardContent>
          </Card>

          {/* Key Industry Partners Table */}
          <Card>
            <CardHeader>
              <CardTitle>Key Industry Partners</CardTitle>
            </CardHeader>
            <CardContent>
              {partnershipData.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Focus Area</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partnershipData.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted" onClick={() => navigate(`/industrialisation/partnerships/${item.id}`)}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.focus}</TableCell>
                        <TableCell>{item.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground mt-4">No data found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
