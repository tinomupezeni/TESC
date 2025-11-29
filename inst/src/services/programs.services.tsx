import apiClient from "./api";

// --- Types ---

export interface Program {
  id: number;
  institution: number;
  institution_name?: string; // Read-only
  faculty: number;
  faculty_name?: string;     // Read-only
  name: string;
  code: string;
  duration: number;
  level: string;
  description: string;
  coordinator: string;
  student_capacity: number;
  modules: string;
  entry_requirements: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramData {
  faculty: number;
  name: string;
  code: string;
  duration: number;
  level: string;
  description?: string;
  coordinator?: string;
  student_capacity?: number;
  modules?: string;
  entry_requirements?: string;
}

const END_POINT = '/faculties/programs/';

// --- Service Functions ---

/**
 * Fetch all programs.
 * Supports filtering by faculty_id or institution_id via query params
 */
export const getPrograms = async (filters?: { faculty_id?: number; institution_id?: number }) => {
  try {
    const response = await apiClient.get<Program[]>(END_POINT, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching programs:", error);
    throw error;
  }
};

/**
 * Create a new program
 */
export const createProgram = async (data: CreateProgramData): Promise<Program> => {
  try {
    const response = await apiClient.post<Program>(END_POINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating program:", error);
    throw error;
  }
};

/**
 * Update a program
 */
export const updateProgram = async (id: number, data: Partial<CreateProgramData>): Promise<Program> => {
  try {
    const response = await apiClient.patch<Program>(`${END_POINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating program ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a program
 */
export const deleteProgram = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${END_POINT}${id}/`);
  } catch (error) {
    console.error(`Error deleting program ${id}:`, error);
    throw error;
  }
};

const programService = {
    getPrograms,
    createProgram,
    updateProgram,
    deleteProgram
};

export default programService;