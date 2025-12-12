import apiClient from "@/services/api";

// --- Types ---
export interface Student {
  id: number;
  student_id: string;
  national_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: number;
  institution_name?: string;
  program: number;
  program_name?: string;
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
  institution: number; // We will pass this from the component
  program: number;
}

export interface StudentFilters {
  institution?: number; 
  program?: number;
  search?: string;
}

const END_POINT = '/academic/students/';

// --- Service Functions ---

export const getStudents = async (filters?: StudentFilters) => {
  try {
    // We simply pass the filters provided by the component
    const response = await apiClient.get<Student[]>(END_POINT, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export const getStudentById = async (id: number) => {
  try {
    const response = await apiClient.get<Student>(`${END_POINT}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};

export const createStudent = async (data: CreateStudentData): Promise<Student> => {
  try {
    const response = await apiClient.post<Student>(END_POINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

// ... updateStudent and deleteStudent remain the same ...

const studentService = {
  getStudents,
  getStudentById,
  createStudent,
  // ...
};

export default studentService;