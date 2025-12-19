// frontend/src/services/reports.services.tsx
import apiClient from "./api";

// --- Types ---
export interface ReportData {
  title: string;
  generated_at: string;
  parameters: Record<string, any>;
  summary?: Record<string, any>;
  data? : any;
  [key: string]: any;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  report_data: ReportData;  // Changed from file_url to report_data
  
  
  generated_at: string;
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  parameters_schema: Record<string, any>;
  default_format: 'pdf' | 'excel' | 'csv';
}

export interface ReportGenerationRequest {
  template_id: number;
  parameters: Record<string, any>;
  format?: 'pdf' | 'excel' | 'csv';
  institution_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface ReportFilters {
  category?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  institution_id?: number;
}

// --- API Endpoints ---
const BASE_URL = '/v1/reports/';

// --- Service Functions ---
export const getReportTemplates = async (): Promise<ReportTemplate[]> => {
  try {
    const response = await apiClient.get<ReportTemplate[]>(`${BASE_URL}templates/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report templates:", error);
    throw error;
  }
};

export const generateReport = async (data: ReportGenerationRequest): Promise<Report> => {
  try {
    const payload = {
      template_id: Number(data.template_id),
      parameters: data.parameters || {},
      format: data.format || 'pdf',
    };

    const response = await apiClient.post<Report>(
      `${BASE_URL}generated/generate/`,
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error("Error generating report:", error.response?.data || error);
    throw error;
  }
};

export const getGeneratedReports = async (filters?: ReportFilters): Promise<Report[]> => {
  try {
    const response = await apiClient.get<Report[]>(`${BASE_URL}generated/`, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching generated reports:", error);
    throw error;
  }
};

export const getReportById = async (id: number): Promise<Report> => {
  try {
    const response = await apiClient.get<Report>(`${BASE_URL}generated/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    throw error;
  }
};

// REMOVED: downloadReport and downloadReportFile functions
// Frontend will generate PDFs locally

export const deleteReport = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}generated/${id}/`);
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    throw error;
  }
};

export const getReportStats = async (): Promise<{
  total_reports: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  recent_reports: Report[];
}> => {
  try {
    const response = await apiClient.get<{
      total_reports: number;
      by_category: Record<string, number>;
      by_status: Record<string, number>;
      recent_reports: Report[];
    }>(`${BASE_URL}generated/stats/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report stats:", error);
    throw error;
  }
};

// --- Quick Generation Functions ---
export const generateEnrollmentReport = async (period: string): Promise<Report> => {
  return generateReport({
    template_id: 1,
    parameters: { period },
    format: 'pdf',
  });
};

export const generateAcademicReport = async (
  semester: string,
  programId?: number
): Promise<Report> => {
  const parameters: Record<string, any> = { semester };
  if (programId !== undefined) parameters.program_id = programId;

  return generateReport({
    template_id: 2,
    parameters,
    format: 'pdf',
  });
};

const reportsService = {
  getReportTemplates,
  generateReport,
  getGeneratedReports,
  getReportById,
  deleteReport,
  getReportStats,
  generateEnrollmentReport,
  generateAcademicReport,
};

export default reportsService;