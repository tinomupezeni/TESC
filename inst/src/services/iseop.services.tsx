import apiClient from "./api";

/* =======================
   TYPES
   ======================= */
export type DisabilityType =
  | "None"
  | "Physical"
  | "Albino"
  | "Hearing"
  | "Visual"
  | "Intellectual"
  | "Psychosocial"
  | "Speech"
  | "Multiple";

export interface IseopStudent {
  id: number; // DB PK
  student_id: string;
  national_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  gender?: "Male" | "Female" | "Other";
  status?: "Active/Enrolled" | "Completed" | "Deferred";
  disability_type?: DisabilityType; // ✅ ADDED
  institution: number;
  program?: number | null;
  enrollment_year?: number | null;
  full_name?: string;
  program_name?: string;
}

export interface IseopProgram {
  id: number;
  institution: number;
  name: string;
}

/* =======================
   ENDPOINTS
   ======================= */
const ENDPOINTS = {
  STUDENTS: "/iseop/students/",
  PROGRAMS: "/iseop/programs/",
};

/* =======================
   STUDENTS
   ======================= */
export const createStudent = async (data: Partial<IseopStudent>) => {
  const res = await apiClient.post(ENDPOINTS.STUDENTS, {
    student_id: data.student_id,
    first_name: data.first_name,
    last_name: data.last_name,
    national_id: data.national_id,
    email: data.email,
    gender: data.gender,
    status: data.status,
    disability_type: data.disability_type ?? "None", // ✅ SENT TO DB
    institution: data.institution,
    program: data.program ?? null,
    enrollment_year: data.enrollment_year ?? null,
  });
  return res.data;
};

export const updateStudent = async (
  id: number,
  data: Partial<IseopStudent>
) => {
  const res = await apiClient.patch(`/iseop/students/${id}/`, {
    first_name: data.first_name,
    last_name: data.last_name,
    national_id: data.national_id,
    email: data.email,
    gender: data.gender,
    status: data.status,
    disability_type: data.disability_type ?? "None", // ✅ SENT TO DB
    program: data.program ?? null,
    enrollment_year: data.enrollment_year ?? null,
  });
  return res.data;
};

export const deleteStudent = async (id: number) => {
  const res = await apiClient.delete(`/iseop/students/${id}/`);
  return res.data;
};

export const getIseopStudents = async (params: { institution_id: number }) => {
  const res = await apiClient.get<IseopStudent[]>(
    ENDPOINTS.STUDENTS,
    { params }
  );
  return res.data;
};

/* =======================
   PROGRAMS
   ======================= */
export const getPrograms = async () => {
  const res = await apiClient.get<IseopProgram[]>(ENDPOINTS.PROGRAMS);
  return res.data;
};

const iseopService = {
  createStudent,
  updateStudent,
  deleteStudent,
  getIseopStudents,
  getPrograms,
};

export default iseopService;
