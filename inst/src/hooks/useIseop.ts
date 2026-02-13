import { useState, useEffect, useCallback } from "react";
import { IseopStudent, IseopProgram, getStudents, getPrograms } from "@/services/iseop.services";
import { toast } from "sonner";

export const useIseopData = (institutionId: number | undefined) => {
  const [students, setStudents] = useState<IseopStudent[]>([]);
  const [programs, setPrograms] = useState<IseopProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!institutionId) return;

    setLoading(true);
    setError(null);
    try {
      const [studentsData, programsData] = await Promise.all([
        getStudents({ institution_id: institutionId }),
        getPrograms()
      ]);
      setStudents(studentsData);
      setPrograms(programsData);
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

  return { students, programs, loading, error, refresh: fetchData };
};
