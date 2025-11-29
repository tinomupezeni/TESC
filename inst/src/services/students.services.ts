import apiClient from "./api";

export interface Student {
  id: number;
  // user?: number; // Optional link to auth user
  student_id: string;
  national_id?: string;
  first_name: string;
  last_name: string;
  full_name: string; // Read-only from backend
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string; // ISO Date string (YYYY-MM-DD)
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  
  institution: number;
  institution_name?: string; // Read-only
  
  program: number;
  program_name?: string; // Read-only
  
  created_at: string;
  updated_at: string;
}

export interface CreateStudentData {
  student_id: string;
  national_id?: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth?: string;
  enrollment_year: number;
  status?: string;
  institution: number;
  program: number;
  // user?: number; 
}

export interface StudentFilters {
  institution_id?: number;
  program_id?: number;
  search?: string; // Matches first_name, last_name, student_id, national_id
}

const END_POINT = '/academic/students/';

// --- Service Functions ---

/**
 * Fetch all students.
 * Supports filtering by institution, program, or search query.
 */
export const getStudents = async (filters?: StudentFilters) => {
  try {
    const response = await apiClient.get<Student[]>(END_POINT, { params: filters });
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

/**
 * Get a single student by Database ID (not student_id string).
 */
export const getStudentById = async (id: number) => {
  try {
    const response = await apiClient.get<Student>(`${END_POINT}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new student.
 */
export const createStudent = async (data: CreateStudentData): Promise<Student> => {
  try {
    const response = await apiClient.post<Student>(END_POINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

/**
 * Update a student's information.
 * Uses PATCH to allow partial updates.
 */
export const updateStudent = async (id: number, data: Partial<CreateStudentData>): Promise<Student> => {
  try {
    const response = await apiClient.patch<Student>(`${END_POINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a student.
 */
export const deleteStudent = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${END_POINT}${id}/`);
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

const studentService = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};

export default studentService;