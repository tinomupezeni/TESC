import apiClient from "./api";
import type { AxiosResponse } from "axios";
import type { 
  DashboardStats, 
  StudentDistribution, 
  EnrollmentTrendItem, 
  InstitutionOverviewItem, 
  StudentTeacherRatioItem 
} from "@/lib/types/dashboard.types";

// --- Interfaces ---

export interface DropoutStats {
  total_dropouts: number;
  chart_data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export interface FinancialStats {
  stats: {
    totalPending: number;
    complianceRate: number;
    studentsWithPending: number;
    totalCollectedYTD: number;
  };
  fee_structure: Array<{ name: string; annual_fee: number }>;
  payment_data: Array<{ month: string; Collected: number; Target: number }>;
  top_pending: any[];
}

export interface ProvinceStat {
  province_name: string;
  total_enrollment: number;
  total_institutions: number;
}

export interface ChartDataItem {
  province: string;
  location: string;
  institution_name: string;
  students: number;
  institutions: number;
  hubs: number;
}

export interface RegionalStats {
  stats: {
    provinces_covered: number;
    top_enrollment: string;
    total_enrollment: number;
    total_institutions: number;
    provinces: any[]; 
  };
  chart_data: ChartDataItem[];
}

// --- Service Object ---

const END_POINT = '/analysis/';

export const analysisService = {
  getAnalysisStats: async (): Promise<DashboardStats> => {
    const response: AxiosResponse<DashboardStats> = await apiClient.get("analysis/dashboard/");
    return response.data;
  },
  
  getStudentDistribution: async (): Promise<StudentDistribution> => {
    const response: AxiosResponse<StudentDistribution> = await apiClient.get("analysis/student-distribution/");
    return response.data;
  },

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

  getStudentTeacherRatio: async (): Promise<StudentTeacherRatioItem[]> => {
    const response: AxiosResponse<StudentTeacherRatioItem[]> = await apiClient.get(
      "/analysis/student-teacher-ratio/"
    );
    return response.data;
  },

  /**
   * Fetches regional data including specific locations and institution names.
   */
  getRegionalStats: async (): Promise<RegionalStats> => {
    const response: AxiosResponse<RegionalStats> = await apiClient.get(
      `${END_POINT}regional-stats/`
    );
    return response.data;
  },
};

// --- Standalone Exported Functions ---

export const getDropoutAnalysis = async () => {
  const response = await apiClient.get<DropoutStats>(`${END_POINT}dropout-analysis/`);
  return response.data;
};

export const getFinancialStats = async () => {
  const response = await apiClient.get<FinancialStats>(`${END_POINT}financial-stats/`);
  return response.data;
};

// Linking the standalone export to the service method
export const getRegionalStats = analysisService.getRegionalStats;

export const getHubStats = async () => {
  const res = await apiClient.get(`${END_POINT}hubs/`);
  return res.data;
};

export const getStartupStats = async () => {
  const res = await apiClient.get(`${END_POINT}startups/`);
  return res.data;
};

export const getIndustrialStats = async () => {
  const res = await apiClient.get(`${END_POINT}industrial/`);
  return res.data;
};

export const getInnovationOverview = async () => {
  const res = await apiClient.get(`${END_POINT}innovation-overview/`);
  return res.data;
};

export const getAdmissionStats = async () => {
  const res = await apiClient.get(`${END_POINT}admissions-stats/`);
  return res.data;
};