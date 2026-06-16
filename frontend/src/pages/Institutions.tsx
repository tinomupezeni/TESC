import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Building,
  MapPin,
  Users,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  UserCheck,
  LayoutGrid,
  ShieldCheck,
  ExternalLink,
  Search,
  X
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllInstitutions,
  deleteInstitution,
} from "@/services/institution.service";
import { Institution } from "@/lib/types/academic.types";
import { Skeleton } from "@/components/ui/skeleton";
import RegisterInst from "@/modules/institutions/RegisterInst";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Loading Skeleton component
 */
const InstitutionCardSkeleton = () => (
  <Card shadow-sm>
    <CardHeader>
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-32 w-full" />
    </CardContent>
  </Card>
);

export default function Institutions() {
  const queryClient = useQueryClient();

  const [registerInst, setRegisterInst] = useState(false);
  const [editingInstitution, setEditingInstitution] =
    useState<Institution | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Fetch institutions ---
  const {
    data: institutions,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["institutions"],
    queryFn: getAllInstitutions,
  });

  // --- Filtered Institutions ---
  const filteredInstitutions = useMemo(() => {
    if (!institutions) return [];
    if (!searchQuery.trim()) return institutions;
    
    const query = searchQuery.toLowerCase();
    return institutions.filter((i: Institution) => 
      i.name.toLowerCase().includes(query) || 
      i.location.toLowerCase().includes(query) ||
      i.type.toLowerCase().includes(query)
    );
  }, [institutions, searchQuery]);

  // --- Delete mutation ---
  const deleteMutation = useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("Institution deleted successfully");
    },
    onError: () => {
        toast.error("Failed to delete institution");
    }
  });

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      setRegisterInst(false);
      setEditingInstitution(null);
      // Force refetch to be sure we have the latest data
      refetch();
    }
  };

  // --- Calculate Stats ---
  const stats = useMemo(() => {
    if (!institutions) return { total: 0, active: 0, students: 0, staff: 0, types: {} };
    
    return {
      total: institutions.length,
      active: institutions.filter((i: Institution) => i.status === "Active").length,
      students: institutions.reduce((acc: number, i: Institution) => acc + (i.student_count || 0), 0),
      staff: institutions.reduce((acc: number, i: Institution) => acc + (i.staff_count || 0), 0),
      types: institutions.reduce((acc: Record<string, number>, i: Institution) => {
        acc[i.type] = (acc[i.type] || 0) + 1;
        return acc;
      }, {})
    };
  }, [institutions]);

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Educational Institutions</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Central management of Teachers Colleges, Polytechnics, and Industrial Training Centres
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search institutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-10 shadow-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                onClick={() => setRegisterInst(true)}
                className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Register Institution
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-0.5">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.total}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Active
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-0.5">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.active}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Students
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-0.5">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.students.toLocaleString()}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm overflow-hidden bg-white dark:bg-card">
              <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <UserCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Staff
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-0.5">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.staff.toLocaleString()}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Section */}
          {!isLoading && stats.total > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                 <LayoutGrid className="h-4 w-4" />
                 Breakdown:
               </div>
               {Object.entries(stats.types).map(([type, count]) => (
                 <Badge key={type} variant="secondary" className="px-3 py-1 bg-white dark:bg-card border-border/50">
                    <span className="font-bold mr-1">{count}</span> {type}
                 </Badge>
               ))}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {isLoading && (
              <>
                <InstitutionCardSkeleton />
                <InstitutionCardSkeleton />
                <InstitutionCardSkeleton />
                <InstitutionCardSkeleton />
              </>
            )}

            {isError && (
              <div className="lg:col-span-2 text-center p-12 bg-red-50 dark:bg-red-950/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                <div className="text-red-500 font-bold mb-2">Error Loading Data</div>
                <p className="text-muted-foreground text-sm">Failed to connect to the educational database. Please try again later.</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">Retry Connection</Button>
              </div>
            )}

            {!isLoading && filteredInstitutions.length === 0 && (
                 <div className="lg:col-span-2 text-center p-12 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/30">
                 {searchQuery ? <Search className="h-12 w-12 mx-auto mb-4 opacity-20" /> : <Building className="h-12 w-12 mx-auto mb-4 opacity-20" />}
                 <div className="font-bold mb-2 text-lg">
                   {searchQuery ? `No results for "${searchQuery}"` : "No Institutions Found"}
                 </div>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                   {searchQuery ? "Try adjusting your search terms to find what you're looking for." : "There are currently no registered educational institutions in the system."}
                 </p>
                 {searchQuery ? (
                   <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-6">Clear Search</Button>
                 ) : (
                   <Button onClick={() => setRegisterInst(true)} variant="outline" className="mt-6">Add First Institution</Button>
                 )}
               </div>
            )}

            {filteredInstitutions.map((institution: Institution) => {
              const utilization =
                institution.capacity > 0
                  ? (institution.student_count / institution.capacity) * 100
                  : 0;

              return (
                <Card
                  key={institution.id}
                  className="hover:shadow-md transition-all border-border/50 bg-white dark:bg-card group"
                >
                  <CardHeader className="p-4 sm:p-6 pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                          <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                             <Building className="h-4 w-4" />
                          </div>
                          <span className="truncate">{institution.name}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm text-muted-foreground bg-muted/30 w-fit px-2 py-0.5 rounded-full">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{institution.location}</span>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col gap-2 items-center sm:items-end w-full sm:w-auto">
                        <Badge variant="outline" className="text-[10px] sm:text-xs font-semibold py-0.5 bg-muted/20">
                          {institution.type}
                        </Badge>
                        <Badge
                          variant={
                            institution.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px] sm:text-xs font-bold"
                        >
                          {institution.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 sm:p-6 pt-2">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-1 sm:gap-2 p-3 sm:p-4 bg-muted/20 rounded-xl border border-border/10">
                      <div className="text-center">
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-1 flex items-center justify-center gap-1">
                          <Users className="h-2.5 w-2.5" />
                          Students
                        </div>
                        <div className="text-xs sm:text-base font-bold">
                          {institution.student_count.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-center border-x border-border/20 px-1 sm:px-2">
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-1 flex items-center justify-center gap-1">
                          <UserCheck className="h-2.5 w-2.5" />
                          Staff
                        </div>
                        <div className="text-xs sm:text-base font-bold">
                          {institution.staff_count.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-center border-r border-border/20 px-1 sm:px-2">
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-1 flex items-center justify-center gap-1">
                          <LayoutGrid className="h-2.5 w-2.5" />
                          Programs
                        </div>
                        <div className="text-xs sm:text-base font-bold">
                          {institution.program_count || 0}
                        </div>
                      </div>

                      <div className="text-center px-1">
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-1 flex items-center justify-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5 text-green-600" />
                          System Users
                        </div>
                        <div className="text-xs sm:text-base font-bold text-green-600">
                          {institution.user_count || 0}
                        </div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Capacity Utilization</span>
                        <span className={`text-xs font-bold ${utilization > 90 ? 'text-red-500' : 'text-primary'}`}>{utilization.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/5">
                         <div 
                            className={`h-full transition-all duration-500 ${utilization > 90 ? 'bg-red-500' : 'bg-primary'}`} 
                            style={{ width: `${Math.min(utilization, 100)}%` }} 
                         />
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground text-right italic">
                        {institution.student_count.toLocaleString()} / {institution.capacity.toLocaleString()} max students
                      </div>
                    </div>

                    {/* --- ACTIONS ROW --- */}
                    <div className="flex gap-2 pt-4 border-t border-dashed">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 h-10 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm"
                        onClick={() => setEditingInstitution(institution)}
                      >
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Edit and View
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(institution.id)}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2 justify-center opacity-60">
                      <span>Est. {institution.established}</span>
                      <span className="h-1 w-1 bg-muted-foreground rounded-full" />
                      <span>{institution.address || "No Address Recorded"}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>

      {/* Modal */}
      <RegisterInst
        open={registerInst || !!editingInstitution}
        onOpenChange={handleModalClose}
        institutionToEdit={editingInstitution}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Confirm Institutional Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action is <span className="font-bold text-red-600 underline">irreversible</span>. 
              Permanently removing this institution will delete all associated:
              <ul className="list-disc list-inside mt-3 space-y-1 font-medium text-foreground/80">
                  <li>Student & Academic Records</li>
                  <li>Staff Personnel Files</li>
                  <li>Academic Programs & Curricula</li>
                  <li>Facility & Infrastructure Data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl h-11">Cancel Operation</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl h-11 px-6"
            >
              Confirm Full Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
