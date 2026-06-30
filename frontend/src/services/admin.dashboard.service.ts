// services/dashboard.service.ts

import apiClient from "./api";
import {
  DashboardStats,
  EnrollmentTrendItem,
  InstitutionOverviewItem,
} from "@/lib/types/dashboard.types";

export const DashboardService = {
  /**
   * Fetches the 4 top cards and the breakdown stats
   */
  getStats: async (institution_id?: string): Promise<DashboardStats> => {
    const params = institution_id ? { institution_id } : {};
    const response = await apiClient.get<DashboardStats>("/academic/dashboard/stats/", { params });
    return response.data;
  },

  /**
   * Fetches data for the main LineChart
   */
  getEnrollmentTrends: async (institution_id?: string): Promise<EnrollmentTrendItem[]> => {
    try {
      const params = institution_id ? { institution_id } : {};
      const response = await apiClient.get<EnrollmentTrendItem[]>(
        "/academic/dashboard/enrollment-trends/",
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Enrollment Trends Error:", error);
      // Prevent UI crash
      return [];
    }
  },

  /**
   * Fetches the list for the Institution Overview cards
   */
  getInstitutionOverview: async (): Promise<InstitutionOverviewItem[]> => {
    try {
      const response = await apiClient.get<any[]>("/academic/dashboard/institutions/");
      const data = response.data;

      // Map backend → frontend
      return data.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        location: item.location,
        students: Number(item.student_count),
        capacity: Number(item.capacity),
        programs: Number(item.program_count),
        status: item.status,
        utilization: Number(item.utilization),
      }));
    } catch (error) {
      console.error("Institution Overview Error:", error);
      return [];
    }
  },
};

export type { InstitutionOverviewItem };
