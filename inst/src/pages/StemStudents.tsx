import { useEffect, useState, useCallback } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen, // Example icon, maybe change to something more STEM-related
  Users,
  Loader2,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Components & Services
import { BulkUploadResolver } from "@/components/common/BulkUploadResolver";
import { AddStudentDialog } from "@/components/AddStudentDialog";
import { StemStudent, StemStudentsAPIResponse, getStemStudents } from "../services/reports.services";


const StemStudents = () => {
  const { user } = useAuth();
  
  const [stemStudents, setStemStudents] = useState<StemStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Summary stats states
  const [totalStudents, setTotalStudents] = useState(0);
  const [maleStudents, setMaleStudents] = useState(0);
  const [femaleStudents, setFemaleStudents] = useState(0);


  const fetchStemStudents = useCallback(async () => {
    if (!user?.institution?.id) return;
    try {
      setLoading(true);
      const apiResponse: StemStudentsAPIResponse = await getStemStudents(
        user.institution.id,
        searchQuery
      );
      setStemStudents(apiResponse.results);
      setTotalStudents(apiResponse.total_students);
      setMaleStudents(apiResponse.male_students);
      setFemaleStudents(apiResponse.female_students);

    } catch (error) {
      console.error("Failed to fetch STEM students", error);
      toast.error("Failed to load STEM students");
      setStemStudents([]);
      setTotalStudents(0);
      setMaleStudents(0);
      setFemaleStudents(0);
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery]);

  useEffect(() => {
    fetchStemStudents();
  }, [fetchStemStudents]);

  const filteredStemStudents = stemStudents; // Filtering already applied by fetchStemStudents

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          STEM Students
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          View and manage students enrolled in STEM programs for{" "}
          <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      {/* Main Content Area */}
      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">STEM Students Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Comprehensive list of STEM program students</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <AddStudentDialog onStudentAdded={fetchStemStudents} />
              <div className="flex-1 sm:flex-none">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>Bulk Upload STEM Students</DialogTitle></DialogHeader>
                    <BulkUploadResolver moduleType="stem_students" onSuccess={fetchStemStudents} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total STEM Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Male</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maleStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Female</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{femaleStudents}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 sm:h-10"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-xs">Student ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Program</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">Gender</TableHead>
                  <TableHead className="text-right text-xs">Institution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading STEM students...
                    </TableCell>
                  </TableRow>
                ) : filteredStemStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                      No STEM students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStemStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{student.student_id_number}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{student.full_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{student.program_name}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{student.gender}</TableCell>
                      <TableCell className="text-right text-[10px] sm:text-xs">{student.institution_name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StemStudents;