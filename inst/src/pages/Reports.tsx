import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  FileText, 
  Download,
  Calendar,
  PieChart,
  Activity
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reportCategories = [
  {
    title: "Enrollment Statistics",
    description: "Student enrollment trends and demographics",
    icon: Users,
    color: "text-primary",
    reports: ["Enrollment by Program", "Gender Distribution", "Year-on-Year Comparison"]
  },
  {
    title: "Academic Performance",
    description: "Results analysis and performance metrics",
    icon: TrendingUp,
    color: "text-success",
    reports: ["Pass Rate Analysis", "GPA Distribution", "Top Performing Students"]
  },
  {
    title: "Staff Analytics",
    description: "Staff distribution and workload reports",
    icon: Activity,
    color: "text-secondary",
    reports: ["Staff-to-Student Ratio", "Department Distribution", "Qualification Analysis"]
  },
  {
    title: "Financial Overview",
    description: "Fee collection and financial summaries",
    icon: BarChart3,
    color: "text-accent",
    reports: ["Fee Collection Status", "Outstanding Balances", "Revenue by Program"]
  }
];

const quickReports = [
  { name: "Monthly Enrollment Report", date: "October 2025", size: "2.4 MB" },
  { name: "Semester Results Summary", date: "Semester 1, 2025", size: "1.8 MB" },
  { name: "Staff Distribution Report", date: "Q3 2025", size: "890 KB" },
  { name: "Financial Statement", date: "October 2025", size: "3.2 MB" },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Reports & Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Generate comprehensive reports and insights</p>
      </div>

      <Card className="mx-1 border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Generate Custom Report</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Select parameters to create a custom report</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Select>
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 shrink-0" />
                  <SelectValue placeholder="Select period" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <div className="flex items-center">
                  <PieChart className="h-4 w-4 mr-2 shrink-0" />
                  <SelectValue placeholder="Report type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="staff">Staff Analytics</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm sm:col-span-2 lg:col-span-1">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {reportCategories.map((category) => (
          <Card key={category.title} className="hover:shadow-md transition-shadow mx-1 border-none sm:border">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 ${category.color}`}>
                  <category.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">{category.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm line-clamp-1">{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                {category.reports.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-2">
                    <span className="text-xs sm:text-sm font-medium truncate">{report}</span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mx-1 border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Recent Reports</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3">
            {quickReports.map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{report.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{report.date} • {report.size}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 px-2 text-[10px] sm:text-xs shrink-0">
                  <Download className="h-3.5 w-3.5 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
