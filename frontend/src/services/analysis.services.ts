// src/services/analysis.services.ts
import apiClient from "./api";
import type { AxiosResponse } from "axios";
import type { 
  DashboardStats, 
  StudentDistribution, 
  EnrollmentTrendItem, 
  InstitutionOverviewItem,
  StudentTeacherRatioItem 
} from "@/lib/types/dashboard.types";

const END_POINT = "/analysis/";

// -----------------------
// Interfaces
// -----------------------

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

export interface StudentGroupStats {
  special_students: { disability_type: string; value: number }[];
  work_for_fees: { work_area: string; students: number; hours: number }[];
  counts: {
    iseop: number;
    work_for_fees: number;
    disabled: number;
  };
}

export interface SpecialStats {
  students: StudentGroupStats; // normal students
  iseop: StudentGroupStats;    // ISEOP students
}

// -----------------------
// API Functions
// -----------------------

// --- Original Methods ---
export const getAnalysisStats = async (): Promise<DashboardStats> => {
  const response: AxiosResponse<DashboardStats> = await apiClient.get(`${END_POINT}dashboard/`);
  return response.data;
};

export const getStudentDistribution = async (): Promise<StudentDistribution> => {
  const response: AxiosResponse<StudentDistribution> = await apiClient.get(`${END_POINT}student-distribution/`);
  return response.data;
};

export const getEnrollmentTrends = async (): Promise<EnrollmentTrendItem[]> => {
  const response: AxiosResponse<EnrollmentTrendItem[]> = await apiClient.get(
    "/academic/dashboard/enrollment-trends/"
  );
  return response.data;
};

export const getInstitutionOverview = async (): Promise<InstitutionOverviewItem[]> => {
  const response: AxiosResponse<InstitutionOverviewItem[]> = await apiClient.get(
    "/academic/dashboard/institutions/"
  );
  return response.data;
};

export const getStudentTeacherRatio = async (): Promise<StudentTeacherRatioItem[]> => {
  const response: AxiosResponse<StudentTeacherRatioItem[]> = await apiClient.get(
    `${END_POINT}student-teacher-ratio/`
  );
  return response.data;
};

// --- Additional Methods ---
export const getDropoutAnalysis = async (): Promise<DropoutStats> => {
  const response = await apiClient.get<DropoutStats>(`/academic/students/dropout-stats/`);
  return response.data;
};

export const getFinancialStats = async (): Promise<FinancialStats> => {
  const response = await apiClient.get<FinancialStats>(`academic/payments/finance/`);
  return response.data;
};

export const getRegionalStats = async (): Promise<RegionalStats> => {
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

export const getAdmissionStats = async () => {
  const res = await apiClient.get(`${END_POINT}admissions-stats/`);
  return res.data;
};

export const getSpecialEnrollmentStats = async (): Promise<SpecialStats> => {
  const response = await apiClient.get<SpecialStats>(`/academic/students/special-stats/`);
  return response.data;
};

export const updateProgramFee = async (programId: number, fee: number) => {
  return await apiClient.post(`/academic/payments/update-program-fees/`, {
    program_id: Number(programId),
    semester_fee: fee
  });
};

export const getInstitutionalFinanceData = async (institutionId: number): Promise<FinancialStats> => {
  const res = await apiClient.get(`${END_POINT}finance/dashboard-data/`, {
    params: { institution_id: institutionId }
  });
  return res.data;
};