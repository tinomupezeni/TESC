import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api'; // Define BASE_URL here

// --- INTERFACES ---

// Interface for reading student data
export interface Student {
  id: number;
  student_id_number: string;
  first_name: string;
  last_name: string;
  full_name: string; // Combined name
  gender: string;
  institution_name: string;
  program_name: string;
  // Add other common student fields as needed
}

// Interface for creating a student
export interface CreateStudentData {
  student_id: string;
  first_name: string;
  last_name: string;
  program: number | string; // Program ID
  institution: number;
  gender: string;
  date_of_birth?: string;
  enrollment_year?: number;
  status?: string;
  national_id?: string;
  is_work_for_fees?: boolean;
  inclusivity_category?: string;
  work_area?: string | null;
  hours_pledged?: number;
}

// Interface for updating a student
export interface UpdateStudentData {
  first_name?: string;
  last_name?: string;
  student_id?: string;
  national_id?: string;
  gender?: string;
  date_of_birth?: string | null;
  enrollment_year?: number;
  status?: string;
  program?: number;
  institution?: number;
  graduation_year?: number | null;
  final_grade?: string | null;
  dropout_reason?: string | null;
  selected_level?: string;
  selected_category?: string;
  is_work_for_fees?: boolean;
  hours_pledged?: number;
  fee_status?: string;
  disability_type?: string;
  work_area?: string | null;
}

// --- API FUNCTIONS (Named Exports) ---

export async function getStudents(params: { institution_id: number; search?: string }): Promise<Student[]> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let url = `${BASE_URL}/academic/students/?institution_id=${params.institution_id}`;
  if (params.search) {
    url += `&search=${params.search}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
}

export async function createStudent(data: CreateStudentData): Promise<any> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const url = `${BASE_URL}/academic/students/`;
  const response = await axios.post(url, data, { headers });
  return response.data;
}

export async function updateStudent(id: number, data: UpdateStudentData): Promise<any> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const url = `${BASE_URL}/academic/students/${id}/`;
  const response = await axios.patch(url, data, { headers });
  return response.data;
}

export async function bulkUploadStudents(data: FormData): Promise<any> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  } : {
    'Content-Type': 'multipart/form-data',
  };
  const url = `${BASE_URL}/academic/students/bulk_upload/`;
  const response = await axios.post(url, data, { headers });
  return response.data;
}

export async function deleteStudent(id: number): Promise<void> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const url = `${BASE_URL}/academic/students/${id}/`;
  await axios.delete(url, { headers });
}

// Default export
const studentService = {
  getStudents,
  createStudent,
  updateStudent,
  bulkUploadStudents,
  deleteStudent,
};

export default studentService;
