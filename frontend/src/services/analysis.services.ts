// src/services/analysis.services.ts
import apiClient from "./api";
import type { AxiosResponse } from "axios";
import type { DashboardStats, StudentDistribution, EnrollmentTrendItem, InstitutionOverviewItem,StudentTeacherRatioItem } from "@/lib/types/dashboard.types";

export const analysisService = {
  getAnalysisStats: async (): Promise<DashboardStats> => {
    const response: AxiosResponse<DashboardStats> = await apiClient.get("analysis/dashboard/");
    return response.data;
  },
  getStudentDistribution: async (): Promise<StudentDistribution> => {
    const response: AxiosResponse<StudentDistribution> = await apiClient.get("analysis/student-distribution/");
    return response.data;},
  getEnrollmentTrends: async (): Promise<EnrollmentTrendItem[]> => {
    const response: AxiosResponse<EnrollmentTrendItem[]> = await apiClient.get(
      "/academic/dashboard/enrollment-trends/"
    );
    return response.data;
  },

  getInstitutionOverview: async (): Promise<InstitutionOverviewItem[]> => {
    const response: AxiosResponse<InstitutionOverviewItem[]> = await apiClient.get(
      "/academic/dashboard/institutions/"
    );
    return response.data;
  },
  getStudentTeacherRatio: async (): Promise<StudentTeacherRatioItem []> => {
    const response: AxiosResponse<StudentTeacherRatioItem[]> = await apiClient.get(
      "/analysis/student-teacher-ratio/"
    );
    return response.data;
  },
   



};