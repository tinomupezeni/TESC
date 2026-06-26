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
  // Programs CRUD
  getPrograms: async (institutionId?: number | string) => {
    const params = institutionId ? `?institution_id=${institutionId}` : '';
    const response = await apiClient.get(`/iseop/programs/${params}`);
    return response.data;
  },

  getProgram: async (id: number | string) => {
    const response = await apiClient.get(`/iseop/programs/${id}/`);
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
  },

  // Students CRUD
  getStudents: async (params?: { institution_id?: string; search?: string; work_area?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.institution_id) searchParams.append('institution_id', params.institution_id);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.work_area) searchParams.append('work_area', params.work_area);
    if (params?.status) searchParams.append('status', params.status);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const response = await apiClient.get(`/iseop/students/${query}`);
    return response.data;
  },

  getStudent: async (id: number | string) => {
    const response = await apiClient.get(`/iseop/students/${id}/`);
    return response.data;
  },

  updateStudent: async (id: number | string, payload: any) => {
    const response = await apiClient.patch(`/iseop/students/${id}/`, payload);
    return response.data;
  },

  enrollStudent: async (payload: { student_id: number; is_work_for_fees?: boolean; work_area?: string; hours_pledged?: number }) => {
    const response = await apiClient.post("/iseop/students/enroll/", payload);
    return response.data;
  },

  unenrollStudent: async (id: number | string) => {
    const response = await apiClient.post(`/iseop/students/${id}/unenroll/`);
    return response.data;
  },

  // Statistics
  getStats: async (institutionId?: number | string) => {
    const params = institutionId ? `?institution_id=${institutionId}` : '';
    const response = await apiClient.get(`/iseop/stats/${params}`);
    return response.data;
  }
};