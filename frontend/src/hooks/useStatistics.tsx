// src/hooks/useStatistics.ts
import { useState, useEffect } from "react";
// 1. UPDATED: Import the function directly
import { getAnalysisStats } from "@/services/analysis.services"; 
import type { DashboardStats } from "@/lib/types/dashboard.types";

export function useStatistics() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // 2. UPDATED: Call the function directly
        const stats = await getAnalysisStats();
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

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}