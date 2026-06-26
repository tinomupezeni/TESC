import { useState, useEffect } from "react";
// 1. UPDATED: Import the function directly
import { getStudentTeacherRatio } from "@/services/analysis.services"; 
import type { StudentTeacherRatioItem } from "@/lib/types/dashboard.types";

export function useStudentTeacherRatio() {
  const [data, setData] = useState<StudentTeacherRatioItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // 2. UPDATED: Call the function directly
        const stats = await getStudentTeacherRatio();
        if (!mounted) return;
        setData(stats);
      } catch (err) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}