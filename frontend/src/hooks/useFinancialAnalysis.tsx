// hooks/useFinancialAnalysis.ts
import { useState, useEffect, useCallback } from "react";
// 1. UPDATED: Import the function directly
import { getFinancialStats, FinancialStats } from "@/services/analysis.services";

export const useFinancialAnalysis = () => {
  const [stats, setStats] = useState({
    totalPending: 0,
    complianceRate: 0,
    studentsWithPending: 0,
    totalCollectedYTD: 0,
  });
  const [feeStructure, setFeeStructure] = useState<{ name: string; annual_fee: number }[]>([]);
  const [paymentData, setPaymentData] = useState<{ month: string; Collected: number; Target: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 2. UPDATED: Call the function directly
      const data: FinancialStats = await getFinancialStats();
      setStats(data.stats);
      setFeeStructure(data.fee_structure);
      setPaymentData(data.payment_data);
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

  return { stats, feeStructure, paymentData, loading, error, refresh: fetchData };
};