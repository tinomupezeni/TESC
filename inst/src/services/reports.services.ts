import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api'; // Define BASE_URL here

// Define interfaces for STEM Students
export interface StemStudent {
  id: number;
  student_id_number: string;
  full_name: string;
  program_name: string;
  gender: string;
  institution_name: string;
  // Add other relevant fields as they come from the API
}

export interface StemStudentsAPIResponse {
  total_students: number;
  male_students: number;
  female_students: number;
  results: StemStudent[];
}

// Service for fetching STEM students
export async function getStemStudents(institution_id: number, search_query?: string): Promise<StemStudentsAPIResponse> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let url = `${BASE_URL}/academic/students/stem-students/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
}

// Define interfaces for Inclusivity Students
export interface InclusivityStudent {
  id: number;
  student_id_number: string;
  full_name: string;
  program_name: string;
  gender: string;
  inclusivity_category: string;
  institution_name: string;
}

export interface InclusivityStudentsAPIResponse {
  total_students: number;
  male_students: number;
  female_students: number;
  results: InclusivityStudent[];
}

// Service for fetching Inclusivity students
export async function getInclusivityStudents(institution_id: number, search_query?: string): Promise<InclusivityStudentsAPIResponse> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let url = `${BASE_URL}/academic/students/inclusivity-report/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
}

// Define interfaces for In-Country Transfers
export interface InCountryTransfer {
  id: number;
  student_id_number: string;
  student_name: string;
  from_institution: string;
  to_institution: string;
  transfer_date: string;
}

export interface InCountryTransfersAPIResponse {
  results: InCountryTransfer[];
}

// Service for fetching In-Country transfers
export async function getInCountryTransfers(institution_id: number, search_query?: string): Promise<InCountryTransfersAPIResponse> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let url = `${BASE_URL}/academic/students/in-country-transfers/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
}

// Define interfaces for Possible Graduates
export interface PossibleGraduate {
  id: number;
  student_id_number: string;
  full_name: string;
  program_name: string;
  gender: string;
  enrollment_year: number;
  expected_graduation_year: number;
  institution_name: string;
}

export interface PossibleGraduatesAPIResponse {
  total_students: number;
  male_students: number;
  female_students: number;
  results: PossibleGraduate[];
}

// Service for fetching Possible Graduates
export async function getPossibleGraduates(institution_id: number, search_query?: string): Promise<PossibleGraduatesAPIResponse> {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let url = `${BASE_URL}/academic/students/possible-graduates/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
}
