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
  Loader2,
  Eye,
  X,
  Printer,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import reportsService, { Report, ReportData } from "@/services/reports.services";
import { PDFGenerator, PDFReportData } from "@/utils/pdfGenerator";

// --- UI Data ---
const reportCategories = [
  {
    title: "Enrollment Statistics",
    description: "Student enrollment trends and demographics",
    icon: Users,
    color: "text-blue-600",
    reports: ["Enrollment by Program", "Gender Distribution", "Year-on-Year Comparison"]
  },
  {
    title: "Academic Performance",
    description: "Results analysis and performance metrics",
    icon: TrendingUp,
    color: "text-green-600",
    reports: ["Pass Rate Analysis", "GPA Distribution", "Top Performing Students"]
  },
  {
    title: "Staff Analytics",
    description: "Staff distribution and workload reports",
    icon: Activity,
    color: "text-purple-600",
    reports: ["Staff-to-Student Ratio", "Department Distribution", "Qualification Analysis"]
  },
  {
    title: "Financial Overview",
    description: "Fee collection and financial summaries",
    icon: BarChart3,
    color: "text-amber-600",
    reports: ["Fee Collection Status", "Outstanding Balances", "Revenue by Program"]
  }
];

// Helper function to convert ReportData to PDFReportData
const convertToPDFReportData = (reportData: ReportData | null, reportTitle: string, reportGeneratedAt: string): PDFReportData => {
  if (!reportData) {
    return {
      title: reportTitle,
      generated_at: reportGeneratedAt,
      parameters: {},
      data: [],
      summary: {}
    };
  }
  
  return {
    title: reportData.title || reportTitle,
    generated_at: reportData.generated_at || reportGeneratedAt,
    parameters: reportData.parameters || {},
    data: reportData.data || [],
    summary: reportData.summary || {},
    ...reportData
  };
};

// --- Component ---
const Reports = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<string>("");
  const [reportType, setReportType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

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
      toast({ 
        title: "Error", 
        description: "Failed to fetch reports", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!period || !reportType) {
      toast({ 
        title: "Missing Parameters", 
        description: "Select both period and report type", 
        variant: "destructive" 
      });
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
      setViewingReport(newReport);

      toast({ 
        title: "Report Generated", 
        description: `"${newReport.title}" is ready to view.` 
      });
      setPeriod("");
      setReportType("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Try again";
      toast({ 
        title: "Generation Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = (report: Report) => {
    setViewingReport(report);
    setActiveTab('summary');
  };

  const handleDownloadPDF = (report: Report) => {
    try {
      console.log("Downloading report:", report);
      console.log("Report data:", report.report_data);
      
      // Check if report_data exists
      if (!report.report_data) {
        toast({ 
          title: "No Report Data", 
          description: "This report has no data to download", 
          variant: "destructive" 
        });
        return;
      }
      
      // Convert to PDFReportData format
      const pdfData = convertToPDFReportData(
        report.report_data, 
        report.title, 
        report.generated_at
      );
      
      console.log("PDF Data prepared:", pdfData);
      
      // Generate PDF based on category
      switch (report.category) {
        case 'enrollment':
          PDFGenerator.generateEnrollmentReport(report.report_data);
          break;
        case 'academic':
          PDFGenerator.generateAcademicReport(report.report_data);
          break;
        case 'staff':
          PDFGenerator.generateStaffReport(report.report_data);
          break;
        case 'financial':
          PDFGenerator.generateFinancialReport(report.report_data);
          break;
        default:
          // Use the converted data for generic reports
          PDFGenerator.generateReport(pdfData, report.title);
      }
      
      toast({ 
        title: "Download Complete", 
        description: `${report.title} downloaded successfully.` 
      });
    } catch (error: any) {
      console.error("PDF generation error details:", error);
      console.error("Error stack:", error.stack);
      toast({ 
        title: "Download Failed", 
        description: error.message || "Failed to generate PDF. Check console for details.", 
        variant: "destructive" 
      });
    }
  };

  const handlePrintReport = (report: Report) => {
    if (!report.report_data) {
      toast({ 
        title: "Cannot Print", 
        description: "No data available for printing", 
        variant: "destructive" 
      });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const data = report.report_data;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${report.title}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 1000px;
              margin: 0 auto;
            }
            h1 { 
              color: #333; 
              border-bottom: 2px solid #eee; 
              padding-bottom: 10px; 
            }
            .meta { 
              color: #666; 
              font-size: 0.9em; 
              margin-bottom: 20px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            th { 
              background: #2c3e50; 
              color: white; 
              padding: 10px; 
              text-align: left; 
            }
            td { 
              padding: 8px; 
              border-bottom: 1px solid #ddd; 
            }
            tr:nth-child(even) { 
              background: #f9f9f9; 
            }
            .summary { 
              background: #f5f5f5; 
              padding: 15px; 
              border-radius: 5px; 
              margin-bottom: 20px; 
            }
          </style>
        </head>
        <body>
          <h1>${report.title}</h1>
          <div class="meta">
            Generated: ${new Date(report.generated_at).toLocaleString()}<br>
            Category: ${report.category}
          </div>
      `);
      
      if (data.summary) {
        printWindow.document.write(`
          <div class="summary">
            <h3>Summary</h3>
            ${Object.entries(data.summary).map(([key, value]) => `
              <div><strong>${key}:</strong> ${value}</div>
            `).join('')}
          </div>
        `);
      }
      
      if (data.by_program) {
        printWindow.document.write(`
          <h3>Program Distribution</h3>
          <table>
            <thead>
              <tr>
                <th>Program</th>
                <th>Students</th>
              </tr>
            </thead>
            <tbody>
              ${data.by_program.map((item: any) => `
                <tr>
                  <td>${item.program}</td>
                  <td>${item.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `);
      }
      
      printWindow.document.write(`
        </body>
        </html>
      `);
      
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 100);
    }
  };

  const handleDownloadTemplate = (reportName: string) => {
    toast({ 
      title: "Template Download", 
      description: `"${reportName}" template available soon.` 
    });
  };

  // Render report data
  const renderReportData = (report: Report) => {
    const data = report.report_data;
    
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <AlertCircle className="h-16 w-16 mb-4 text-yellow-500" />
          <p className="font-medium">No data available for this report</p>
          <p className="text-sm mt-2">The report was generated but contains no data</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => handleDownloadPDF(report)}
            disabled={!report.report_data}
          >
            <Download className="h-4 w-4 mr-2" />
            Try Download Anyway
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'summary' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary View
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'raw' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('raw')}
          >
            Raw Data
          </button>
        </div>

        {activeTab === 'summary' ? (
          <>
            {data.summary && Object.keys(data.summary).length > 0 ? (
              <div className="bg-blue-50 p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(data.summary).map(([key, value]) => (
                    <div key={key} className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-sm text-muted-foreground uppercase">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-2xl font-bold mt-1 text-primary">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800">No summary data available</span>
                </div>
              </div>
            )}

            {data.by_program && data.by_program.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 border-b">
                  <h3 className="font-semibold text-lg">Enrollment by Program</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="p-3 text-left font-semibold">Program</th>
                        <th className="p-3 text-left font-semibold">Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.by_program.map((item: any, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                          <td className="p-3 font-medium">{item.program || 'N/A'}</td>
                          <td className="p-3">{item.count ? item.count.toLocaleString() : '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-muted/30 rounded-lg p-4">
            <pre className="text-sm overflow-auto max-h-96 bg-white rounded border p-4">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Generate comprehensive reports and insights</p>
      </div>

      {/* Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">{viewingReport.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(viewingReport.generated_at).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-1 bg-muted rounded-full text-xs">
                    {viewingReport.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    viewingReport.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewingReport.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handlePrintReport(viewingReport)}
                  disabled={!viewingReport.report_data}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button 
                  onClick={() => handleDownloadPDF(viewingReport)}
                  disabled={!viewingReport.report_data}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewingReport(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {renderReportData(viewingReport)}
            </div>
          </div>
        </div>
      )}

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
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="current_quarter">This Quarter</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="current_year">This Year</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <PieChart className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrollment">Enrollment Statistics</SelectItem>
                <SelectItem value="performance">Academic Performance</SelectItem>
                <SelectItem value="staff">Staff Analytics</SelectItem>
                <SelectItem value="financial">Financial Overview</SelectItem>
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

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>View and download previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : generatedReports.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet.</p>
              <p className="text-sm mt-1">Generate a report to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {generatedReports.map(report => {
                const hasData = !!report.report_data;
                return (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`
                        h-10 w-10 rounded-lg flex items-center justify-center relative
                        ${report.category === 'enrollment' ? 'bg-blue-100 text-blue-600' : 
                          report.category === 'academic' ? 'bg-green-100 text-green-600' :
                          report.category === 'staff' ? 'bg-purple-100 text-purple-600' :
                          'bg-amber-100 text-amber-600'}
                      `}>
                        <FileText className="h-5 w-5" />
                        {!hasData && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-white"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{report.category}</span>
                          <span>•</span>
                          <span>{new Date(report.generated_at).toLocaleDateString()}</span>
                          {!hasData && (
                            <>
                              <span>•</span>
                              <span className="text-red-500 font-medium">No data</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(report)}
                        disabled={!hasData}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;