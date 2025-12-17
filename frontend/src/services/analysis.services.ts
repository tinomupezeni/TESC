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
    provinces: ProvinceStat[]; 
  };
  chart_data: ChartDataItem[]; // This is crucial for your Bar Chart and Table
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

  // Added Regional Stats to the main service object for consistency
  getRegionalStats: async (): Promise<RegionalStats> => {
    /** * NOTE: To see both Harare and Mutare, your backend API must return both.
     * If your API is not ready, you can use the mock data below.
     * To switch to live data, use: 
     * const response = await apiClient.get<RegionalStats>(`${END_POINT}regional-stats/`);
     * return response.data;
     */
    return {
      stats: {
        provinces_covered: 2,
        top_enrollment: "Harare",
        total_enrollment: 25,
        total_institutions: 3,
        provinces: [
          { province_name: "Harare", total_enrollment: 13, total_institutions: 2 },
          { province_name: "Mutare", total_enrollment: 12, total_institutions: 1 }
        ]
      },
      chart_data: [
        { province: "Harare", students: 13, institutions: 2, hubs: 1 },
        { province: "Mutare", students: 12, institutions: 1, hubs: 0 }
      ]
    };
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

// Exported alias to match your component's import: 
// import { getRegionalStats } from "@/services/analysis.services";
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