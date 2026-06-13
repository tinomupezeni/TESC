import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  FileText, 
  Download,
  Activity
} from "lucide-react";
import { ReportBuilder } from "@/components/reports";

const reportCategories = [
  {
    title: "Enrollment Statistics",
    description: "Student enrollment trends and demographics",
    icon: Users,
    color: "text-primary",
    reports: ["students", "graduates"]
  },
  {
    title: "Staff Analytics",
    description: "Staff distribution and workload reports",
    icon: Activity,
    color: "text-secondary",
    reports: ["staff"]
  }
];

const Reports = () => {
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const openBuilder = (type: string) => {
    setSelectedReportType(type);
    setIsBuilderOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Reports & Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Generate comprehensive dynamic reports and insights</p>
      </div>

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
                {category.reports.map((reportType, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-2">
                    <span className="text-xs sm:text-sm font-medium truncate capitalize">{reportType} Report</span>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="h-8 px-3 shrink-0"
                      onClick={() => openBuilder(reportType)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Build
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isBuilderOpen && selectedReportType && (
        <ReportBuilder
          open={isBuilderOpen}
          onOpenChange={setIsBuilderOpen}
          reportType={selectedReportType as any}
        />
      )}
    </div>
  );
};

export default Reports;
