// hooks/useSpecialEnrollment.ts
import { useState, useEffect, useMemo, useCallback } from "react";
// 1. UPDATED: Import the functions directly instead of the object
import { getSpecialEnrollmentStats, SpecialStats } from "@/services/analysis.services";

// Map all disability types to unique colors
const COLOR_MAP: Record<string, string> = {
  Physical: "#2563EB",       // blue
  Albino: "#D946EF",         // pink
  Hearing: "#0EA5E9",        // cyan
  Visual: "#FBBF24",         // yellow
  Amputation: "#F97316",     // orange
  Paralysis: "#6B7280",      // gray
  CerebralPalsy: "#EC4899",  // fuchsia
  SpinalCord: "#F59E0B",     // amber
  Speech: "#14B8A6",         // teal
  DeafBlind: "#8B5CF6",      // violet
  Intellectual: "#84CC16",   // lime
  Learning: "#FACC15",       // yellow-400
  Autism: "#06B6D4",         // cyan
  ADHD: "#FB7185",           // rose
  Epilepsy: "#4F46E5",       // indigo
  MentalHealth: "#C026D3",   // fuchsia-600
  DownSyndrome: "#0EA5E9",   // sky
  SickleCell: "#F59E0B",     // amber
  ChronicIllness: "#10B981", // emerald
  Multiple: "#EF4444",       // red
  Other: "#9CA3AF",          // gray-400
};

export const useSpecialEnrollment = () => {
  const [data, setData] = useState<SpecialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 2. UPDATED: Call the function directly
      const result = await getSpecialEnrollmentStats(); 
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to load national enrollment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pie chart data for normal students
  const pieData = useMemo(() => {
    if (!data?.students?.special_students) return [];
    return data.students.special_students
      .filter((item) => item.disability_type && item.disability_type !== "None")
      .map((item) => ({
        name: item.disability_type,
        value: item.value,
        color: COLOR_MAP[item.disability_type] || "#6B7280", // fallback gray
      }));
  }, [data]);

  // Pie chart data for ISEOP students
  const iseopPieData = useMemo(() => {
    if (!data?.iseop?.special_students) return [];
    return data.iseop.special_students
      .filter((item) => item.disability_type && item.disability_type !== "None")
      .map((item) => ({
        name: item.disability_type,
        value: item.value,
        color: COLOR_MAP[item.disability_type] || "#6B7280",
      }));
  }, [data]);

  // Work-for-fees mapping for normal students
  const workForFees = useMemo(() => {
    if (!data?.students?.work_for_fees) return [];
    return data.students.work_for_fees.map((item) => ({
      work_area: item.work_area,
      students: item.students,
      hours: item.hours,
    }));
  }, [data]);

  // Work-for-fees mapping for ISEOP students
  const iseopWorkForFees = useMemo(() => {
    if (!data?.iseop?.work_for_fees) return [];
    return data.iseop.work_for_fees.map((item) => ({
      work_area: item.work_area,
      students: item.students,
      hours: item.hours,
    }));
  }, [data]);

  return {
    data: {
      students: { ...data?.students, work_for_fees: workForFees },
      iseop: { ...data?.iseop, work_for_fees: iseopWorkForFees },
    },
    pieData,
    iseopPieData,
    loading,
    error,
    refresh: fetchData,
  };
};