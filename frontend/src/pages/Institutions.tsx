import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building,
  MapPin,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllInstitutions,
  deleteInstitution,
} from "@/services/institution.service";
import { Institution } from "@/lib/types/academic.types";
import { Skeleton } from "@/components/ui/skeleton";
import RegisterInst from "@/modules/institutions/RegisterInst";

/**
 * Loading Skeleton component
 */
const InstitutionCardSkeleton = () => (
  <Card>
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

  // --- Fetch institutions ---
  const {
    data: institutions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["institutions"],
    queryFn: getAllInstitutions,
  });

  // --- Delete mutation ---
  const deleteMutation = useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
  });

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this institution permanently?")) return;
    deleteMutation.mutate(id);
  };

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      setRegisterInst(false);
      setEditingInstitution(null);
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Educational Institutions</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage Teachers Colleges, Polytechnics, and Industrial Training Centres
              </p>
            </div>

            <Button onClick={() => setRegisterInst(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Register Institution
            </Button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {isLoading && (
              <>
                <InstitutionCardSkeleton />
                <InstitutionCardSkeleton />
              </>
            )}

            {isError && (
              <div className="lg:col-span-2 text-center text-red-500">
                Failed to load institutions.
              </div>
            )}

            {institutions?.map((institution: Institution) => {
              const utilization =
                institution.capacity > 0
                  ? (institution.student_count / institution.capacity) * 100
                  : 0;

              return (
                <Card
                  key={institution.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                          <Building className="h-5 w-5 text-primary shrink-0" />
                          <span className="truncate">{institution.name}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{institution.address || "No address"}</span>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col gap-1 items-center sm:items-end w-full sm:w-auto">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">{institution.type}</Badge>
                        <Badge
                          variant={
                            institution.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px] sm:text-xs"
                        >
                          {institution.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-3 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-[10px] sm:text-sm text-muted-foreground">
                          Students
                        </div>
                        <div className="text-sm sm:text-base font-bold">
                          {institution.student_count}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-[10px] sm:text-sm text-muted-foreground">
                          Staff
                        </div>
                        <div className="text-sm sm:text-base font-bold">
                          {institution.staff_count}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-[10px] sm:text-sm text-muted-foreground">
                          Programs
                        </div>
                        <div className="text-sm sm:text-base font-bold">
                          {institution.program_count || 0}
                        </div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div>
                      <div className="flex justify-between text-[10px] sm:text-sm mb-2">
                        <span>Capacity Utilization</span>
                        <span>{utilization.toFixed(0)}%</span>
                      </div>
                      <Progress value={utilization} className="h-1.5 sm:h-2" />
                    </div>

                    {/* --- ACTIONS ROW --- */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-xs sm:text-sm"
                        onClick={() => setEditingInstitution(institution)}
                      >
                        View & Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9"
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

                    <div className="text-[10px] sm:text-xs text-muted-foreground pt-2 border-t">
                      Established: {institution.established} |{" "}
                      {institution.location}
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
    </>
  );
}
