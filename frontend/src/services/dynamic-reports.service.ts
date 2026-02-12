/**
 * Dynamic Reports Service
 *
 * API client for the dynamic report generation system.
 */

import apiClient from './api';
import type {
  ReportType,
  ReportSchema,
  ReportSchemaListItem,
  ReportConfig,
  ReportDataResponse,
  RelationOptionsResponse,
} from '../lib/types/report.types';

const REPORTS_BASE = '/v1/reports';

/**
 * Get list of available report types
 */
export const getReportSchemas = async (): Promise<ReportSchemaListItem[]> => {
  const response = await apiClient.get<ReportSchemaListItem[]>(
    `${REPORTS_BASE}/schemas/`
  );
  return response.data;
};

/**
 * Get schema for a specific report type
 */
export const getReportSchema = async (
  reportType: ReportType
): Promise<ReportSchema> => {
  const response = await apiClient.get<ReportSchema>(
    `${REPORTS_BASE}/schema/${reportType}/`
  );
  return response.data;
};

/**
 * Get options for a relation field
 */
export const getRelationOptions = async (
  reportType: ReportType,
  fieldKey: string,
  institutionId?: number | null
): Promise<RelationOptionsResponse> => {
  const params = new URLSearchParams();
  if (institutionId) {
    params.append('institution_id', institutionId.toString());
  }

  const url = `${REPORTS_BASE}/options/${reportType}/${fieldKey}/${
    params.toString() ? `?${params.toString()}` : ''
  }`;

  const response = await apiClient.get<RelationOptionsResponse>(url);
  return response.data;
};

/**
 * Preview report data (first 10 rows)
 */
export const previewReport = async (
  config: Omit<ReportConfig, 'format'>
): Promise<ReportDataResponse> => {
  const response = await apiClient.post<ReportDataResponse>(
    `${REPORTS_BASE}/dynamic/preview/`,
    {
      ...config,
      format: 'preview',
    }
  );
  return response.data;
};

/**
 * Generate report and get JSON data
 */
export const generateReportData = async (
  config: Omit<ReportConfig, 'format'>
): Promise<ReportDataResponse> => {
  const response = await apiClient.post<ReportDataResponse>(
    `${REPORTS_BASE}/dynamic/generate/`,
    {
      ...config,
      format: 'json',
    }
  );
  return response.data;
};

/**
 * Generate and download PDF report
 */
export const generateReportPDF = async (
  config: Omit<ReportConfig, 'format'>
): Promise<void> => {
  const response = await apiClient.post(
    `${REPORTS_BASE}/dynamic/generate/`,
    {
      ...config,
      format: 'pdf',
    },
    {
      responseType: 'blob',
    }
  );

  // Create download link
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  // Extract filename from Content-Disposition header or generate one
  const contentDisposition = response.headers['content-disposition'];
  let filename = `${config.report_type}_report.pdf`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate report in specified format
 */
export const generateReport = async (config: ReportConfig): Promise<void | ReportDataResponse> => {
  if (config.format === 'pdf') {
    await generateReportPDF(config);
    return;
  }

  if (config.format === 'preview') {
    return previewReport(config);
  }

  return generateReportData(config);
};

// Export service object for convenience
export const dynamicReportsService = {
  getSchemas: getReportSchemas,
  getSchema: getReportSchema,
  getRelationOptions,
  preview: previewReport,
  generateData: generateReportData,
  generatePDF: generateReportPDF,
  generate: generateReport,
};

export default dynamicReportsService;
