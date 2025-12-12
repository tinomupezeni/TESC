import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  Lightbulb,
  TrendingUp,
  Factory,
  Users,
  DollarSign,
  BookOpen,
  Building,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Mock data specific to the Innovation Department's requirements from the meeting notes
const INNOVATION_STATS = {
  activeInnovations: 45,
  ideationPhase: 120,
  commercializedProjects: 12,
  revenueGenerated: "ZWL 5.2M",
  innovationHubs: 8,
  researchGrants: 31,
};

const InnovationDashboard = () => {
  const commercialisationData = [
    { category: "Start-ups", Urban: 8, Rural: 4 },
    { category: "Industrialised Projects", Urban: 15, Rural: 6 },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-primary/90 rounded-lg p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-1">
            Innovation & Industrialisation Hub{" "}
          </h1>
          <p className="text-lg opacity-90">
            Metrics for driving new ideas, research, and commercial output.
          </p>
        </div>

        {/* Key Innovation Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Innovations"
            value={INNOVATION_STATS.activeInnovations}
            description="Projects currently under development"
            icon={Lightbulb}
            trend={{ value: 15, label: "new this quarter" }}
            variant="accent"
          />
          <StatsCard
            title="Ideation Phase Projects"
            value={INNOVATION_STATS.ideationPhase}
            description="Ideas submitted for review"
            icon={BookOpen}
            trend={{ value: 25, label: "increase from last period" }}
            variant="default"
          />
          <StatsCard
            title="Commercialized Projects"
            value={INNOVATION_STATS.commercializedProjects}
            description="Projects generating revenue"
            icon={Factory}
            trend={{ value: 4, label: "newly industrialised" }}
            variant="success"
          />
          <StatsCard
            title="Total Revenue Generated"
            value={INNOVATION_STATS.revenueGenerated}
            description="From industrialisation efforts"
            icon={DollarSign}
            trend={{ value: 18.5, label: "growth this year" }}
            variant="success"
          />
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Commercialisation Focus (Urban vs. Rural)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={commercialisationData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="category"
                      className="text-muted-foreground"
                    />
                    <YAxis
                      allowDecimals={false}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    {/* Urban Projects (Use primary color) */}
                    <Bar
                      dataKey="Urban"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                    {/* Rural Projects (Use accent color) */}
                    <Bar
                      dataKey="Rural"
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Hubs & Grants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatsCard
                title="Innovation Hubs"
                value={INNOVATION_STATS.innovationHubs}
                description="Active physical/virtual hubs"
                icon={Building}
                variant="default"
              />
              <StatsCard
                title="Research Grants"
                value={INNOVATION_STATS.researchGrants}
                description="Grants awarded this year"
                icon={Award}
                variant="default"
              />
            </CardContent>
          </Card>
        </div>

        {/* Innovation Quick Actions */}
        <QuickActions
          title="Innovation Actions"
          actions={[
            { label: "Submit New Idea", url: "/innovation/ideation" },
            { label: "Review Active Innovations", url: "/innovation/active" },
            { label: "View Grant Applications", url: "/innovation/grants" },
          ]}
        />
      </div>
    </DashboardLayout>
  );
};

export default InnovationDashboard;
