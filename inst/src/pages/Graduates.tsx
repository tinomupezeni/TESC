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
import { 
  Download, 
  Filter, 
  Loader2, 
  Search, 
  RotateCcw, 
  GraduationCap,
  Users,
  UserCheck,
  TrendingUp,
  PieChart,
  Trash2
} from "lucide-react";
import { getGraduationStats, GraduationStat, getStudents, Student } from "@/services/students.services";
import * as XLSX from "xlsx";
import { AutoGraduationBanner } from "@/components/graduates/AutoGraduationBanner";
import { UploadGraduatesDialog } from "@/components/helpers/UploadGraduatesDialog";
import { MarkGraduatedDialog } from "@/components/graduates/MarkGraduatedDialog";
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
  const [filterGender, setFilterGender] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  
  // Dialog State
  const [studentToGraduate, setStudentToGraduate] = useState<Student | null>(null);

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
      const matchesGender = filterGender === "all" || grad.gender === filterGender;
      const matchesLevel = filterLevel === "all" || grad.selected_level === filterLevel;
      
      return matchesSearch && matchesYear && matchesProgram && matchesGender && matchesLevel;
    });
  }, [graduates, searchQuery, filterYear, filterProgram, filterGender, filterLevel]);

  // Summary Metrics
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const currentYearCount = graduates.filter(g => g.graduation_year === currentYear).length;
  const previousYearCount = graduates.filter(g => g.graduation_year === previousYear).length;

  // Get unique options for filters
  const uniqueYears = Array.from(new Set(graduates.map(g => g.graduation_year).filter(Boolean))).sort((a,b) => (b as number)-(a as number));
  const uniquePrograms = Array.from(new Set(graduates.map(g => g.program_name).filter(Boolean))).sort();
  const uniqueLevels = Array.from(new Set(graduates.map(g => g.selected_level).filter(Boolean))).sort();

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredGraduates.map(g => ({
      "Student ID": g.student_id,
      "Name": g.full_name,
      "Gender": g.gender,
      "Program": g.program_name,
      "Level": g.selected_level,
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

  const handleBulkAction = async (action: 'revert') => {
    if (selectedIds.length === 0) return;
    
    const confirmMessage = `Are you sure you want to REVERT ${selectedIds.length} students back to 'Active' status?`;
      
    if (!window.confirm(confirmMessage)) return;

    setIsProcessingBulk(true);
    try {
      await apiClient.post('/academic/graduates-mgmt/bulk-actions/', {
        student_ids: selectedIds,
        action: action
      });
      toast.success(`Successfully updated ${selectedIds.length} records.`);
      fetchData();
    } catch (error) {
      toast.error("Bulk action failed.");
      console.error(error);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Graduates Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage, verify, and export graduation records for your institution.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredGraduates.length === 0}>
             <Download className="h-4 w-4 mr-2" /> Export
           </Button>
        </div>
      </div>

      <AutoGraduationBanner onGraduated={fetchData} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-foreground">{currentYear} Graduates</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{currentYearCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Current academic year</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-foreground">{previousYear} Graduates</CardDescription>
            <CardTitle className="text-3xl font-bold">{previousYearCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Previous year comparison</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-foreground">Total Records</CardDescription>
            <CardTitle className="text-3xl font-bold">{graduates.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All time graduates</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Updated: Removed Bulk Upload */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="hover:bg-muted/50 transition-colors border-dashed">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Graduate Records</h3>
                <p className="text-sm text-muted-foreground mt-1">View and manage individual graduate records.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Alumni..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 text-blue-600 border-blue-200 bg-blue-50"
                    onClick={() => handleBulkAction('revert')}
                    disabled={isProcessingBulk}
                  >
                     <RotateCcw className="h-4 w-4 mr-2" /> Revert Status
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-full sm:w-[140px] h-9">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger className="w-full sm:w-[200px] h-9">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {uniquePrograms.map(prog => (
                    <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger className="w-full sm:w-[140px] h-9">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <SelectValue placeholder="Program Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setFilterYear("all");
                  setFilterProgram("all");
                  setFilterGender("all");
                  setFilterLevel("all");
                  setSearchQuery("");
                }}
                className="h-9 text-muted-foreground"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
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
                  <TableHead className="text-xs">Gender</TableHead>
                  <TableHead className="text-xs">Program</TableHead>
                  <TableHead className="text-xs">Level</TableHead>
                  <TableHead className="text-xs">Year</TableHead>
                  <TableHead className="text-xs">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingGrads ? (
                   <TableRow>
                     <TableCell colSpan={8} className="h-24 text-center">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                     </TableCell>
                   </TableRow>
                ) : filteredGraduates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
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
                      <TableCell className="text-[10px] sm:text-xs">{grad.gender}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs truncate max-w-[200px]">{grad.program_name}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs">{grad.selected_level || "N/A"}</TableCell>
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
             <p className="text-xs text-muted-foreground px-2 sm:px-0">
               Showing {filteredGraduates.length} graduates
             </p>
             {selectedIds.length > 0 && (
               <p className="text-xs font-medium text-primary px-2 sm:px-0">
                 {selectedIds.length} selected
               </p>
             )}
          </div>
        </CardContent>
      </Card>
      
      <MarkGraduatedDialog 
        student={studentToGraduate} 
        onClose={() => setStudentToGraduate(null)} 
        onSuccess={fetchData}
      />
    </div>
  );
};


export default Graduates;
