import { useState, useEffect } from "react";
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
  Activity,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import reportsService, { Report } from "@/services/reports.services";

// --- UI Data ---
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

// --- Component ---
const Reports = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<string>("");
  const [reportType, setReportType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null); // Per-report download state

  // Fetch reports on mount
  useEffect(() => {
    fetchGeneratedReports();
  }, []);

  const fetchGeneratedReports = async () => {
    try {
      setIsLoading(true);
      const reports = await reportsService.getGeneratedReports();
      setGeneratedReports(reports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast({ title: "Error", description: "Failed to fetch reports", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!period || !reportType) {
      toast({ title: "Missing Parameters", description: "Select both period and report type", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const templateMap: Record<string, number> = {
        enrollment: 1,
        performance: 2,
        staff: 3,
        financial: 4,
      };

      const template_id = templateMap[reportType];

      const newReport = await reportsService.generateReport({
        template_id,
        parameters: { period },
        format: "pdf",
      });

      setGeneratedReports(prev => [newReport, ...prev]);

      toast({ title: "Report Generated", description: `"${newReport.title}" is ready.` });
      setPeriod("");
      setReportType("");
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Try again", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      await reportsService.downloadReportFile(report.id, report.title);
      toast({ title: "Download Complete", description: `${report.title} downloaded successfully.` });
    } catch (error) {
      toast({ title: "Download Failed", description: "Failed to download report", variant: "destructive" });
    }
  };

  const handleDownloadTemplate = (reportName: string) => {
    toast({ title: "Download Started", description: `Downloading ${reportName} template...` });
    console.log(`Downloading template: ${reportName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Generate comprehensive reports and insights</p>
      </div>

      {/* Generate Custom Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
          <CardDescription>Select parameters to create a custom report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <PieChart className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="staff">Staff Analytics</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full" onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportCategories.map(category => (
          <Card key={category.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${category.color}`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.reports.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">{report}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadTemplate(report)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports ready for download</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : generatedReports.length === 0 ? (
            <div className="space-y-3">
              {quickReports.map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {generatedReports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.title}</p>
                      {/* Date temporarily removed to avoid "Invalid Date" */}
                      <p className="text-sm text-muted-foreground">{report.category}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setDownloadingId(report.id);
                      await handleDownloadReport(report);
                      setDownloadingId(null);
                    }}
                    disabled={downloadingId === report.id}
                  >
                    {downloadingId === report.id ? 'Downloading...' : <><Download className="h-4 w-4 mr-2" />Download</>}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
