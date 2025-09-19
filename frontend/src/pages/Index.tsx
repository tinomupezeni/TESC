import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { InstitutionOverview } from "@/components/dashboard/InstitutionOverview";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { 
  Users, 
  GraduationCap, 
  Building, 
  TrendingUp, 
  UserCheck, 
  BookOpen,
  Award,
  Globe
} from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-primary rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">TESC Student Records & Statistics</h1>
          <p className="text-lg opacity-90">
            Zimbabwe Human Capital Planning and Skills Development Department
          </p>
          <p className="text-sm opacity-75 mt-2">
            National dashboard for Teachers Colleges, Polytechnics, and Industrial Training Colleges
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Students"
            value={84750}
            description="Across all institutions"
            icon={Users}
            trend={{ value: 8.2, label: "from last year" }}
            variant="accent"
          />
          <StatsCard
            title="Active Institutions"
            value={156}
            description="Nationwide coverage"
            icon={Building}
            trend={{ value: 3.1, label: "new this year" }}
            variant="success"
          />
          <StatsCard
            title="Graduates (2024)"
            value={18420}
            description="Completed programs"
            icon={GraduationCap}
            trend={{ value: 12.5, label: "increase" }}
            variant="default"
          />
          <StatsCard
            title="Program Completion Rate"
            value="87.3%"
            description="System average"
            icon={Award}
            trend={{ value: 2.1, label: "improvement" }}
            variant="success"
          />
        </div>

        {/* Institution Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Teachers Colleges"
            value={18200}
            description="Students enrolled"
            icon={BookOpen}
            variant="default"
          />
          <StatsCard
            title="Polytechnics"
            value={27100}
            description="Students enrolled"
            icon={TrendingUp}
            variant="default"
          />
          <StatsCard
            title="Industrial Training"
            value={14200}
            description="Students enrolled"
            icon={UserCheck}
            variant="default"
          />
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnrollmentChart />
          <InstitutionOverview />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  );
};

export default Index;
