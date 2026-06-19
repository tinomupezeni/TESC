import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // Added CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Added Table components
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building2,
  GraduationCap,
  Users,
  Briefcase, // Used by faculty summary, but no longer used for Cards
  MapPin,
  Mail,
  Loader2,
  Trash2,
  Upload, // Added Upload icon for bulk upload
  Pencil, // Added for Edit button
  MoreVertical, // Added for Dropdown menu
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
import {
  DropdownMenu, // Added DropdownMenu
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added DropdownMenu components
import { toast } from "sonner";

// Components & Services
import { AddFacultyDialog } from "@/components/AddFacultyDialog";
import { ManageDepartmentsDialog } from "@/components/ManageDepartmentsDialog";
import { BulkUploadResolver } from "@/components/common/BulkUploadResolver"; // Added BulkUploadResolver
import { getFaculties, Faculty, deleteFaculty } from "@/services/faculties.services";
import { useAuth } from "@/context/AuthContext";

const Faculties = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { user } = useAuth();

  const fetchFaculties = async () => {
    if (!user?.institution?.id) return;
    
    try {
      setLoading(true);
      const data = await getFaculties(user.institution.id);
      
      if (Array.isArray(data)) {
        setFaculties(data);
      } else {
        console.error("Received invalid data format:", data);
        setFaculties([]);
      }
    } catch (error) {
      console.error("Failed to fetch faculties:", error);
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, [user]);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteFaculty(id);
      toast.success("Faculty deleted successfully");
      setFaculties((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      toast.error("Failed to delete faculty. It may have linked departments or staff.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFaculties = faculties.filter((faculty) => {
    const query = searchQuery.toLowerCase();
    return (
      faculty.name.toLowerCase().includes(query) ||
      (faculty.dean && faculty.dean.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Faculties</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage departments, deans, and resource allocations for{" "}
          <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      <Card className="overflow-hidden border-none sm:border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Faculties Directory</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View and manage all registered faculties</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>Bulk Upload Faculties</DialogTitle></DialogHeader>
                    {/* Placeholder for BulkUploadResolver. Backend endpoint needs to be created. */}
                    <BulkUploadResolver moduleType="faculties" onSuccess={fetchFaculties} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex-1 sm:flex-none">
                {user?.institution?.id && (
                  <AddFacultyDialog 
                      onSuccess={fetchFaculties} 
                      institutionId={user.institution.id} 
                  />
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Name or Dean..."
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
                  <TableHead className="w-[100px] text-xs">ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs">Dean</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs">Location</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">Departments</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredFaculties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                      No faculties found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaculties.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">{faculty.id}</TableCell>
                      <TableCell className="text-[10px] sm:text-sm truncate max-w-[120px] sm:max-w-none">{faculty.name}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">{faculty.dean || 'N/A'}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{faculty.location || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{faculty.departments_count || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={faculty.status === "Active" ? "default" : "secondary"}
                          className={`text-[10px] sm:text-xs px-1.5 py-0.5 whitespace-nowrap ${
                            faculty.status === "Active"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-amber-500 hover:bg-amber-600"
                          }`}
                        >
                          {faculty.status}
                        </Badge>
                      </TableCell>
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
                              <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                              Edit Faculty
                            </DropdownMenuItem>
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Users className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                  Manage Departments
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Manage Departments for {faculty.name}</DialogTitle>
                                  <DialogDescription>Add, edit, or remove departments within this faculty.</DialogDescription>
                                </DialogHeader>
                                <ManageDepartmentsDialog facultyId={faculty.id} facultyName={faculty.name} />
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onSelect={(e) => e.preventDefault()} // Prevent dropdown closing immediately
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  Delete Faculty
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="w-[95vw] sm:w-full">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs sm:text-sm">
                                    This will permanently delete the <strong>{faculty.name}</strong> faculty. 
                                    This action cannot be undone and may fail if there are linked departments or records.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="text-xs sm:text-sm h-9 sm:h-10">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(faculty.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm h-9 sm:h-10"
                                  >
                                    Delete Faculty
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

export default Faculties;