// src/services/analysis.services.ts
import apiClient from "./api";
import type { AxiosResponse } from "axios";
import type { DashboardStats, StudentDistribution } from "@/lib/types/dashboard.types";

export const analysisService = {
  getAnalysisStats: async (): Promise<DashboardStats> => {
    const response: AxiosResponse<DashboardStats> = await apiClient.get("analysis/dashboard/");
    return response.data;
  },
  getStudentDistribution: async (): Promise<StudentDistribution> => {
    const response: AxiosResponse<StudentDistribution> = await apiClient.get("analysis/student-distribution/");
    return response.data;},
   



};