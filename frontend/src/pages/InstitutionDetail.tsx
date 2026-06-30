import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentChart";
import { ReportBuilder } from "@/components/reports";
import { DashboardService } from "@/services/admin.dashboard.service";
import * as StudentService from "@/services/student.service"; 
import {
  Users,
  GraduationCap,
  Building,
  Hourglass,
  ArrowLeft,
  MapPin,
  Loader2,
  Mail,
  School,
  Briefcase,
  BarChart,
  FileText,
  Award,
  Shield,
  Lightbulb,
  Building2,
  Globe,
  TrendingUp,
  AlertCircle,
  Download
} from "lucide-react";
import apiClient from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Configuration for all the dynamic data categories requested by the user
const DATA_CATEGORIES = [
  { id: "overview", title: "Overview", icon: BarChart, color: "text-blue-500", desc: "Enrollment Trends" },
  { id: "students", title: "Student Records", icon: Users, color: "text-green-500", endpoint: "/academic/students/", desc: "All Enrolled Students" },
  { id: "iseop", title: "ISEOP Students", icon: Users, color: "text-purple-500", endpoint: "/academic/students/?is_iseop=true", desc: "ISEOP Program" },
  { id: "staff", title: "Staff Records", icon: Briefcase, color: "text-orange-500", endpoint: "/staff/members/", desc: "Academic & Non-Academic" },
  { id: "graduates", title: "Graduation Records", icon: GraduationCap, color: "text-indigo-500", endpoint: "/academic/students/?status=Graduated", desc: "Alumni Data" },
  { id: "stem", title: "STEM Students", icon: FileText, color: "text-cyan-500", endpoint: "/academic/students/?program__category=STEM", desc: "Science & Tech" },
  { id: "specialized", title: "Specialized Skills", icon: Award, color: "text-rose-500", endpoint: "/academic/students/?has_specialized_skills=true", desc: "Specialized Training" },
  { id: "critical", title: "Critical Skills", icon: Shield, color: "text-red-500", endpoint: "/academic/students/?has_critical_skills=true", desc: "National Shortage Areas" },
  { id: "inclusivity", title: "Inclusivity Report", icon: Users, color: "text-teal-500", endpoint: "/academic/students/?inclusivity=true", desc: "Special Needs" },
  { id: "facilities", title: "Facilities & Capacity", icon: Building, color: "text-emerald-500", endpoint: "/academic/facilities/", desc: "Infrastructure" },
  { id: "innovation", title: "Innovation", icon: Lightbulb, color: "text-yellow-500", endpoint: "/innovation/projects/", desc: "Projects & Patents" },
  { id: "startups", title: "Startups", icon: TrendingUp, color: "text-sky-500", endpoint: "/innovation/hubs/", desc: "Incubated Companies" },
  { id: "placements", title: "Industry Placements", icon: Building2, color: "text-violet-500", endpoint: "/academic/placements/", desc: "Attachments" },
  { id: "mobility", title: "Int. Mobility", icon: Globe, color: "text-blue-600", endpoint: "/academic/mobility/", desc: "International Students" },
];

function DynamicDataTable({ endpoint, institutionId, categoryTitle }: { endpoint: string, institutionId: string, categoryTitle: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dynamic-data", endpoint, institutionId],
    queryFn: async () => {
      // We must pass institution_id to filter the data for this specific institution
      const separator = endpoint.includes("?") ? "&" : "?";
      const res = await apiClient.get(`${endpoint}${separator}institution_id=${institutionId}&institution=${institutionId}`);
      // Some endpoints return paginated data (res.data.results), others return arrays (res.data)
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    }
  });

  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  if (isLoading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-[400px] flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p>Failed to load data for {categoryTitle}</p>
        <p className="text-sm text-muted-foreground mt-2">The endpoint might not exist yet or requires specific permissions.</p>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No records found for {categoryTitle}.</p>
      </Card>
    );
  }

  // Auto-generate columns from the first object's keys, omitting complex nested objects
  const sample = data[0];
  const columns = Object.keys(sample)
    .filter(key => 
      !['id', 'created_at', 'updated_at', 'institution'].includes(key) &&
      typeof sample[key] !== 'object'
    )
    .slice(0, 7); // Max 7 columns for readability

  const handleExport = (type: 'csv' | 'excel') => {
    const headers = columns.map(col => col.replace(/_/g, ' '));
    const rows = data.map((row: any) => columns.map(col => typeof row[col] === 'boolean' ? (row[col] ? "Yes" : "No") : String(row[col] || 'N/A')));

    let content = "";
    let mimeType = "";
    let fileExtension = "";

    if (type === 'csv') {
      content = [headers, ...rows].map(e => e.join(",")).join("\\n");
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
    } else {
      content = [headers.join("\\t"), ...rows.map(r => r.join("\\t"))].join("\\n");
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      fileExtension = 'xls';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${categoryTitle.replace(/\s+/g, '_')}_Records.${fileExtension}`;
    link.click();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{categoryTitle} ({data.length} Records)</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="flex gap-2 font-bold border-blue-200 hover:bg-blue-50">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="flex gap-2 font-bold border-blue-200 hover:bg-blue-50">
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button size="sm" onClick={() => setReportBuilderOpen(true)} className="flex gap-2 font-bold bg-green-600 hover:bg-green-700 shadow-sm transition-all">
            <FileText className="h-4 w-4" /> Generate Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col} className="capitalize">{col.replace(/_/g, ' ')}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 100).map((row: any, idx: number) => (
              <TableRow key={row.id || idx}>
                {columns.map(col => (
                  <TableCell key={col}>
                    {typeof row[col] === 'boolean' ? (
                      <Badge variant={row[col] ? "default" : "secondary"}>{row[col] ? "Yes" : "No"}</Badge>
                    ) : (
                      String(row[col] || 'N/A')
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > 100 && (
          <p className="text-center text-sm text-muted-foreground mt-4">Showing first 100 records. Export for full dataset.</p>
        )}
      </CardContent>
      <ReportBuilder reportType={categoryTitle.toLowerCase().replace(/\s+/g, "_")} open={reportBuilderOpen} onOpenChange={setReportBuilderOpen} />
    </Card>
  );
}

export default function InstitutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");

  // Fetch Institution Details
  const { data: institution, isLoading: instLoading } = useQuery({
    queryKey: ["institution", id],
    queryFn: async () => {
      const res = await apiClient.get(`/academic/institutions/${id}/`);
      return res.data;
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", id],
    queryFn: () => DashboardService.getStats(id)
  });

  const { data: completionStats, isLoading: compLoading } = useQuery({
    queryKey: ["completion-stats", id],
    queryFn: () => StudentService.getCompletionStats(id)
  });

  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ["institution-counts", id],
    queryFn: async () => {
      const res = await apiClient.get(`/academic/dashboard/institution-counts/?institution_id=${id}`);
      return res.data;
    }
  });

  if (instLoading || statsLoading || countsLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!institution) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Institution Not Found</h2>
          <Button onClick={() => navigate("/institutions")} className="mt-4">Back to Institutions</Button>
        </div>
      </DashboardLayout>
    );
  }

  const activeCategory = DATA_CATEGORIES.find(c => c.id === activeView);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-primary rounded-lg p-6 text-white shadow-lg flex items-start gap-4">
          <button 
            onClick={() => navigate("/institutions")}
            className="mt-1 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2 uppercase tracking-wide">{institution.name}</h1>
            <p className="text-lg opacity-90 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {institution.location} 
              <span className="mx-2">•</span> 
              <Building className="h-4 w-4" /> {institution.type}
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="bg-white text-blue-900 border-none">
                {institution.status}
              </Badge>
              {institution.email && (
                <Badge variant="outline" className="border-white/30 text-white flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {institution.email}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Data Categories Navigation (Cards) */}
        <div>
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-700">Institution Data Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {DATA_CATEGORIES.map((cat) => {
              const isActive = activeView === cat.id;
              const countValue = counts && counts[cat.id] !== undefined ? counts[cat.id] : null;
              
              return (
                <Card 
                  key={cat.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary border-primary bg-blue-50/50' : 'hover:border-primary/50'}`}
                  onClick={() => setActiveView(cat.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[3rem] ${isActive ? 'bg-primary/10' : 'bg-slate-100'}`}>
                      {cat.id === "overview" ? (
                        <cat.icon className={`h-6 w-6 ${isActive ? 'text-primary' : cat.color}`} />
                      ) : (
                        <span className={`text-xl font-bold ${isActive ? 'text-primary' : 'text-slate-700'}`}>
                          {countValue !== null ? countValue.toLocaleString() : "0"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-primary' : ''}`}>{cat.title}</p>
                      <p className="text-[9px] text-muted-foreground mt-1 line-clamp-1">{cat.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Section */}
        <div className="mt-8">
          {activeView === "overview" ? (
            <div className="space-y-6">
              {/* Key Statistics only shown on Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatsCard
                  title="Total Students"
                  value={institution.student_count || 0}
                  description="Currently enrolled students"
                  icon={Users}
                  variant="default"
                  onClick={() => setActiveView("students")}
                />
                <StatsCard
                  title="Total Staff"
                  value={institution.staff_count || 0}
                  description="Active staff members"
                  icon={Briefcase}
                  variant="default"
                  onClick={() => setActiveView("staff")}
                />
                <StatsCard
                  title="Programs Offered"
                  value={institution.program_count || 0}
                  description="Across all departments"
                  icon={School}
                  variant="default"
                />
                <StatsCard
                  title="Program Completion Rate"
                  value={`${completionStats?.completion_rate_percentage || 0}%`}
                  description={`${completionStats?.graduated || 0} graduated / ${completionStats?.total_students || 0} total enrolled`}
                  icon={Hourglass}
                  variant={ (completionStats?.completion_rate_percentage || 0) < 50 ? "default" : "default" }
                />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <EnrollmentChart institutionId={id} />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DynamicDataTable 
                endpoint={activeCategory?.endpoint || ""} 
                institutionId={id!} 
                categoryTitle={activeCategory?.title || ""} 
              />
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
