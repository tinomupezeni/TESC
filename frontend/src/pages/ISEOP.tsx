import { useState, useMemo, useEffect } from "react";
import { getAllIseopStudents, IseopStudent } from "@/services/iseop.service";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  GraduationCap,
  Clock,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
  </TableRow>
);

export default function ISEOP() {
  const [allStudents, setAllStudents] = useState<IseopStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // --- FILTERS STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInstitution, setSelectedInstitution] = useState("all");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const students = await getAllIseopStudents();
        setAllStudents(students || []);
      } catch (error) {
        console.error("Failed to fetch ISEOP students:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // --- DYNAMIC FILTER OPTIONS ---
  const filterOptions = useMemo(() => {
    return {
      institutions: Array.from(new Set(allStudents.map(s => s.institution_name))).filter(Boolean).sort(),
      statuses: Array.from(new Set(allStudents.map(s => s.status))).filter(Boolean).sort(),
    };
  }, [allStudents]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedInstitution("all");
    setCurrentPage(1);
  };

  // --- FILTERING LOGIC ---
  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];
    return allStudents.filter((student) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        student.full_name?.toLowerCase().includes(search) ||
        student.student_id?.toLowerCase().includes(search) ||
        student.email?.toLowerCase().includes(search);
      const matchesStatus =
        selectedStatus === "all" || student.status === selectedStatus;
      const matchesInst =
        selectedInstitution === "all" || student.institution_name === selectedInstitution;

      return matchesSearch && matchesStatus && matchesInst;
    });
  }, [allStudents, searchTerm, selectedStatus, selectedInstitution]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedInstitution]);

  // --- EXPORT LOGIC ---
  const exportData = (type: 'csv' | 'excel') => {
    const headers = ["Student ID", "Full Name", "Institution", "Email", "Status"];
    const rows = filteredStudents.map(d => [
      d.student_id,
      d.full_name,
      d.institution_name,
      d.email || 'N/A',
      d.status
    ]);

    let content = "";
    let mimeType = "";
    let fileExtension = "";

    if (type === 'csv') {
      content = [headers, ...rows].map(e => e.join(",")).join("\n");
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
    } else {
      content = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      fileExtension = 'xls';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ISEOP_Students.${fileExtension}`;
    link.click();
  };

  // --- STATS CALCULATION ---
  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter((s) => s.status === "Active/Enrolled").length;
  const completedStudents = filteredStudents.filter((s) => s.status === "Completed").length;
  const deferredStudents = filteredStudents.filter((s) => s.status === "Deferred").length;

  const activePercentage = totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : "0";
  const completedPercentage = totalStudents > 0 ? ((completedStudents / totalStudents) * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ISEOP Students</h1>
            <p className="text-muted-foreground">
              Industrial Skills and Entrepreneurship Outreach Programme
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={() => exportData('excel')} className="flex gap-2 font-bold border-blue-200">
              <Download className="h-4 w-4" /> Excel
            </Button>
            <Button onClick={() => exportData('csv')} variant="outline" className="flex gap-2 font-bold border-blue-200">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print:grid print:grid-cols-4">
          <StatsCard title="Total ISEOP Students" value={totalStudents.toLocaleString()} icon={Users} variant="accent" />
          <StatsCard title="Active/Enrolled" value={activeStudents.toLocaleString()} description={`${activePercentage}%`} icon={UserCheck} variant="success" />
          <StatsCard title="Completed" value={completedStudents.toLocaleString()} description={`${completedPercentage}%`} icon={GraduationCap} variant="success" />
          <StatsCard title="Deferred" value={deferredStudents.toLocaleString()} icon={Clock} variant="warning" />
        </div>

        {/* FILTERS SECTION */}
        <Card className="p-4 border-blue-100 shadow-sm print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
              <SelectTrigger><SelectValue placeholder="Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {filterOptions.institutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active/Enrolled">Active/Enrolled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Deferred">Deferred</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={resetFilters} className="text-slate-500 font-bold hover:text-blue-600">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-4 print:hidden">
            <div>
              <CardTitle>ISEOP Student Records ({filteredStudents.length})</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages || totalPages === 0}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500 py-10">
                      <AlertCircle className="inline-block mr-2" /> Failed to load data.
                    </TableCell>
                  </TableRow>
                ) : paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No ISEOP students found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.institution_name}</TableCell>
                      <TableCell>{student.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.status === "Active/Enrolled" ? "default" :
                            student.status === "Completed" ? "secondary" : "outline"
                          }
                        >
                          {student.status}
                        </Badge>
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
  );
}
