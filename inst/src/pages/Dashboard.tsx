import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, BookOpen, TrendingUp, GraduationCap, AlertCircle, UserCheck, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getStudents } from "@/services/students.services";
import { getStaff } from "@/services/staff.services";
import { getPrograms } from "@/services/programs.services";

// Helper to format dates relative to now (e.g., "2 hours ago")
const timeAgo = (dateString: string) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 0) return "Just now";

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

interface StudentStatusBreakdown {
  active: number;
  graduated: number;
  attachment: number;
  suspended: number;
  deferred: number;
  dropout: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  // @ts-ignore
  const institutionId = user?.institution?.id || user?.institution_id;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState([
    { title: "Total Students", value: "0", icon: Users, color: "text-blue-600" },
    { title: "Active Staff", value: "0", icon: UserCog, color: "text-purple-600" },
    { title: "Programs", value: "0", icon: BookOpen, color: "text-amber-600" },
    { title: "Graduation Rate", value: "0%", icon: TrendingUp, color: "text-green-600" },
  ]);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [studentStatus, setStudentStatus] = useState<StudentStatusBreakdown>({
    active: 0,
    graduated: 0,
    attachment: 0,
    suspended: 0,
    deferred: 0,
    dropout: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!institutionId) {
        setError("No institution found for this user");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch all data in parallel - use correct param name 'institution' for students
        const [studentsData, staffResponse, programsData] = await Promise.all([
          getStudents({ institution: institutionId } as any).catch(() => []),
          getStaff({ institution_id: institutionId }).catch(() => ({ results: [] })),
          getPrograms({ institution_id: institutionId }).catch(() => [])
        ]);

        // Handle staff data - could be paginated or array
        const staffList = Array.isArray(staffResponse)
          ? staffResponse
          : (staffResponse?.results || []);

        // Handle students data - ensure it's an array
        const studentsList = Array.isArray(studentsData) ? studentsData : [];

        // Handle programs data - ensure it's an array
        const programsList = Array.isArray(programsData) ? programsData : [];

        // 2. Calculate Stats
        const totalStudents = studentsList.length;
        const activeStaff = staffList.filter((s: any) => s.is_active).length;
        const totalPrograms = programsList.length;

        // Calculate graduation rate: graduated / (graduated + dropout) for meaningful rate
        // Or graduated / total enrolled students
        const graduated = studentsList.filter((s: any) => s.status === 'Graduated').length;
        const totalEnrolled = studentsList.filter((s: any) =>
          ['Active', 'Attachment', 'Graduated', 'Suspended', 'Deferred', 'Dropout'].includes(s.status)
        ).length;
        const graduationRate = totalEnrolled > 0 ? Math.round((graduated / totalEnrolled) * 100) : 0;

        // Calculate student status breakdown
        const statusBreakdown: StudentStatusBreakdown = {
          active: studentsList.filter((s: any) => s.status === 'Active').length,
          graduated: graduated,
          attachment: studentsList.filter((s: any) => s.status === 'Attachment').length,
          suspended: studentsList.filter((s: any) => s.status === 'Suspended').length,
          deferred: studentsList.filter((s: any) => s.status === 'Deferred').length,
          dropout: studentsList.filter((s: any) => s.status === 'Dropout').length,
        };
        setStudentStatus(statusBreakdown);

        setStats([
          {
            title: "Total Students",
            value: totalStudents.toString(),
            icon: Users,
            color: "text-blue-600"
          },
          {
            title: "Active Staff",
            value: activeStaff.toString(),
            icon: UserCog,
            color: "text-purple-600"
          },
          {
            title: "Programs",
            value: totalPrograms.toString(),
            icon: BookOpen,
            color: "text-amber-600"
          },
          {
            title: "Graduation Rate",
            value: `${graduationRate}%`,
            icon: TrendingUp,
            color: "text-green-600"
          },
        ]);

        // 3. Generate Recent Activity Feed
        // Sort students by created_at and take recent ones
        const sortedStudents = [...studentsList]
          .filter((s: any) => s.created_at)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const sortedStaff = [...staffList]
          .filter((s: any) => s.created_at)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const sortedPrograms = [...programsList]
          .filter((p: any) => p.created_at)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const newStudents = sortedStudents.slice(0, 3).map((s: any) => ({
          action: "Student Enrolled",
          user: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.student_id,
          program: s.program_name || "General",
          time: s.created_at,
          type: "student"
        }));

        const newStaff = sortedStaff.slice(0, 2).map((s: any) => ({
          action: "Staff Member Joined",
          user: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.employee_id,
          program: s.department_name || s.faculty_name || "General",
          time: s.created_at,
          type: "staff"
        }));

        const newPrograms = sortedPrograms.slice(0, 1).map((p: any) => ({
          action: "Program Added",
          user: p.coordinator || "System",
          program: p.name,
          time: p.created_at,
          type: "program"
        }));

        // Merge and sort by time (newest first)
        const combinedActivity = [...newStudents, ...newStaff, ...newPrograms]
          .filter(a => a.time)
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5);

        setRecentActivities(combinedActivity);

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [institutionId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusItems = [
    { label: "Active", value: studentStatus.active, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Graduated", value: studentStatus.graduated, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "On Attachment", value: studentStatus.attachment, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Deferred", value: studentStatus.deferred, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Suspended", value: studentStatus.suspended, icon: UserX, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Dropout", value: studentStatus.dropout, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your institution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
              ) : (
                recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`h-2 w-2 rounded-full mt-2
                      ${activity.type === 'student' ? 'bg-blue-500' :
                        activity.type === 'staff' ? 'bg-purple-500' : 'bg-amber-500'}`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{activity.user}</span>
                        <span>•</span>
                        <span>{activity.program}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(activity.time)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Status Breakdown
            </CardTitle>
            <CardDescription>Current distribution of student statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {statusItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 p-3 rounded-lg ${item.bg}`}
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <div>
                    <p className="text-lg font-semibold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;