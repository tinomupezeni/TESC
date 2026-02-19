import apiClient from "@/services/api";

// --- Types ---
export interface Student {
  id: number;
  student_id: string;
  national_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: "Male" | "Female" | "Other";
  date_of_birth?: string;
  enrollment_year: number;
  status: "Active" | "Attachment" | "Graduated" | "Suspended" | "Deferred" | "Dropout";
  institution: number;
  institution_name?: string;
  program: number;
  program_name?: string;
  
  // New Fields
  is_work_for_fees: boolean;
  work_area?: string | null;
  hours_pledged: number;
  disability_type: string;
  
  created_at: string;
  updated_at: string;
  graduation_year?: number | null;
  final_grade?: string | null;
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
  
  // New Fields
  is_work_for_fees?: boolean;
  work_area?: string | null;
  hours_pledged?: number;
  disability_type?: string;
}

export interface GraduationStat {
  graduation_year: number;
  program__name: string;
  program__level: string;
  total_graduates: number;
  distinctions: number;
  credits: number;
  passes: number;
  disabilities: number;
}

export interface StudentFilters {
  institution?: number;
  program?: number;
  search?: string;
}

// Updated Update type to include new fields
export type UpdateStudentData = Partial<CreateStudentData> & {
  graduation_year?: number | null;
  final_grade?: string | null;
  dropout_reason?: string | null;
};

const END_POINT = "/academic/students/";

// --- Service Functions ---

export const getStudents = async (filters?: StudentFilters) => {
  try {
    const response = await apiClient.get<Student[]>(END_POINT, {
      params: filters,
    });
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

export const createStudent = async (
  data: CreateStudentData
): Promise<Student> => {
  try {
    const response = await apiClient.post<Student>(END_POINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

export const updateStudent = async (
  id: number,
  data: UpdateStudentData
): Promise<Student> => {
  try {
    const response = await apiClient.patch<Student>(`${END_POINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

export const bulkUploadStudents = async (formData: FormData): Promise<any> => {
  try {
    const response = await apiClient.post(
      `${END_POINT}bulk_upload/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading students:", error);
    throw error;
  }
};

export const getGraduationStats = async (institutionId: number) => {
  const response = await apiClient.get<GraduationStat[]>(
    `${END_POINT}graduation-stats/`,
    { params: { institution_id: institutionId } }
  );
  return response.data;
};

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
  deleteStudent,
  bulkUploadStudents,
  getGraduationStats,
};

export default studentService;