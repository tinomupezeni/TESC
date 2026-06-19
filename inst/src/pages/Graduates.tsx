import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Filter, TrendingUp, Loader2, PieChart, Search, Trash2, RotateCcw, GraduationCap } from "lucide-react";
import { getGraduationStats, GraduationStat } from "@/services/graduates.services";
import { getStudents, Student } from "@/services/students.services";
import * as XLSX from "xlsx";
import { AutoGraduationBanner } from "@/components/graduates/AutoGraduationBanner";
import { UploadGraduatesDialog } from "@/components/helpers/UploadGraduatesDialog";
import apiClient from "@/services/api";
import { toast } from "sonner";

const Graduates = () => {
  const { user } = useAuth();
  
  // Stats State
  const [stats, setStats] = useState<GraduationStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Graduates List State
  const [graduates, setGraduates] = useState<Student[]>([]);
  const [loadingGrads, setLoadingGrads] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Fetch Data
  const fetchData = useCallback(async () => {
    if (!user?.institution?.id) return;
    setLoadingStats(true);
    setLoadingGrads(true);
    
    try {
      const [statsData, studentsData] = await Promise.all([
        getGraduationStats(user.institution.id),
        getStudents({ institution: user.institution.id, status: 'Graduated' } as any)
      ]);
      setStats(statsData || []);
      setGraduates(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error("Failed to load graduation data", error);
    } finally {
      setLoadingStats(false);
      setLoadingGrads(false);
      setSelectedIds([]); // Clear selection on refresh
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Data (Filters)
  const filteredGraduates = useMemo(() => {
    return graduates.filter(grad => {
      const matchesSearch = 
        (grad.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (grad.student_id?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesYear = filterYear === "all" || grad.graduation_year?.toString() === filterYear;
      const matchesProgram = filterProgram === "all" || grad.program_name === filterProgram;
      
      return matchesSearch && matchesYear && matchesProgram;
    });
  }, [graduates, searchQuery, filterYear, filterProgram]);

  // Summary Metrics
  const currentYear = new Date().getFullYear();
  const totalGraduatesCurrent = stats
    .filter(s => s.graduation_year === currentYear)
    .reduce((sum, s) => sum + s.total_graduates, 0);
    
  const totalGraduatesPrev = stats
    .filter(s => s.graduation_year === currentYear - 1)
    .reduce((sum, s) => sum + s.total_graduates, 0);

  // Get unique options for filters
  const uniqueYears = Array.from(new Set(graduates.map(g => g.graduation_year).filter(Boolean))).sort((a,b) => (b as number)-(a as number));
  const uniquePrograms = Array.from(new Set(graduates.map(g => g.program_name).filter(Boolean))).sort();

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredGraduates.map(g => ({
      "Student ID": g.student_id,
      "Name": g.full_name,
      "Gender": g.gender,
      "Program": g.program_name,
      "Graduation Year": g.graduation_year,
      "Final Grade": g.final_grade
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Graduates_List");
    XLSX.writeFile(wb, "Graduates_Export.xlsx");
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGraduates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGraduates.map(g => g.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'delete' | 'revert') => {
    if (selectedIds.length === 0) return;
    
    const isDelete = action === 'delete';
    const confirmMessage = isDelete 
      ? `Are you sure you want to completely DELETE ${selectedIds.length} graduate records? This cannot be undone.`
      : `Are you sure you want to REVERT ${selectedIds.length} students back to 'Active' status?`;
      
    if (!window.confirm(confirmMessage)) return;

    setIsProcessingBulk(true);
    try {
      const response = await apiClient.post('/academic/graduates-mgmt/bulk-actions/', {
        student_ids: selectedIds,
        action: action
      });
      toast.success(response.data.message || `Successfully processed ${selectedIds.length} records`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to process bulk action");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Graduates Management
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage, verify, and export graduation records for your institution.
        </p>
      </div>

      <AutoGraduationBanner onSuccess={fetchData} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">{currentYear} Graduates</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl text-primary">
              {totalGraduatesCurrent}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Current academic year
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">{currentYear - 1} Graduates</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{totalGraduatesPrev}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Previous year comparison</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">Total Records</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">
                {graduates.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">All time graduates</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/10 border-dashed hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">Quick Actions</CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-muted-foreground flex gap-2">
              <UploadGraduatesDialog onSuccess={fetchData} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
             <p className="text-[10px] sm:text-xs text-muted-foreground">Import historical data</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Graduate Records</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage individual graduate records.
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="h-9 border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => handleBulkAction('revert')} disabled={isProcessingBulk}>
                    {isProcessingBulk ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                    Revert to Active
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleBulkAction('delete')} disabled={isProcessingBulk}>
                    {isProcessingBulk ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Delete Selected
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredGraduates.length === 0} className="w-full sm:w-auto h-9">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 sm:h-10"
              />
            </div>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full md:w-[200px] h-9 sm:h-10 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Filter className="h-3.5 w-3.5 mr-2 shrink-0" />
                  <SelectValue placeholder="All Years" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map(y => (
                    <SelectItem key={y as number} value={(y as number).toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="w-full md:w-[250px] h-9 sm:h-10 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Filter className="h-3.5 w-3.5 mr-2 shrink-0" />
                  <SelectValue placeholder="All Programs" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {uniquePrograms.map(p => (
                    <SelectItem key={p as string} value={p as string}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] px-2 text-center">
                    <Checkbox 
                      checked={filteredGraduates.length > 0 && selectedIds.length === filteredGraduates.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Program</TableHead>
                  <TableHead className="text-xs">Year</TableHead>
                  <TableHead className="text-xs">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingGrads ? (
                   <TableRow>
                     <TableCell colSpan={6} className="h-24 text-center">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                     </TableCell>
                   </TableRow>
                ) : filteredGraduates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground text-xs"
                    >
                      <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No graduate records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGraduates.map((grad) => (
                    <TableRow key={grad.id} className={selectedIds.includes(grad.id) ? "bg-muted/50" : ""}>
                      <TableCell className="px-2 text-center">
                        <Checkbox 
                          checked={selectedIds.includes(grad.id)}
                          onCheckedChange={() => toggleSelect(grad.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{grad.student_id}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm">{grad.full_name}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs truncate max-w-[200px]">{grad.program_name}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs">{grad.graduation_year}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {grad.final_grade || "N/A"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
             <p className="text-xs text-muted-foreground">
               Showing {filteredGraduates.length} graduates
             </p>
             {selectedIds.length > 0 && (
               <p className="text-xs font-medium text-primary">
                 {selectedIds.length} selected
               </p>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Graduates;