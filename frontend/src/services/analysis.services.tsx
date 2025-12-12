// services/analysis.services.ts

import apiClient from "./api";

export interface DropoutStats {
  total_dropouts: number;
  chart_data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const END_POINT = '/analysis/';

// Updated: No arguments required
export const getDropoutAnalysis = async () => {
  const response = await apiClient.get<DropoutStats>(`${END_POINT}dropout-analysis/`);
  return response.data;
};

// services/analysis.services.ts

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

export const getFinancialStats = async () => {
  const response = await apiClient.get<FinancialStats>(`${END_POINT}financial-stats/`);
  return response.data;
};

export interface RegionalStats {
  stats: {
    provinces_covered: number;
    top_enrollment: string;
    total_enrollment: number;
    total_institutions: number;
  };
  chart_data: Array<{
    province: string;
    institutions: number;
    students: number;
    hubs: number;
  }>;
}

export const getRegionalStats = async () => {
  const response = await apiClient.get<RegionalStats>(`${END_POINT}regional-stats/`);
  return response.data;
};

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

// services/analysis.services.ts

export const getAdmissionStats = async () => {
  const res = await apiClient.get(`${END_POINT}admissions-stats/`);
  return res.data;
};