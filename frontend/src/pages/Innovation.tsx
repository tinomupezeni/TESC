import React, { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileDown, Download, RotateCcw, Zap, Scale, BriefcaseBusiness, Factory, Lightbulb, Eye, FolderOpen, Target, BarChart3, PieChart } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDetailedInnovations } from "@/hooks/useInnovationAnalytics"; 
import { exportToExcel } from "@/lib/export-utils";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; 
import { ProjectView } from "@/components/ProjectDetail";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title, ChartDataLabels);

// --- PROFESSIONAL COLORS ---
const stageColors: Record<string, string> = {
  ideation: '#A3E635', prototype: '#3B82F6', incubation: '#8B5CF6',
  ip_registration: '#EC4899', commercialisation: '#10B981', industrial: '#F97316',
};

const ipTypeColors: Record<string, string> = {
  'Patents': '#3B82F6',
  'Copyright and Neighbouring Rights': '#10B981',
  'Trade Marks': '#FACC15',
  'Industrial Designs': '#F97316',
  'Integrated Circuit Lay-Out Designs': '#8B5CF6',
  'Geographical Indications': '#EF4444',
  'Plant Breeders Rights': '#06B6D4',
  'Unregistered': '#94A3B8'
};

// --- SECTOR COLORS (Mapped to provided list) ---
const sectorColors: Record<string, string> = {
    'Agriculture / AgriTech': '#166534',       // Dark Green
    'Education / EdTech': '#075985',          // Sky Blue
    'Health / BioTech': '#BE123C',            // Rose
    'FinTech': '#F59E0B',                     // Amber
    'Mining & Engineering': '#92400E',        // Brown
    'Green Energy': '#15803D',                // Emerald
    'Manufacturing': '#475569',               // Slate
    'Other': '#64748B'                        // Slate
};

// --- VIBRANT COLORS FOR HUBS ---
const hubChartColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#8B5CF6', // Violet
];

// --- SUB-COMPONENTS FOR CHARTS ---

// Pipeline Visualization
function InnovationStageFlow({ data, total }: { data: { stage: string; count: number; color: string }[], total: number }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Target className="h-5 w-5 text-accent" />
        <CardTitle>Innovation Project Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {total > 0 ? (
            data.map((item) => {
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              return (
                <div key={item.stage} className="flex items-center space-x-4">
                  <span className="w-32 text-sm font-medium text-muted-foreground">{item.stage}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-muted-foreground">{percentage}%</span>
                  <span className="w-10 text-right font-bold" style={{ color: item.color }}>{item.count}</span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No active projects in the pipeline.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Top Performing Hubs Chart
function TopHubsChart({ data }: { data: { name: string; institution: string; count: number }[] }) {
    const chartData = {
        labels: data.map(hub => `${hub.name} (${hub.institution})`),
        datasets: [{
            label: 'Projects',
            data: data.map(hub => hub.count),
            backgroundColor: hubChartColors, 
            borderColor: hubChartColors.map(c => c),
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 30,
        }]
    };

    const options = {
        indexAxis: 'y' as const, // Horizontal Bar Chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            title: { display: false } // Title moved to CardHeader
        },
        scales: {
            x: { beginAtZero: true, grid: { color: '#e2e8f0' } },
            y: { grid: { display: false } }
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <CardTitle>Top 5 Performing Hubs</CardTitle>
            </CardHeader>
            <CardContent className="h-80 pt-4">
                <Bar data={chartData} options={options} />
            </CardContent>
        </Card>
    );
}

// --- MAIN COMPONENT ---
export default function InnovationOverview() {
  const { data: projects, loading: projectsLoading } = useDetailedInnovations();

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [hubFilter, setHubFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [instTypeFilter, setInstTypeFilter] = useState("all");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalProject, setViewModalProject] = useState<any>(null);
  const itemsPerPage = 50;

  const processedProjects = useMemo(() => {
    return projects?.map(p => {
      const ip = p.ip_details;
      return {
        ...p,
        ip_type: ip?.ip_type_display || null,
        ip_route: ip?.filing_route_display || null,
        ip_date: ip?.date_filed || null,
        sector_display: p.sector_display || 'Other',
        institution_type: p.institution_type || 'Unknown',
        institution_name: p.institution_name || 'Unknown',
        ip_year: ip?.date_filed ? new Date(ip.date_filed).getFullYear().toString() : 'N/A'
      };
    }) || [];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return processedProjects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        || p.team_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = stageFilter === "all" || p.stage === stageFilter;
      const matchesHub = hubFilter === "all" || (p.hub_name || "").toLowerCase() === hubFilter.toLowerCase();
      const matchesSector = sectorFilter === "all" || p.sector_display === sectorFilter;
      const matchesYear = yearFilter === "all" || p.ip_year === yearFilter;
      const matchesInstType = instTypeFilter === "all" || p.institution_type === instTypeFilter;
      const matchesInstitution = institutionFilter === "all" || p.institution_name === institutionFilter;
      
      return matchesSearch && matchesStage && matchesHub && matchesSector && matchesYear && matchesInstType && matchesInstitution;
    });
  }, [processedProjects, searchTerm, stageFilter, hubFilter, sectorFilter, yearFilter, instTypeFilter, institutionFilter]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, stageFilter, hubFilter, sectorFilter, yearFilter, instTypeFilter, institutionFilter]);

  // --- CHART DATA GENERATION ---
  
  // 1. Pipeline Data
  const stageOrder = ['ideation','prototype','incubation','ip_registration','commercialisation','industrial'];
  const stageDisplayMap: Record<string,string> = {
    ideation:'Ideation', prototype:'Prototyping', incubation:'Incubation',
    ip_registration:'IP Registration', commercialisation:'Commercialisation', industrial:'Industrialised'
  };
  
  const pipelineData = stageOrder.map(stageKey => ({
    stage: stageDisplayMap[stageKey],
    count: filteredProjects.filter(p => p.stage === stageKey).length,
    color: stageColors[stageKey],
  }));

  const totalProjects = filteredProjects.length;

  // 2. Top Hubs Data (With Institution)
  const hubStats: Record<string, { count: number, institution: string }> = {};
  filteredProjects.forEach(p => {
    if (p.hub_name) {
        if (!hubStats[p.hub_name]) {
            hubStats[p.hub_name] = { count: 0, institution: p.institution_name };
        }
        hubStats[p.hub_name].count += 1;
    }
  });
  
  const topHubsData = Object.entries(hubStats)
    .sort((a, b) => b[1].count - a[1].count) // Sort descending
    .slice(0, 5) // Get top 5
    .map(([name, stats]) => ({ name, institution: stats.institution, count: stats.count }));

  // 3. Sector Bar Chart
  const sectorCounts: Record<string, number> = {};
  filteredProjects.forEach(p => {
    sectorCounts[p.sector_display] = (sectorCounts[p.sector_display] || 0) + 1;
  });

  const sectorChartData = {
    labels: Object.keys(sectorCounts),
    datasets: [{
      label: 'Number of Projects',
      data: Object.values(sectorCounts),
      backgroundColor: Object.keys(sectorCounts).map(sector => sectorColors[sector] || sectorColors['Other']),
    }]
  };

  const sectorChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
        legend: { 
            display: true, 
            position: 'bottom' as const,
            labels: { font: { weight: 'bold', size: 12 } } // Bold Legend
        } 
    }, 
    scales: { 
      x: { title: { display: true, text: 'Sector' }, grid: { display: false } },
      y: { title: { display: true, text: 'Projects' }, beginAtZero: true }
    } 
  };

  // 4. IP Type Pie Chart
  const ipTypeCounts: Record<string, number> = {};
  filteredProjects
    .filter(p => p.ip_type)
    .forEach(p => {
      ipTypeCounts[p.ip_type] = (ipTypeCounts[p.ip_type] || 0) + 1;
    });

  const pieChartData = {
    labels: Object.keys(ipTypeCounts),
    datasets: [{
      data: Object.values(ipTypeCounts),
      backgroundColor: Object.keys(ipTypeCounts).map(type => ipTypeColors[type] || '#E5E7EB'),
      borderWidth: 1,
      borderColor: 'white'
    }]
  };

  const pieChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
        legend: { 
            display: true, 
            position: 'bottom' as const,
            labels: { font: { weight: 'bold', size: 12 } } // Bold Legend
        },
        datalabels: { 
            color: '#fff',
            font: { weight: 'bold', size: 12 }, // Bold Percentages
            formatter: (value: number, ctx: any) => {
                const total = ctx.chart.data.datasets[0].data.reduce((a:number, b:number) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '';
                return percentage;
            }
        }
    } 
  };

  // --- EXPORTS & UTILS ---
  const handleExcelExport = () => exportToExcel(filteredProjects, `Innovations_${new Date().toLocaleDateString()}`);
  const handleCSVExport = () => {
    const headers = ["Project", "Team", "Institution", "Institution Type", "Hub", "Stage", "IP Type", "IP Route", "Date Filed"];
    const rows = filteredProjects.map(p => [p.name, p.team_name, p.institution_name, p.institution_type, p.hub_name, p.stage_display, p.ip_type, p.ip_route, p.ip_date]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Innovations.csv`;
    link.click();
  };

  const resetFilters = () => {
    setSearchTerm(""); setStageFilter("all"); setHubFilter("all"); setSectorFilter("all"); setYearFilter("all"); setInstTypeFilter("all"); setInstitutionFilter("all"); setCurrentPage(1);
  };

  if (projectsLoading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-[80vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  const hubOptions = Array.from(new Set(processedProjects.map(p => p.hub_name).filter(Boolean))).sort();
  // Unique sorted sectors from current data
  const sectorOptions = Array.from(new Set(processedProjects.map(p => p.sector_display))).sort();
  const yearOptions = Array.from(new Set(processedProjects.map(p => p.ip_year).filter(y => y !== 'N/A'))).sort().reverse();
  const instTypeOptions = Array.from(new Set(processedProjects.map(p => p.institution_type).filter(Boolean))).sort();
  const institutionOptions = Array.from(new Set(processedProjects.map(p => p.institution_name).filter(Boolean))).sort();

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="pb-2 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Lightbulb className="h-7 w-7 text-accent" /> Innovation Lifecycle Management</h1>
            <p className="text-muted-foreground">Track progress of all projects across phases.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExcelExport} variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Excel</Button>
            <Button onClick={handleCSVExport} variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> CSV</Button>
            <Button onClick={() => window.print()} variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" /> PDF</Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="print:hidden">
          <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
            <Input placeholder="Search Project / Team" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stageOrder.map(s => <SelectItem key={s} value={s}>{stageDisplayMap[s]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={hubFilter} onValueChange={setHubFilter}>
              <SelectTrigger><SelectValue placeholder="Hub" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hubs</SelectItem>
                {hubOptions.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger><SelectValue placeholder="Sector" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectorOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={instTypeFilter} onValueChange={setInstTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Inst. Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {instTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
              <SelectTrigger><SelectValue placeholder="Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutionOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger><SelectValue placeholder="IP Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters} className="gap-2 col-span-2 lg:col-span-1"><RotateCcw className="h-4 w-4" /> Reset</Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total Projects" value={filteredProjects.length} icon={Zap} variant="accent" />
          <StatsCard title="IP Registered" value={filteredProjects.filter(p => p.ip_type).length} icon={Scale} variant="info" />
          <StatsCard title="Commercialised" value={filteredProjects.filter(p => p.stage === 'commercialisation').length} icon={BriefcaseBusiness} variant="success" />
          <StatsCard title="Industrialised" value={filteredProjects.filter(p => p.stage === 'industrial').length} icon={Factory} variant="danger" />
        </div>

        {/* --- Charts --- */}
        <div className="space-y-6">
            {/* Top Row: Pipeline and Top Hubs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <InnovationStageFlow data={pipelineData} total={totalProjects} />
                </div>
                <div className="lg:col-span-1">
                    <TopHubsChart data={topHubsData} />
                </div>
            </div>

            {/* Bottom Row: Sector and IP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                        <CardTitle>Projects by Sector</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <Bar data={sectorChartData} options={sectorChartOptions} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                        <PieChart className="h-5 w-5 text-rose-600" />
                        <CardTitle>Registered IP by Type</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 flex justify-center items-center">
                        <Pie data={pieChartData} options={pieChartOptions} />
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>Project Repository ({filteredProjects.length} results)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project / Team</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>IP Type</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.map(p => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewModalProject(p)}>
                    <TableCell>
                      <div className="font-medium text-primary">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.team_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{p.institution_name}</div>
                      <div className="text-xs text-muted-foreground">{p.hub_name || 'No Hub'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: stageColors[p.stage], color: stageColors[p.stage] }}>
                        {p.stage_display || p.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" style={{ backgroundColor: ipTypeColors[p.ip_type] || '#E5E7EB', color: '#0F172A' }}>
                            {p.ip_type || 'Unregistered'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{p.sector_display}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); setViewModalProject(p); }}>
                            <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4 border-t pt-4">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev-1, 1))}>Prev</Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages || 1}</span>
              <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => Math.min(prev+1, totalPages))}>Next</Button>
            </div>
          </CardContent>
        </Card>

        {viewModalProject && <ProjectView project={viewModalProject} onClose={() => setViewModalProject(null)} />}
      </div>
    </DashboardLayout>
  );
}