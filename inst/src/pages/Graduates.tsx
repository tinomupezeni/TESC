import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
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
import { Download, Filter, TrendingUp, Loader2, PieChart } from "lucide-react";
import { getGraduationStats, GraduationStat } from "@/services/students.services";
import * as XLSX from "xlsx"; // Reusing xlsx for export

const Graduates = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GraduationStat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterYear, setFilterYear] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");

  // Fetch Data
  useEffect(() => {
    if (user?.institution?.id) {
      const loadStats = async () => {
        setLoading(true);
        try {
          const data = await getGraduationStats(user.institution.id);
          setStats(data || []);
        } catch (error) {
          console.error("Failed to load graduation stats", error);
        } finally {
          setLoading(false);
        }
      };
      loadStats();
    }
  }, [user]);

  // Derived Data (Filters)
  const filteredStats = useMemo(() => {
    return stats.filter(stat => {
      const matchesYear = filterYear === "all" || stat.graduation_year.toString() === filterYear;
      const matchesProgram = filterProgram === "all" || stat.program__name === filterProgram;
      return matchesYear && matchesProgram;
    });
  }, [stats, filterYear, filterProgram]);

  // Summary Metrics
  const currentYear = new Date().getFullYear();
  const totalGraduatesCurrent = stats
    .filter(s => s.graduation_year === currentYear)
    .reduce((sum, s) => sum + s.total_graduates, 0);
    
  const totalGraduatesPrev = stats
    .filter(s => s.graduation_year === currentYear - 1)
    .reduce((sum, s) => sum + s.total_graduates, 0);

  // Get unique options for filters
  const uniqueYears = Array.from(new Set(stats.map(s => s.graduation_year))).sort((a,b) => b-a);
  const uniquePrograms = Array.from(new Set(stats.map(s => s.program__name))).sort();

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredStats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Graduation_Stats");
    XLSX.writeFile(wb, "Graduation_Report.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Graduates & Completions
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Analytics based on student records marked as 'Graduated'
        </p>
      </div>

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
                {stats.reduce((acc, curr) => acc + curr.total_graduates, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">All time graduates</p>
          </CardContent>
        </Card>
        {/* Placeholder for future metric */}
        <Card className="bg-muted/10 border-dashed hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">Average Pass Rate</CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-muted-foreground">N/A</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
             <p className="text-[10px] sm:text-xs text-muted-foreground">Historical data</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Graduation Statistics</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Aggregated by Program and Year
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredStats.length === 0} className="w-full sm:w-auto h-9">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
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
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Year</TableHead>
                  <TableHead className="text-xs">Program</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">Level</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                  <TableHead className="text-emerald-600 hidden sm:table-cell text-xs">Dist.</TableHead>
                  <TableHead className="text-blue-600 hidden sm:table-cell text-xs">Credit</TableHead>
                  <TableHead className="text-amber-600 hidden sm:table-cell text-xs">Pass</TableHead>
                  <TableHead className="text-xs">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={8} className="h-24 text-center">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                     </TableCell>
                   </TableRow>
                ) : filteredStats.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground text-xs"
                    >
                      <PieChart className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStats.map((stat, index) => {
                    const passRate = ((stat.total_graduates > 0) ? 100 : 0).toFixed(1); // Placeholder logic
                    
                    return (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{stat.graduation_year}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[150px] sm:max-w-none">{stat.program__name}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        <Badge variant="outline" className="text-[10px]">{stat.program__level}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-[10px] sm:text-xs">
                        {stat.total_graduates}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{stat.distinctions}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{stat.credits}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{stat.passes}</TableCell>
                      <TableCell>
                        <span className="font-mono text-[10px] sm:text-xs">{passRate}%</span>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Graduates;