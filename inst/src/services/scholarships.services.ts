import apiClient from "@/services/api";

export interface StudentScholarship {
  id: number;
  student: number;
  student_name: string;
  student_id_number: string;
  student_gender?: string;
  program_name: string;
  institution_id: number;
  provider_name: string;
  amount: number | null;
  year_awarded: number;
  duration: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScholarshipData {
  student: number;
  provider_name: string;
  amount: number | null;
  year_awarded: number;
  duration?: string | null;
}

const END_POINT = "/academic/scholarships/";

export const getScholarships = async () => {
  const response = await apiClient.get<StudentScholarship[]>(END_POINT);
  return response.data;
};

export const createScholarship = async (data: CreateScholarshipData) => {
  const response = await apiClient.post<StudentScholarship>(END_POINT, data);
  return response.data;
};

export const updateScholarship = async (id: number, data: Partial<CreateScholarshipData>) => {
  const response = await apiClient.put<StudentScholarship>(`${END_POINT}${id}/`, data);
  return response.data;
};

export const deleteScholarship = async (id: number) => {
  const response = await apiClient.delete(`${END_POINT}${id}/`);
  return response.data;
};

export const scholarshipService = {
  getScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
};

export default scholarshipService;