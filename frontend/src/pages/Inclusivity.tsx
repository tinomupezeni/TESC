import { useEffect, useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  User,
  Accessibility
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getInclusivityStudents, InclusivityStudent } from "@/services/reports.services";

export default function Inclusivity() {
  const [searchTerm, setSearchTerm] = useState("");
  const [instFilter, setInstFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [students, setStudents] = useState<InclusivityStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getInclusivityStudents();
      setStudents(data.results);
    } catch (error) {
      console.error("Failed to fetch inclusivity students", error);
      toast.error("Failed to load inclusivity data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const institutions = useMemo(() => {
    const instSet = new Set(students.map(s => s.institution_name).filter(Boolean));
    return Array.from(instSet).sort();
  }, [students]);

  const categories = useMemo(() => {
    const catSet = new Set(students.map(s => s.inclusivity_category).filter(Boolean));
    return Array.from(catSet).sort();
  }, [students]);

  const filteredData = useMemo(() => {
    return students.filter(student => {
      const name = student.full_name || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.inclusivity_category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesInst = instFilter === "all" || student.institution_name === instFilter;
      const matchesGender = genderFilter === "all" || student.gender === genderFilter;
      const matchesCategory = categoryFilter === "all" || student.inclusivity_category === categoryFilter;

      return matchesSearch && matchesInst && matchesGender && matchesCategory;
    });
  }, [students, searchTerm, instFilter, genderFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const male = filteredData.filter(s => s.gender === "Male").length;
    const female = filteredData.filter(s => s.gender === "Female").length;
    const maleRatio = total > 0 ? ((male / total) * 100).toFixed(1) : "0";
    const femaleRatio = total > 0 ? ((female / total) * 100).toFixed(1) : "0";
    return { total, male, female, maleRatio, femaleRatio };
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredData, currentPage]);

  const resetFilters = () => {
    setSearchTerm("");
    setInstFilter("all");
    setGenderFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Accessibility className="h-6 w-6 sm:h-8 sm:h-8 text-blue-600" />
            Inclusivity Report
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            System-wide statistics and records of students with special accessibility needs and disability profiles.
          </p>
        </div>

        {/* Filters Section */}
        <Card className="p-4 border-blue-100 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search name, ID, category..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <Select value={instFilter} onValueChange={(v) => { setInstFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Disability/Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={resetFilters} className="text-slate-500 font-bold hover:text-blue-600">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset Filters
            </Button>
          </div>
        </Card>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Total Inclusivity Records" value={stats.total} icon={Users} variant="default" />
          <StatsCard title="Male Records" value={`${stats.male} (${stats.maleRatio}%)`} icon={User} variant="default" />
          <StatsCard title="Female Records" value={`${stats.female} (${stats.femaleRatio}%)`} icon={User} variant="accent" />
        </div>

        {/* Data Table Card */}
        <Card className="shadow-sm border-blue-50">
          <CardContent className="p-0 sm:pt-6">
            <div className="rounded-md border border-blue-100 dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                    <TableHead className="font-bold w-[120px]">Student ID</TableHead>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Program</TableHead>
                    <TableHead className="font-bold">Disability / Category</TableHead>
                    <TableHead className="font-bold">Gender</TableHead>
                    <TableHead className="font-bold text-right">Institution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 animate-pulse font-bold text-blue-600">
                        Loading inclusivity records...
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No inclusivity records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((student) => (
                      <TableRow key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-mono text-xs text-blue-700 dark:text-blue-400">{student.student_id_number}</TableCell>
                        <TableCell className="font-bold text-sm text-slate-900 dark:text-slate-100">{student.full_name}</TableCell>
                        <TableCell className="text-sm">{student.program_name}</TableCell>
                        <TableCell className="text-sm font-semibold text-rose-600 dark:text-rose-400">{student.inclusivity_category}</TableCell>
                        <TableCell className="text-sm">{student.gender}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{student.institution_name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                Showing <strong>{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of {filteredData.length} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-blue-200 h-8 px-2"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <div className="text-xs font-bold px-2 whitespace-nowrap">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-blue-200 h-8 px-2"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
