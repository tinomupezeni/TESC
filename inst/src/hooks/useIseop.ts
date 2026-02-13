import { useState, useEffect, useCallback } from 'react';
import {
  getstudents, getprograms, getstats, getgrants,
  IseopStudent, IseopProgram, IseopStats, ResearchGrant,
  // Legacy type aliases for compatibility
  Project, InnovationHub, Partnership
} from '@/services/iseop.services';
import { toast } from 'sonner';

export const useIseopData = (institutionId: number | undefined) => {
  const [students, setStudents] = useState<IseopStudent[]>([]);
  const [programs, setPrograms] = useState<IseopProgram[]>([]);
  const [analysis, setAnalysis] = useState<IseopStats | null>(null);
  const [grants, setGrants] = useState<ResearchGrant[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!institutionId) return;

    setLoading(true);
    setError(null);
    try {
      // Fetching all data in parallel
      const [studentsData, programsData, statsData, grantsData] = await Promise.all([
        getstudents({ institution_id: institutionId }),
        getprograms({ institution_id: institutionId }),
        getstats({ institution_id: institutionId }),
        getgrants({ institution_id: institutionId }),
      ]);
      setStudents(studentsData);
      setPrograms(programsData);
      setAnalysis(statsData);
      setGrants(grantsData);
    } catch (err) {
      console.error("Failed to load ISEOP data", err);
      setError("Failed to load ISEOP data");
      toast.error("Could not load ISEOP data.");
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

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
    refresh: fetchData
  };
};
