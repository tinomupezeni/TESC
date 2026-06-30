import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaffView } from "@/components/staff view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserCheck,
  Download,
  Filter,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileText
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ReportBuilder } from "@/components/reports";

import { useState, useMemo, useEffect } from "react";
import { getAllStaff } from "@/services/academic.service";
import { Staff } from "@/lib/types/academic.types";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaffStatistics } from "@/hooks/useStaff";
import { exportToExcel } from "@/lib/export-utils"; 

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
  </TableRow>
);
const rowColors = [
  "#EAF6FF", // IcyWhisper
  "#DFF2FE", // FrostedBreeze
  "#D5EEFD", // WinterSky
  "#C9E9FC", // Crystal Mist
  "#BFE4FA", // PaleArctic
  "#B3DFFA", // SoftCloud
  "#A6DAF8", // MorningFog
  "#9CD5F5", // DewyHorizon
  "#92CFF3", // Bluebell Glow
  "#88CAF1", // MistyWave
  "#7EC5EF", // Frozen Lake
  "#74BFEA", // GentleStream
];

export default function StaffPage() {
  // --- STATS HOOK ---
  const { data: statsData, loading: statsLoading } = useStaffStatistics();

  // --- STATE ---
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [instFilter, setInstFilter] = useState("all");
  const [posFilter, setPosFilter] = useState("all");
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getAllStaff();
        setAllStaff(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // --- DYNAMIC FILTER OPTIONS ---
  const filterOptions = useMemo(() => {
    return {
      institutions: Array.from(new Set(allStaff.map(s => s.institution_name))).filter(Boolean).sort(),
      positions: Array.from(new Set(allStaff.map(s => s.position))).filter(Boolean).sort()
    };
  }, [allStaff]);

  // --- EXPORT & GENERATION ---
  const handleExcelExport = () => {
    exportToExcel(filteredStaff, `Staff_Report_${new Date().toLocaleDateString()}`);
  };

  const handleCSVExport = () => {
    const headers = ["Employee ID", "Full Name", "Institution", "Department", "Position", "Status"];
    const rows = filteredStaff.map(s => [
      s.employee_id, s.full_name, s.institution_name, s.department_name || "N/A", s.position, s.is_active ? "Active" : "Inactive"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Staff_Report.csv`;
    link.click();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setInstFilter("all");
    setPosFilter("all");
    setCurrentPage(1);
  };

  // --- FILTER LOGIC ---
  const filteredStaff = useMemo(() => {
    if (!allStaff) return [];
    return allStaff.filter((staff) => {
      const search = searchTerm.toLowerCase();
      const name = staff.full_name || "";
      const empId = staff.employee_id || "";
      const email = staff.email || "";

      const matchesSearch =
        name.toLowerCase().includes(search) ||
        empId.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search);
      
      const matchesStatus =
        selectedStatus === "all" || 
        (selectedStatus === "Active" ? staff.is_active : !staff.is_active);

      const matchesInst = instFilter === "all" || staff.institution_name === instFilter;
      const matchesPos = posFilter === "all" || staff.position === posFilter;
        
      return matchesSearch && matchesStatus && matchesInst && matchesPos;
    });
  }, [allStaff, searchTerm, selectedStatus, instFilter, posFilter]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStaff, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, instFilter, posFilter]);

  if (isLoading && statsLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">STAFF RECORDS</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage and track institutional personnel</p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handleExcelExport} disabled={filteredStaff.length === 0} className="h-9">
                <Download className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Excel</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleCSVExport} disabled={filteredStaff.length === 0} className="h-9">
                <Download className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">CSV</span>
              </Button>
              <Button size="sm" onClick={() => setReportBuilderOpen(true)} className="bg-green-600 hover:bg-green-700 h-9 font-bold">
                <FileText className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Generate Report</span>
              </Button>
              <Button size="sm" onClick={() => setReportBuilderOpen(true)} className="bg-green-600 hover:bg-green-700 h-9">
                <FileText className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Report</span>
              </Button>
            </div>
          </div>

          {/* Stats Summary Cards - Now Dynamic based on filteredStaff */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
  <StatsCard 
    title="TOTAL STAFF" 
    // Calculate total from the filtered list
    value={filteredStaff.length.toLocaleString()} 
    icon={Users} 
    variant="default" 
  />
  <StatsCard 
    title="MALE STAFF" 
    value={filteredStaff.filter(s => (s as any).gender === "Male").length.toLocaleString()} 
    icon={UserCheck} 
    variant="default" 
  />
  <StatsCard 
    title="FEMALE STAFF" 
    value={filteredStaff.filter(s => (s as any).gender === "Female").length.toLocaleString()} 
    icon={UserCheck} 
    variant="default" 
  />
  <StatsCard 
    title="ACTIVE STAFF RATE" 
    // Calculate percentage based on the current filtered view
    value={`${filteredStaff.length > 0 
      ? ((filteredStaff.filter(s => (s as any).is_active).length / filteredStaff.length) * 100).toFixed(1) 
      : 0}%`} 
    icon={UserCheck} 
    variant="default" 
  />
</div>

       {/* Search & Filter - Hidden in Print */}
<Card className="print:hidden bg-stone-100 text-slate-800">
  <CardHeader className="p-4 sm:p-6">
    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
      <Filter className="h-5 w-5" /> Search and Filter
    </CardTitle>
  </CardHeader>
  <CardContent className="p-4 sm:p-6 pt-0">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <div className="lg:col-span-1">
        <Input
          placeholder="Search name, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white border-stone-300 text-slate-900 placeholder:text-slate-400"
        />
      </div>
      <Select value={instFilter} onValueChange={setInstFilter}>
        <SelectTrigger className="bg-white border-stone-300 text-slate-900">
          <SelectValue placeholder="Institution" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Institutions</SelectItem>
          {filterOptions.institutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={posFilter} onValueChange={setPosFilter}>
        <SelectTrigger className="bg-white border-stone-300 text-slate-900">
          <SelectValue placeholder="Position" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Positions</SelectItem>
          {filterOptions.positions.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="bg-white border-stone-300 text-slate-900">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        onClick={resetFilters}
        className="text-slate-700 hover:text-slate-900 hover:bg-stone-200 w-full sm:w-auto"
      >
        <RotateCcw className="h-4 w-4 mr-2" /> Reset
      </Button>
    </div>
  </CardContent>
</Card>

          <Card className="print:shadow-none print:border-none">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 p-4 sm:p-6">
              <div>
                <CardTitle className="text-base sm:text-lg">Personnel List ({filteredStaff.length})</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 print:hidden">
                  Showing {filteredStaff.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredStaff.length)}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Prev</span>
                </Button>
                <div className="text-xs sm:text-sm font-medium px-2 whitespace-nowrap">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || totalPages === 0}
                  className="h-8 px-2"
                >
                  <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">Institution</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden sm:table-cell">Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right print:hidden">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500 py-10">
                        <AlertCircle className="inline-block mr-2" /> Failed to load staff data.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStaff.map((staff, index) => (
                      <TableRow
                        key={staff.id}
                        style={{ backgroundColor: rowColors[index % rowColors.length] }}
                        className="text-slate-800" // ensure dark text for readability
                      >
                        <TableCell className="font-medium text-xs sm:text-sm">{staff.employee_id}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{staff.full_name}</TableCell>
                        <TableCell className="hidden lg:table-cell">{staff.institution_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{staff.department_name || "N/A"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{staff.position}</TableCell>
                        <TableCell>
                          <Badge variant={staff.is_active ? "default" : "outline"} className="text-[10px] sm:text-xs">
                            {staff.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedStaff(staff)} className="h-8 px-2">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

      <StaffView data={selectedStaff} setData={setSelectedStaff} />
      <ReportBuilder reportType="staff" open={reportBuilderOpen} onOpenChange={setReportBuilderOpen} />
    </>
  );
}