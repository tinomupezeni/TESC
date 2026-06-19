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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  FileText, 
  Loader2, 
  Info,
  Trash2,
  Upload, // Added Upload for bulk upload
  Pencil, // For edit action
  MoreVertical, // For dropdown menu
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, // Added Table components
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, // Added DropdownMenu
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added DropdownMenu components
import { toast } from "sonner";

// Custom Dialogs
import { AddProgramDialog } from "@/components/AddProgramDialog";
import { EditProgramDialog } from "@/components/EditProgramDialog";
import { BulkUploadResolver } from "@/components/common/BulkUploadResolver"; // Added BulkUploadResolver

// Services
import { getPrograms, Program, deleteProgram } from "@/services/programs.services";

const Programs = () => {
  const { user } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPrograms = useCallback(async () => {
    if (!user?.institution?.id) return;
    try {
      setLoading(true);
      const data = await getPrograms({ institution_id: user.institution.id });
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch programs", error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteProgram(id);
      toast.success("Program deleted successfully");
      setPrograms((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      toast.error("Failed to delete program. It may have linked records.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPrograms = programs.filter((program) => {
    return (
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate summary stats
  const totalPrograms = programs.length;
  const activePrograms = programs.filter(p => p.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Programs & Courses
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage curriculum for <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      {/* Main Content Area */}
      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Programs Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all registered programs and courses</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>Bulk Upload Programs</DialogTitle></DialogHeader>
                    {/* Placeholder for BulkUploadResolver. Backend endpoint needs to be created. */}
                    <BulkUploadResolver moduleType="programs" onSuccess={fetchPrograms} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex-1 sm:flex-none">
                {user?.institution?.id && (
                  <AddProgramDialog 
                    institutionId={user.institution.id} 
                    onSuccess={fetchPrograms} 
                  />
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPrograms}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePrograms}</div>
              </CardContent>
            </Card>
            {/* Additional summary cards can be added here, e.g., programs by level */}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 sm:h-10"
              />
            </div>
            {/* Filter Dropdowns could go here if needed */}
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-xs">Code</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Level</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">Department</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs">Duration</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading programs...
                    </TableCell>
                  </TableRow>
                ) : filteredPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                      No programs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{program.code}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{program.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{program.level}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{program.department_name || 'N/A'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">{program.duration} Yrs</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Info className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                              Edit Program
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onSelect={(e) => e.preventDefault()} // Prevent dropdown closing immediately
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  Delete Program
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="w-[95vw] sm:w-full">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs sm:text-sm">
                                    This will permanently delete the <strong>{program.name}</strong> program. 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="text-xs sm:text-sm h-9 sm:h-10">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(program.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm h-9 sm:h-10"
                                  >
                                    Delete Program
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
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

export default Programs;