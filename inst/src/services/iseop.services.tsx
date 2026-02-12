import apiClient from "./api";

// --- Types ---

export type WorkArea = 'Library' | 'Grounds' | 'Labs' | 'Admin' | 'Cafeteria' | 'Maintenance' | 'Kitchen' | 'Farm';
export type ProgramStatus = 'Active' | 'Full' | 'Closed';
export type StudentStatus = 'Active' | 'Completed' | 'Dropped' | 'Deferred';
export type Gender = 'Male' | 'Female' | 'Other';

// ISEOP Program Interface
export interface IseopProgram {
  id: number;
  institution: number;
  institution_name: string;
  name: string;
  capacity: number;
  occupied: number;
  status: ProgramStatus;
  duration: string;
  activity_level?: string;
  description?: string;
  student_count: number;
  created_at: string;
  updated_at: string;
}

// ISEOP Student Interface - Community members (NOT institutional students)
export interface IseopStudent {
  id: number;
  institution: number;
  institution_name: string;
  program: number;
  program_name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  national_id?: string;
  gender: Gender;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  address?: string;
  enrollment_date: string;
  expected_completion?: string;
  status: StudentStatus;
  is_work_for_fees: boolean;
  work_area?: WorkArea;
  hours_pledged: number;
  hours_completed: number;
  created_at: string;
  updated_at: string;
}

// Create student payload
export interface CreateIseopStudentData {
  program: number;
  first_name: string;
  last_name: string;
  national_id?: string;
  gender: Gender;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  address?: string;
  expected_completion?: string;
  status?: StudentStatus;
  is_work_for_fees?: boolean;
  work_area?: WorkArea;
  hours_pledged?: number;
}

// ISEOP Stats Interface
export interface IseopStats {
  programs: {
    total: number;
    active: number;
    capacity: number;
    occupied: number;
    utilization: number;
  };
  students: {
    total: number;
    active: number;
    completed: number;
    work_for_fees: number;
  };
  work_areas: Array<{ work_area: string; count: number }>;
  gender_breakdown: Array<{ gender: string; count: number }>;
  status_breakdown: Array<{ status: string; count: number }>;
  program_breakdown: Array<{ program: string; count: number }>;
}

// --- API Endpoints ---
const ENDPOINTS = {
  PROGRAMS: '/iseop/programs/',
  STUDENTS: '/iseop/students/',
  STATS: '/iseop/stats/',
};

// --- Service Functions ---

// 1. PROGRAMS
export const getprograms = async (params?: { institution_id?: number }) => {
  const response = await apiClient.get<IseopProgram[]>(ENDPOINTS.PROGRAMS, { params });
  return response.data;
};

export const createprograms = async (data: Partial<IseopProgram>) => {
  const response = await apiClient.post<IseopProgram>(ENDPOINTS.PROGRAMS, data);
  return response.data;
};

export const updateprograms = async (id: number, data: Partial<IseopProgram>) => {
  const response = await apiClient.patch<IseopProgram>(`${ENDPOINTS.PROGRAMS}${id}/`, data);
  return response.data;
};

export const deleteprograms = async (id: number) => {
  await apiClient.delete(`${ENDPOINTS.PROGRAMS}${id}/`);
};

// 2. STUDENTS (Community members)
export const getstudents = async (params?: {
  institution_id?: number;
  program_id?: number;
  search?: string;
  status?: string;
  is_work_for_fees?: boolean;
}) => {
  const response = await apiClient.get<IseopStudent[]>(ENDPOINTS.STUDENTS, { params });
  return response.data;
};

export const createStudent = async (data: CreateIseopStudentData) => {
  const response = await apiClient.post<IseopStudent>(ENDPOINTS.STUDENTS, data);
  return response.data;
};

export const updatestudents = async (id: number, data: Partial<IseopStudent>) => {
  const response = await apiClient.patch<IseopStudent>(`${ENDPOINTS.STUDENTS}${id}/`, data);
  return response.data;
};

export const deleteStudent = async (id: number) => {
  await apiClient.delete(`${ENDPOINTS.STUDENTS}${id}/`);
};

// 3. STATS
export const getstats = async (params?: { institution_id?: number }) => {
  const response = await apiClient.get<IseopStats>(ENDPOINTS.STATS, { params });
  return response.data;
};

// Alias for backwards compatibility
export const getanalysis = getstats;

// --- Service Object Export ---
const iseopService = {
  // Programs
  getprograms,
  createprograms,
  updateprograms,
  deleteprograms,
  // Students
  getstudents,
  createStudent,
  updatestudents,
  deleteStudent,
  // Stats
  getstats,
  getanalysis,
};

export default iseopService;
