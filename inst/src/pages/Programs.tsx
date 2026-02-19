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
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Custom Dialogs
import { AddProgramDialog } from "@/components/AddProgramDialog";
import { EditProgramDialog } from "@/components/EditProgramDialog";

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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Programs & Courses
          </h1>
          <p className="text-muted-foreground mt-1">
            Managing academic curriculum for <span className="font-semibold text-primary">{user?.institution?.name}</span>
          </p>
        </div>
        
        {user?.institution?.id && (
          <AddProgramDialog 
            institutionId={user.institution.id} 
            onSuccess={fetchPrograms} 
          />
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading programs...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPrograms.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground">No programs found</h3>
              <p className="max-w-xs mx-auto text-sm mt-1">Try adjusting your search or add a new program.</p>
            </div>
          ) : (
            filteredPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary flex flex-col h-full relative">
                
                {/* Delete Button - Absolute Positioned Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        {deletingId === program.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the <strong>{program.name}</strong> program. 
                          This action cannot be undone and may fail if students are currently enrolled.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(program.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Program
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mr-8">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-mono">{program.code}</Badge>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{program.level}</Badge>
                      </div>
                      <CardTitle className="text-xl leading-tight">{program.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {program.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 py-4 border-y mb-6 bg-muted/20 rounded-lg px-3 text-center md:text-left">
                    <div className="space-y-1">
                      <span className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Duration
                      </span>
                      <p className="text-sm font-semibold">{program.duration} Yrs</p>
                    </div>
                    <div className="space-y-1 border-x px-3">
                      <span className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" /> Intake
                      </span>
                      <p className="text-sm font-semibold">{program.student_capacity}</p>
                    </div>
                    <div className="space-y-1 pl-1">
                      <span className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" /> Dept.
                      </span>
                      <p className="text-sm font-semibold truncate" title={program.department_name}>
                        {program.department_name || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex gap-3 mt-auto pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Info className="h-4 w-4 mr-2" /> Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">{program.name}</DialogTitle>
                          <DialogDescription className="font-mono text-primary">
                            {program.code} • {program.level}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4 text-sm">
                          <div className="p-4 bg-muted/50 rounded-lg border italic">
                            {program.description || "No description available."}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-muted-foreground">Coordinator</p>
                              <p className="font-medium text-primary">{program.coordinator || "Not assigned"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Category</p>
                              <p className="font-medium">{program.category || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {user?.institution?.id && (
                      <EditProgramDialog 
                        program={program}
                        institutionId={user.institution.id}
                        onSuccess={fetchPrograms}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Programs;