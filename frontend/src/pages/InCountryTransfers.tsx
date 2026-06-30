import { useEffect, useState, useMemo, useCallback } from "react";
import { ReportBuilder } from "@/components/reports";
import { ExportButtons } from "@/components/ExportButtons";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle
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
import { getInCountryTransfers, InCountryTransfer } from "@/services/reports.services";

export default function InCountryTransfers() {
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  const exportData = (type: 'csv' | 'excel') => {
    const headers = ["Student ID", "Name", "Program", "Gender", "Institution"];
    const rows = filteredData.map((s: any) => [
      s.student_id_number || s.student_id || "N/A",
      s.full_name || "N/A",
      s.program_name || "N/A",
      s.gender || "N/A",
      s.institution_name || "N/A"
    ]);

    let content = "";
    let mimeType = "";
    let fileExtension = "";

    if (type === 'csv') {
      content = [headers, ...rows].map(e => e.join(",")).join("\n");
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
    } else {
      content = [headers.join("\\t"), ...rows.map(r => r.join("\\t"))].join("\n");
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      fileExtension = 'xls';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Export_Records.${fileExtension}`;
    link.click();
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [fromInstFilter, setFromInstFilter] = useState("all");
  const [toInstFilter, setToInstFilter] = useState("all");
  const [transfers, setTransfers] = useState<InCountryTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch globally from backend
      const data = await getInCountryTransfers();
      setTransfers(data.results || []);
    } catch (error) {
      console.error("Failed to fetch transfers", error);
      toast.error("Failed to load in-country transfers data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const fromInstitutions = useMemo(() => {
    const instSet = new Set(transfers.map(t => t.from_institution).filter(Boolean));
    return Array.from(instSet).sort();
  }, [transfers]);

  const toInstitutions = useMemo(() => {
    const instSet = new Set(transfers.map(t => t.to_institution).filter(Boolean));
    return Array.from(instSet).sort();
  }, [transfers]);

  const filteredData = useMemo(() => {
    return transfers.filter(transfer => {
      const name = transfer.student_name || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.student_id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.from_institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.to_institution.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFrom = fromInstFilter === "all" || transfer.from_institution === fromInstFilter;
      const matchesTo = toInstFilter === "all" || transfer.to_institution === toInstFilter;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [transfers, searchTerm, fromInstFilter, toInstFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredData, currentPage]);

  const resetFilters = () => {
    setSearchTerm("");
    setFromInstFilter("all");
    setToInstFilter("all");
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:mb-8">
<div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Shuffle className="h-6 w-6 sm:h-8 sm:h-8 text-blue-600" />
            In-Country Transfers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            System-wide statistics and records of students transferring between institutions within the country.
          </p>
        </div>
<ExportButtons onExport={exportData} onGenerateReport={() => setReportBuilderOpen(true)} />
</div>

        {/* Filters Section */}
        <Card className="p-4 border-blue-100 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search name, ID, institution..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <Select value={fromInstFilter} onValueChange={(v) => { setFromInstFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="From Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Origin Institutions</SelectItem>
                {fromInstitutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={toInstFilter} onValueChange={(v) => { setToInstFilter(v); setCurrentPage(1); }}>
              <SelectTrigger><SelectValue placeholder="To Institution" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destination Institutions</SelectItem>
                {toInstitutions.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={resetFilters} className="text-slate-500 font-bold hover:text-blue-600">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset Filters
            </Button>
          </div>
        </Card>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <StatsCard title="Total In-Country Transfers" value={filteredData.length} icon={Users} variant="default" />
        </div>

        {/* Data Table Card */}
        <Card className="shadow-sm border-blue-50">
          <CardContent className="p-0 sm:pt-6">
            <div className="rounded-md border border-blue-100 dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                    <TableHead className="font-bold w-[120px]">Student ID</TableHead>
                    <TableHead className="font-bold">Student Name</TableHead>
                    <TableHead className="font-bold">From Institution</TableHead>
                    <TableHead className="font-bold">To Institution</TableHead>
                    <TableHead className="font-bold text-right">Transfer Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 animate-pulse font-bold text-blue-600">
                        Loading transfer records...
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No transfer records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((transfer) => (
                      <TableRow key={transfer.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-mono text-xs text-blue-700 dark:text-blue-400">{transfer.student_id_number}</TableCell>
                        <TableCell className="font-bold text-sm text-slate-900 dark:text-slate-100">{transfer.student_name}</TableCell>
                        <TableCell className="text-sm font-medium text-rose-600 dark:text-rose-400">{transfer.from_institution}</TableCell>
                        <TableCell className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{transfer.to_institution}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{new Date(transfer.transfer_date).toLocaleDateString()}</TableCell>
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
      <ReportBuilder reportType="students" open={reportBuilderOpen} onOpenChange={setReportBuilderOpen} />
</DashboardLayout>
  );
}
