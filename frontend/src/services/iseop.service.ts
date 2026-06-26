// services/iseop.service.ts
import apiClient from "./api";
import { IseopStudent, IseopStats } from "@/lib/types/iseop.types"; // Assuming this is where your types are

const ENDPOINTS = {
  STUDENTS: "/iseop/students/",
};

/**
 * Fetch all ISEOP students
 */
export const getIseopStudents = async (): Promise<IseopStudent[]> => {
  const response = await apiClient.get<IseopStudent[]>(ENDPOINTS.STUDENTS);
  return response.data;
};

/**
 * Fetch aggregated statistics for ISEOP programs and students
 * URL: /api/iseop/students/stats/
 */
export const getIseopStats = async (): Promise<IseopStats> => {
  const response = await apiClient.get<IseopStats>(`${ENDPOINTS.STUDENTS}stats/`);
  return response.data;
};

/**
 * Upload student data via CSV for bulk creation
 * URL: /api/iseop/students/bulk_upload/
 */
export const uploadIseopStudentsCSV = async (file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post<{ message: string }>(
    `${ENDPOINTS.STUDENTS}bulk_upload/`, 
    formData, 
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

const iseopService = {
  getIseopStudents,
  getIseopStats,
  uploadIseopStudentsCSV,
};

export default iseopService;
