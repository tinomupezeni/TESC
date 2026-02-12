import { useState, useEffect, useCallback } from 'react';
import { 
  getstudents, getprograms, getanalysis, getgrants,
  Project, InnovationHub, Partnership, ResearchGrant 
} from '@/services/iseop.services';
import { toast } from 'sonner';

export const useIseopData = (institutionId: number | undefined) => {
  // We keep the Interface names (Project, etc.) but name the states 
  // to match your enrollment/ISEOP context
  const [students, setStudents] = useState<Project[]>([]);
  const [programs, setPrograms] = useState<InnovationHub[]>([]);
  const [analysis, setAnalysis] = useState<Partnership[]>([]);
  const [grants, setGrants] = useState<ResearchGrant[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!institutionId) return;

    setLoading(true);
    setError(null);
    try {
      // Fetching all data in parallel using your new lowercase service functions
      const [studentsData, programsData, analysisData, grantsData] = await Promise.all([
        getstudents({ institution_id: institutionId }),
        getprograms({ institution_id: institutionId }),
        getanalysis({ institution_id: institutionId }),
        getgrants({ institution_id: institutionId }),
      ]);

      setStudents(studentsData);
      setPrograms(programsData);
      setAnalysis(analysisData);
      setGrants(grantsData);
    } catch (err) {
      console.error("Failed to load ISEOP data", err);
      setError("Failed to load ISEOP dashboard data");
      toast.error("Could not load ISEOP statistics.");
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  // Trigger fetch when institutionId is available or changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    students,
    programs,
    analysis,
    grants,
    loading,
    error,
    refresh: fetchData // Call this to update the UI after a successful POST/PATCH
  };
};