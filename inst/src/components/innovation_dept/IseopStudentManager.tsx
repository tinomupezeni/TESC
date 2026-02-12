import { useState, useRef } from "react";
import { 
  Search, Filter, MoreVertical, Pencil, 
  ChevronLeft, ChevronRight, Loader2, Plus, Download, Trash2 
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Imports for Logic
import { Project } from "@/services/iseop.services"; 
import { ProjectFormDialog } from "./IseopForms"; // Using existing forms

interface IseopStudentManagerProps {
  students: Project[];
  loading?: boolean;
  onRefresh: () => void;
}

const IseopStudentManager = ({ students = [], loading, onRefresh }: IseopStudentManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const itemsPerPage = 10;

  // --- Bulk Upload Logic ---
  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulation of upload - replace with your actual API call
    try {
      console.log("Uploading:", file.name);
      // await iseopService.upload(file); 
      setTimeout(() => {
        alert("Upload successful!");
        onRefresh();
        setIsUploading(false);
      }, 1500);
    } catch (error) {
      alert("Upload failed");
      setIsUploading(false);
    }
  };

  // --- Filtering ---
  const filtered = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.team_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === "all" || s.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Students Directory</CardTitle>
              <CardDescription>Manage ISEOP student enrollments and project stages</CardDescription>
            </div>
            
            <div className="flex gap-2">
              {/* Bulk Upload hidden input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, .xlsx" 
                onChange={handleBulkUpload}
              />
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Bulk Upload
              </Button>

              {/* Add Student Form Trigger */}
              <ProjectFormDialog 
                onSuccess={onRefresh}
                trigger={
                  <Button className="gap-2 bg-[#002e5b] hover:bg-[#001f3d]">
                    <Plus className="h-4 w-4" /> Add Student
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="ideation">Ideation</SelectItem>
                <SelectItem value="prototype">Prototype</SelectItem>
                <SelectItem value="incubation">Incubation</SelectItem>
                <SelectItem value="commercialisation">Commercialisation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Student ID</TableHead>
                  <TableHead className="font-bold">Name & Team</TableHead>
                  <TableHead className="font-bold">Sector</TableHead>
                  <TableHead className="font-bold">Stage</TableHead>
                  <TableHead className="font-bold">Revenue</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                ) : paginatedData.map((student) => (
                  <TableRow key={student.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-blue-700">STU-{student.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.team_name}</div>
                    </TableCell>
                    <TableCell className="capitalize">{student.sector}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                        {student.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-emerald-600 font-medium">
                      ${Number(student.revenue_generated).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ProjectFormDialog 
                            project={student} 
                            onSuccess={onRefresh}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit Student
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IseopStudentManager;