import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { InstitutionOverview } from "@/components/dashboard/InstitutionOverview";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardService } from "@/services/admin.dashboard.service";
// Import from student service instead of dashboard service for specific student endpoints
import * as StudentService from "@/services/student.service"; 
// IMPORT YOUR NEW TYPE HERE (Update path based on your actual file structure)
import { DashboardStats } from "@/lib/types/dashboard.types";
import { ProgramCompletionStats } from "@/lib/types/academic.types";
import {
  Users,
  GraduationCap,
  Building,
  TrendingUp,
  UserCheck,
  BookOpen,
  Award,
  Loader2,
  Hourglass // Added icon for completion rate
} from "lucide-react";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // ADD STATE FOR COMPLETION STATS
  const [completionStats, setCompletionStats] = useState<ProgramCompletionStats | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch standard dashboard stats
        const data = await DashboardService.getStats();
        setStats(data);

        // --- CORRECTED: Fetch completion statistics from StudentService ---
        const completionData = await StudentService.getCompletionStats();
        setCompletionStats(completionData);

      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-primary rounded-lg p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">TESC Student Records & Statistics</h1>
          <p className="text-lg opacity-90">
            Zimbabwe Human Capital Planning and Skills Development Department
          </p>
          <p className="text-sm opacity-75 mt-2">
            National dashboard for Teachers Colleges, Polytechnics, and Industrial Training Colleges
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatsCard
            title="Total Students"
            value={stats?.total_students || 0}
            description="Across all institutions over the years"
            icon={Users}
            variant="accent"
          />
          <StatsCard
            title="Active Institutions"
            value={stats?.active_institutions || 0}
            description="Nationwide coverage"
            icon={Building}
            variant="success"
          />
          <StatsCard
            title="Graduates"
            value={stats?.graduates_year || 0}
            description="Across all institutions over the years"
            icon={GraduationCap}
            variant="default"
          />
          <StatsCard
            title="Active Students"
            value={stats?.total_students_this_year || 0}
            description={`Enrolled in ${new Date().getFullYear()}`}
            icon={Award}
            variant="success"
          />
          
          {/* --- NEW: Program Completion Rate Card --- */}
          <StatsCard
            title="Program Completion Rate over the years"
            // Display percentage
            value={`${completionStats?.completion_rate_percentage || 0}%`}
            // Add helpful description
            description={`${completionStats?.graduated || 0} graduated / ${completionStats?.total_students || 0} total enrolled`}
            icon={Hourglass}
            // Use warning variant if completion is low, default otherwise
            variant={ (completionStats?.completion_rate_percentage || 0) < 50 ? "warning" : "default" }
          />
        </div>

        {/* Institution Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Teachers Colleges"
            value={stats?.breakdown.teachers_colleges || 0}
            description="Students enrolled over the years"
            icon={BookOpen}
            variant="default"
          />
          <StatsCard
            title="Polytechnics"
            value={stats?.breakdown.polytechnics || 0}
            description="Students enrolled over the years"
            icon={TrendingUp}
            variant="default"
          />
          <StatsCard
            title="Industrial Training"
            value={stats?.breakdown.industrial_training || 0}
            description="Students enrolled over the years"
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
        {/* <QuickActions /> */}
      </div>
    </DashboardLayout>
  );
};

export default Index;