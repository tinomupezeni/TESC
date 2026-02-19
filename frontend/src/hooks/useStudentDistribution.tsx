import { useState, useEffect } from "react";
// 1. UPDATED: Import the function directly
import { getStudentDistribution } from "@/services/analysis.services"; 
import type { StudentDistribution } from "@/lib/types/dashboard.types";

// Named export for hook
export function useStudentDistribution() {
  const [data, setData] = useState<StudentDistribution | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // 2. UPDATED: Call the function directly
        const distribution = await getStudentDistribution();
        if (!mounted) return;
        setData(distribution);
      } catch (err) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}