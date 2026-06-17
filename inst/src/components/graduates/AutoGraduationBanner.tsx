import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GraduationCap, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api";

interface Cohort {
  program_id: number;
  program_name: string;
  program_code: string;
  expected_year: number;
  student_count: number;
  students: any[];
}

export function AutoGraduationBanner({ onSuccess }: { onSuccess: () => void }) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);

  const fetchEligibleCohorts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/academic/graduates-mgmt/eligible/');
      setCohorts(res.data);
    } catch (error) {
      console.error("Failed to fetch eligible cohorts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleCohorts();
  }, []);

  const openReviewModal = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setExcludedIds([]); // default all included
  };

  const toggleExclusion = (studentId: number) => {
    setExcludedIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleConfirm = async () => {
    if (!selectedCohort) return;
    
    setConfirming(true);
    try {
      await apiClient.post('/academic/graduates-mgmt/confirm-auto/', {
        program_id: selectedCohort.program_id,
        expected_year: selectedCohort.expected_year,
        excluded_student_ids: excludedIds,
        default_grade: "Pass"
      });
      
      toast.success(`Successfully graduated students for ${selectedCohort.program_name}`);
      setSelectedCohort(null);
      await fetchEligibleCohorts();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to confirm graduation");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return null; // Don't show while loading
  if (cohorts.length === 0) return null; // Hide if no eligible cohorts

  return (
    <>
      <div className="space-y-3 mb-6">
        {cohorts.map((cohort) => (
          <Alert key={cohort.program_id} className="border-primary/50 bg-primary/5">
            <GraduationCap className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold flex items-center gap-2">
              Action Required: Eligible Graduates
              <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 text-xs">
                {cohort.student_count} Students
              </Badge>
            </AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
              <span>
                The <strong>{cohort.program_name}</strong> class of <strong>{cohort.expected_year}</strong> has reached the end of their program duration and is eligible for graduation.
              </span>
              <Button size="sm" onClick={() => openReviewModal(cohort)}>
                Review & Confirm
              </Button>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      <Dialog open={!!selectedCohort} onOpenChange={(open) => !open && setSelectedCohort(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Confirm Graduation Class</DialogTitle>
            <DialogDescription>
              Review the students eligible for graduation from {selectedCohort?.program_name}. 
              Uncheck any students who have deferred or failed to exclude them from this batch.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 py-4 border-y my-2 space-y-2">
            <div className="bg-muted p-2 rounded text-sm mb-4 flex justify-between items-center">
              <span>Total Eligible: <strong>{selectedCohort?.student_count}</strong></span>
              <span>Graduating: <strong>{(selectedCohort?.student_count || 0) - excludedIds.length}</strong></span>
              <span className="text-destructive">Excluded: <strong>{excludedIds.length}</strong></span>
            </div>

            {selectedCohort?.students.map(student => {
              const isExcluded = excludedIds.includes(student.id);
              return (
                <div 
                  key={student.id} 
                  className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                    isExcluded ? 'bg-destructive/5 border-destructive/20 opacity-60' : 'bg-card'
                  }`}
                >
                  <div>
                    <p className={`font-medium text-sm ${isExcluded ? 'line-through' : ''}`}>
                      {student.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{student.student_id}</p>
                  </div>
                  <Button
                    variant={isExcluded ? "outline" : "default"}
                    size="sm"
                    className={isExcluded ? "text-destructive border-destructive" : ""}
                    onClick={() => toggleExclusion(student.id)}
                  >
                    {isExcluded ? "Excluded" : "Included"}
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedCohort(null)} disabled={confirming}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={confirming}>
              {confirming && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm Graduation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
