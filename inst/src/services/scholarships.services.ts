import apiClient from "@/services/api";

export interface StudentScholarship {
  id: number;
  student: number;
  student_name: string;
  student_id_number: string;
  program_name: string;
  institution_id: number;
  provider_name: string;
  amount: number | null;
  year_awarded: number;
  created_at: string;
  updated_at: string;
}

export interface CreateScholarshipData {
  student: number;
  provider_name: string;
  amount: number | null;
  year_awarded: number;
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

export const scholarshipService = {
  getScholarships,
  createScholarship,
};

export default scholarshipService;