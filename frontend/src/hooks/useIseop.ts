// hooks/useIseopStats.ts
import { useState, useEffect } from "react";
import { getIseopStats } from "@/services/iseop.service"; // Fixed path
import { IseopStats } from "@/lib/types/iseop.types";

export const useIseopStats = () => {
  const [data, setData] = useState<IseopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getIseopStats()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};