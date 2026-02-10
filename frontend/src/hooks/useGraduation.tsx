import { useState, useEffect, useCallback } from "react";
import * as studentService from "@/services/student.service";
import type { StudentGraduate } from "@/lib/types/academic.types";

export function useGraduationStats(institutionId?: string | number) {
  const [data, setData] = useState<StudentGraduate[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async (mounted: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      // CALL THE NEW INDIVIDUAL RECORDS METHOD
      const graduates = await studentService.getGraduates(institutionId);
      
      if (mounted) {
        setData(graduates);
      }
    } catch (err: any) {
      if (mounted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch graduate records"));
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [institutionId]);

  useEffect(() => {
    let mounted = true;
    fetchStats(mounted);
    return () => { mounted = false; };
  }, [fetchStats]);

  return { 
    data, 
    loading, 
    error, 
    refresh: () => fetchStats(true) 
  };
}