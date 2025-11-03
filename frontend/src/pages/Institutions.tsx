import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building, MapPin, Users, GraduationCap, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; // <-- Import react-query
import { getAllInstitutions } from "@/services/institution.service"; // <-- Import your service
import { Institution } from "@/lib/types/academic.types"; // <-- Import your type
import { Skeleton } from "@/components/ui/skeleton"; // <-- For loading
import RegisterInst from "@/modules/institutions/RegisterInst";

/**
 * Loading Skeleton component for the card
 */
const InstitutionCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
        <div className="text-center">
          <Skeleton className="h-4 w-16 mx-auto mb-1" />
          <Skeleton className="h-6 w-10 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="h-4 w-10 mx-auto mb-1" />
          <Skeleton className="h-6 w-8 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="h-4 w-16 mx-auto mb-1" />
          <Skeleton className="h-6 w-8 mx-auto" />
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-2 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </CardContent>
  </Card>
);

export default function Institutions() {
  const navigate = useNavigate(); // For navigation
  const [registerInst, setRegisterInst] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  // --- Fetch data from backend ---
  const {
    data: institutions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["institutions"],
    queryFn: getAllInstitutions,
  });

  // --- Modal close handler ---
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
              <h1 className="text-3xl font-bold">Educational Institutions</h1>
              <p className="text-muted-foreground">
                Manage Teachers Colleges, Polytechnics, and Industrial Training
                Centres
              </p>
            </div>
            <Button onClick={() => setRegisterInst(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Register Institution
            </Button>
          </div>

          {/* Institution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading && (
              <>
                <InstitutionCardSkeleton />
                <InstitutionCardSkeleton />
              </>
            )}

            {isError && (
              <div className="lg:col-span-2 text-center text-red-500">
                Failed to load institutions. Please try again.
              </div>
            )}

            {institutions?.map((institution: Institution) => {
              // Calculate utilization
              const utilization =
                institution.capacity > 0
                  ? (institution.student_count / institution.capacity) * 100
                  : 0;

              return (
                <Card
                  key={institution.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" />
                          {institution.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {institution.address || "No address provided"}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">{institution.type}</Badge>
                        <Badge
                          variant={
                            institution.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {institution.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Stats (from backend) */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <Users className="h-3 w-3" />
                          Students
                        </div>
                        <div className="font-bold text-lg">
                          {institution.student_count.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <Building className="h-3 w-3" />
                          Staff
                        </div>
                        <div className="font-bold text-lg">
                          {institution.staff.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <GraduationCap className="h-3 w-3" />
                          Programs
                        </div>
                        <div className="font-bold text-lg">
                          {institution.program_count.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Capacity Utilization (from backend) */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Capacity Utilization</span>
                        <span>{utilization.toFixed(0)}%</span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {institution.student_count.toLocaleString()} /{" "}
                        {institution.capacity.toLocaleString()} students
                      </div>
                    </div>

                    {/* Facilities (from backend) */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Facilities</h4>
                      <div className="flex flex-wrap gap-1">
                        {institution.facilities
                          .slice(0, 4) // Show first 4
                          .map((facility) => (
                            <Badge
                              key={facility.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {facility.name}
                            </Badge>
                          ))}
                        {institution.facilities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{institution.facilities.length - 4} more
                          </Badge>
                        )}
                        {institution.facilities.length === 0 && (
                            <p className="text-xs text-muted-foreground">No facilities listed.</p>
                        )}
                      </div>
                    </div>

                    {/* --- ACTIONS --- */}
                    <div className="flex gap-2 pt-2">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/institutions/${institution.id}`)}
                      >
                        View Details
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingInstitution(institution)}
                      >
                        Edit & Edit
                      </Button>
                    </div>

                    {/* Footer Info */}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
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
      
      {/* --- This modal now handles both creating and editing --- */}
      <RegisterInst
        open={registerInst || !!editingInstitution}
        onOpenChange={handleModalClose}
        institutionToEdit={editingInstitution}
      />
    </>
  );
}