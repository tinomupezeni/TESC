import apiClient from "./api";

// ----------------- TYPES -----------------
export interface IseopStudent {
  id: number;
  institution: number;
  name: string;
  first_name: string;
  last_name: string;
  student_id: string; // --- ADD THIS ---
  gender: "Male" | "Female" | "Other";
  national_id?: string;
  program_name?: string;
  duration?: string;
  enrollment_date?: string;
  certification_level?: string;
  status?: "Active/Enrolled" | "Completed" | "Deferred";
  revenue_generated?: number;
  funding_acquired?: number;
  jobs_created?: number;
  created_at?: string;
  email:string;
}

export interface IseopProgram {
  id: number;
  institution: number;
  name: string;
  capacity: number;
  occupied: number;
  status: "Active" | "Full" | "Closed";
  activity_level?: string;
  description?: string;
  created_at?: string;
}

// ----------------- ENDPOINTS -----------------
const ENDPOINTS = {
  STUDENTS: "/iseop/students/",
  PROGRAMS: "/iseop/programs/",
  STUDENTS: "/iseop/students/",
  PROGRAMS: "/iseop/programs/",
};

// ----------------- STUDENTS -----------------
export const getStudents = async (params?: { institution_id?: number; search?: string }) => {
  const response = await apiClient.get<IseopStudent[]>(ENDPOINTS.STUDENTS, { params });
  return response.data;
};

export const createStudent = async (data: Partial<IseopStudent>) => {
  console.log(data);
  
  const response = await apiClient.post<IseopStudent>(ENDPOINTS.STUDENTS, data);
  return response.data;
};

export const updateStudent = async (id: number, data: Partial<IseopStudent>) => {
  const response = await apiClient.patch<IseopStudent>(`${ENDPOINTS.STUDENTS}${id}/`, data);
  return response.data;
};

export const deleteStudent = async (id: number) => {
  await apiClient.delete(`${ENDPOINTS.STUDENTS}${id}/`);
};

// ----------------- PROGRAMS -----------------
export const getPrograms = async () => {
  const response = await apiClient.get<IseopProgram[]>(ENDPOINTS.PROGRAMS);
  console.log(response);
  
  return response.data;
};

export const createProgram = async (data: Partial<IseopProgram>) => {
  const response = await apiClient.post<IseopProgram>(ENDPOINTS.PROGRAMS, data);
  return response.data;
};

export const updateProgram = async (id: number, data: Partial<IseopProgram>) => {
  const response = await apiClient.patch<IseopProgram>(`${ENDPOINTS.PROGRAMS}${id}/`, data);
  return response.data;
};

export const deleteProgram = async (id: number) => {
  await apiClient.delete(`${ENDPOINTS.PROGRAMS}${id}/`);
};
export const bulkUploadStudents = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(`${ENDPOINTS.STUDENTS}bulk_upload/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
// ----------------- EXPORT SERVICE OBJECT -----------------
const iseopService = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  bulkUploadStudents,
};

export default iseopService;

