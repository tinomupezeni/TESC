import apiClient from "./api";
import type { AxiosResponse } from "axios";
import type { DashboardInnovationStats, DetailedInnovation } from "@/lib/types/academic.types";

// Define the Partnership type based on your Django model
export interface Partnership {
  id: number;
  partner_name: string;
  focus_area: string;
  agreement_date: string | null;
  status: string;
  institution: number; // Linked directly to institution
}

export const InnovationAnalyticsService = {
  getInnovationStats: async (): Promise<DashboardInnovationStats> => {
    const response: AxiosResponse<DashboardInnovationStats> = await apiClient.get(
      "/innovation/innovations/dashboard/stats/"
    );
    return response.data;
  },
  
  getDetailedInnovations: async (): Promise<DetailedInnovation[]> => {
    const response: AxiosResponse<DetailedInnovation[]> = await apiClient.get(
      "/innovation/innovations/dashboard/projects/"
    );
    return response.data;
  },

  // --- ADDED THIS METHOD ---
  getPartnerships: async (): Promise<Partnership[]> => {
    const response: AxiosResponse<Partnership[]> = await apiClient.get(
      "/innovation/partnerships/"
    );
    return response.data;
  },
};