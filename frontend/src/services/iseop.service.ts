// services/iseop.service.ts

import apiClient from "./api";

// --- Types ---
export interface IseopStudent {
  id: number;
  institution: number;
  institution_name: string;
  student_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  status: "Active/Enrolled" | "Deferred" | "Completed";
  created_at: string;
  updated_at: string;
}

export interface IseopProgram {
  id: number;
  institution: number;
  institution_name: string;
  name: string;
  capacity: number;
  occupied: number;
  status: "Active" | "Full" | "Closed";
  activity_level: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const STUDENTS_PATH = "/iseop/students/";
const PROGRAMS_PATH = "/iseop/programs/";

/**
 * Fetch all ISEOP students
 */
export const getAllIseopStudents = async (): Promise<IseopStudent[]> => {
  const response = await apiClient.get<IseopStudent[]>(STUDENTS_PATH);
  return response.data;
};

/**
 * Fetch a single ISEOP student by ID
 */
export const getIseopStudentById = async (id: number): Promise<IseopStudent> => {
  const response = await apiClient.get<IseopStudent>(`${STUDENTS_PATH}${id}/`);
  return response.data;
};

/**
 * Fetch all ISEOP programs
 */
export const getAllIseopPrograms = async (): Promise<IseopProgram[]> => {
  const response = await apiClient.get<IseopProgram[]>(PROGRAMS_PATH);
  return response.data;
};

/**
 * Fetch a single ISEOP program by ID
 */
export const getIseopProgramById = async (id: number): Promise<IseopProgram> => {
  const response = await apiClient.get<IseopProgram>(`${PROGRAMS_PATH}${id}/`);
  return response.data;
};

export default {
  getAllIseopStudents,
  getIseopStudentById,
  getAllIseopPrograms,
  getIseopProgramById,
};
