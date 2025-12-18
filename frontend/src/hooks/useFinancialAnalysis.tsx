import { useState, useEffect, useCallback } from "react";
import { getFinancialStats, FinancialStats } from "@/services/analysis.services";

export const useFinancialAnalysis = () => {
  const [data, setData] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFinancialStats();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Financial Stats Error:", err);
      setError("Failed to load national financial data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats: data?.stats || { totalPending: 0, complianceRate: 0, studentsWithPending: 0, totalCollectedYTD: 0 },
    feeStructure: data?.fee_structure || [],
    paymentData: data?.payment_data || [],
    loading,
    error,
    refresh: fetchData,
  };
};