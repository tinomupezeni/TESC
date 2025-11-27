import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, BookOpen, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// const statsCards = [
//   {
//     title: "Total Students",
//     value: "1,248",
//     change: "+12%",
//     trend: "up",
//     icon: Users,
//     color: "text-primary",
//   },
//   {
//     title: "Active Staff",
//     value: "87",
//     change: "+3",
//     trend: "up",
//     icon: UserCog,
//     color: "text-secondary",
//   },
//   {
//     title: "Programs",
//     value: "24",
//     change: "+2",
//     trend: "up",
//     icon: BookOpen,
//     color: "text-accent",
//   },
//   {
//     title: "Completion Rate",
//     value: "94.2%",
//     change: "+2.1%",
//     trend: "up",
//     icon: TrendingUp,
//     color: "text-success",
//   },
// ];

// const recentActivities = [
//   { action: "New student registration", user: "John Doe", program: "Computer Science", time: "2 hours ago" },
//   { action: "Results uploaded", user: "Dr. Smith", program: "Engineering", time: "4 hours ago" },
//   { action: "Staff member added", user: "Jane Wilson", program: "Admin", time: "1 day ago" },
//   { action: "Program updated", user: "Admin", program: "Business Studies", time: "2 days ago" },
//   { action: "Bulk student import", user: "System", program: "Multiple", time: "3 days ago" },
// ];

// const upcomingEvents = [
//   { title: "Semester Registration Deadline", date: "Nov 15, 2025", type: "important" },
//   { title: "Mid-term Examinations", date: "Dec 1-10, 2025", type: "normal" },
//   { title: "Staff Meeting", date: "Nov 8, 2025", type: "normal" },
// ];

const Dashboard = () => {
  const [statsCards, setStatsCards] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])

  const fetchDashboadData = () => {
    // TODO - call the dashboard function to fetch dashboard data from backend in this function, then use useEffect hook below this method to then call fetchDashoboardData automatically on render
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>



      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change} from last month
              </p>
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
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.program}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  {event.type === "important" && (
                    <Badge variant="destructive" className="text-xs">Important</Badge>
                  )}
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
