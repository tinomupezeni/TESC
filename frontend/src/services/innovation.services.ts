import apiClient from "./api";
import type { AxiosResponse } from "axios";
import type { DashboardInnovationStats, DetailedInnovation } from "@/lib/types/academic.types";

// --- INNOVATION SERVICE (HUBS/ANALYTICS) ---
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

  getPartnerships: async (): Promise<any[]> => {
    const response: AxiosResponse<any[]> = await apiClient.get(
      "/innovation/partnerships/"
    );
    return response.data;
  },

  // Hubs stay under innovation if they are business/incubation focused
  getHubs: async () => {
    const response = await apiClient.get("/innovation/hubs/");
    return response.data;
  }
};

// --- ISEOP SERVICE (ACADEMIC PROGRAMS) ---
// This connects to your new 'iseop' Django app
export const IseopService = {
  getPrograms: async () => {
    const response = await apiClient.get("/iseop/programs/");
    return response.data;
  },

  createProgram: async (payload: any) => {
    const response = await apiClient.post("/iseop/programs/", payload);
    return response.data;
  },

  updateProgram: async (id: number | string, payload: any) => {
    const response = await apiClient.patch(`/iseop/programs/${id}/`, payload);
    return response.data;
  },

  deleteProgram: async (id: number | string) => {
    const response = await apiClient.delete(`/iseop/programs/${id}/`);
    return response.data;
  }
};