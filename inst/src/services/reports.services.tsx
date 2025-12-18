// frontend/src/services/reports.services.tsx
import apiClient from "./api";

// --- Types ---

export interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_size: string;
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
// FIX 1: Update BASE_URL to match Django URLs
const BASE_URL = '/v1/reports/';

// --- Service Functions ---

/**
 * Get all available report templates
 */
export const getReportTemplates = async (): Promise<ReportTemplate[]> => {
  try {
    const response = await apiClient.get<ReportTemplate[]>(`${BASE_URL}templates/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report templates:", error);
    throw error;
  }
};

/**
 * Get report templates by category
 */
export const getTemplatesByCategory = async (category: string): Promise<ReportTemplate[]> => {
  try {
    const response = await apiClient.get<ReportTemplate[]>(`${BASE_URL}templates/?category=${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} templates:`, error);
    throw error;
  }
};

/**
 * Generate a new report
 */
export const generateReport = async (data: ReportGenerationRequest): Promise<Report> => {
  try {
    const payload = {
      template_id: Number(data.template_id),  // ensure number
      parameters: data.parameters || {},      // default to empty object
      format: data.format || 'pdf',           // default
    };

    const response = await apiClient.post<Report>(
      `${BASE_URL}generated/generate/`,
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error generating report:",
      error.response?.data || error
    );
    throw error;
  }
};




/**
 * Get all generated reports with optional filters
 */
export const getGeneratedReports = async (filters?: ReportFilters): Promise<Report[]> => {
  try {
    const response = await apiClient.get<Report[]>(`${BASE_URL}generated/`, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching generated reports:", error);
    throw error;
  }
};

/**
 * Get a specific generated report by ID
 */
export const getReportById = async (id: number): Promise<Report> => {
  try {
    const response = await apiClient.get<Report>(`${BASE_URL}generated/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    throw error;
  }
};

/**
 * Download report file - FIXED VERSION
 */
export const downloadReport = async (reportId: number): Promise<Blob> => {
  try {
    const response = await apiClient.get(`${BASE_URL}generated/${reportId}/download/`, {
      responseType: 'blob',
    });
    
    // Fix: Type assertion to tell TypeScript this is a Blob
    return response.data as Blob;
  } catch (error) {
    console.error(`Error downloading report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Alternative: Download report with automatic file saving
 */
export const downloadReportFile = async (reportId: number, filename?: string): Promise<void> => {
  try {
    const response = await apiClient.get(`${BASE_URL}generated/${reportId}/download/`, {
      responseType: 'blob',
    });
    
    // Create blob URL
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Determine filename
    let finalFilename = filename;
    if (!finalFilename) {
      const contentType = response.headers['content-type'];
      if (contentType?.includes('pdf')) {
        finalFilename = `report_${reportId}.pdf`;
      } else if (contentType?.includes('excel') || contentType?.includes('spreadsheet')) {
        finalFilename = `report_${reportId}.xlsx`;
      } else if (contentType?.includes('csv')) {
        finalFilename = `report_${reportId}.csv`;
      } else {
        finalFilename = `report_${reportId}`;
      }
    }
    
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error(`Error downloading report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Delete a generated report
 */
export const deleteReport = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}generated/${id}/`);
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    throw error;
  }
};

/**
 * Get report statistics
 */
export const getReportStats = async (): Promise<{
  total_reports: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  recent_reports: Report[];
}> => {
  try {
    // FIX 3: Update stats endpoint
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

// --- Report Categories Constants ---
export const REPORT_CATEGORIES = {
  ENROLLMENT: 'enrollment',
  ACADEMIC: 'academic',
  STAFF: 'staff',
  FINANCIAL: 'financial',
} as const;

export type ReportCategory = typeof REPORT_CATEGORIES[keyof typeof REPORT_CATEGORIES];

// --- Quick Generation Functions ---

/**
 * Quick enrollment report generation
 */
export const generateEnrollmentReport = async (
period: string, id: number): Promise<Report> => {
  return generateReport({
    template_id: 1,                   // ensure this is number
    parameters: { period },           // must be a plain object
    format: 'pdf',
  });
};



/**
 * Quick academic performance report
 */
export const generateAcademicReport = async (
  semester: string,
  programId?: number
): Promise<Report> => {
  const parameters: Record<string, any> = { semester };
  if (programId !== undefined) parameters.program_id = programId;

  return generateReport({
    template_id: 2,       // ensure number
    parameters,
    format: 'pdf',
  });
};



const reportsService = {
  getReportTemplates,
  getTemplatesByCategory,
  generateReport,
  getGeneratedReports,
  getReportById,
  downloadReport,
  downloadReportFile,
  deleteReport,
  getReportStats,
  generateEnrollmentReport,
  generateAcademicReport,
  REPORT_CATEGORIES,
};

export default reportsService;