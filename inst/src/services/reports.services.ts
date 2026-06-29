import apiClient from "./api";

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
  let url = `/academic/students/stem-students/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await apiClient.get<StemStudentsAPIResponse>(url);
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
  let url = `/academic/students/inclusivity-report/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await apiClient.get<InclusivityStudentsAPIResponse>(url);
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
  let url = `/academic/students/in-country-transfers/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await apiClient.get<InCountryTransfersAPIResponse>(url);
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
  let url = `/academic/students/possible-graduates/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await apiClient.get<PossibleGraduatesAPIResponse>(url);
  return response.data;
}

// Define interfaces for Specialized Students
export interface SpecializedStudent {
  id: number;
  student_id_number: string;
  full_name: string;
  program_name: string;
  gender: string;
  institution_name: string;
}

export interface SpecializedStudentsAPIResponse {
  total_students: number;
  male_students: number;
  female_students: number;
  results: SpecializedStudent[];
}

// Service for fetching Specialized Students
export async function getSpecializedStudents(institution_id: number, search_query?: string): Promise<SpecializedStudentsAPIResponse> {
  let url = `/academic/students/specialized-students/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await apiClient.get<SpecializedStudentsAPIResponse>(url);
  return response.data;
}

// Define interfaces for Critical Students
export interface CriticalStudent {
  id: number;
  student_id_number: string;
  full_name: string;
  program_name: string;
  gender: string;
  institution_name: string;
}

export interface CriticalStudentsAPIResponse {
  total_students: number;
  male_students: number;
  female_students: number;
  results: CriticalStudent[];
}

// Service for fetching Critical Students
export async function getCriticalStudents(institution_id: number, search_query?: string): Promise<CriticalStudentsAPIResponse> {
  let url = `/academic/students/critical-students/?institution_id=${institution_id}`;
  if (search_query) {
    url += `&search=${search_query}`;
  }
  const response = await apiClient.get<CriticalStudentsAPIResponse>(url);
  return response.data;
}
