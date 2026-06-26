// lib/types/academic.types.ts

// From FacilitySerializer
export interface Facility {
  id: number;
  name: string;
}

// From InstitutionSerializer (Read)
export interface Institution {
  id: number;
  name: string;
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
  location: string;
  address: string;
  capacity: number;
  staff: number;
  status: 'Active' | 'Renovation' | 'Closed';
  established: number;
  facilities: Facility[];
  student_count: number; 
  program_count: number;
  user_count?: number; // Added
  staff_count?: number; // Added
}

// For InstitutionSerializer (Write)
export interface InstitutionWriteData {
  name: string;
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
  location: string;
  address?: string;
  capacity: number;
  staff: number;
  status: 'Active' | 'Renovation' | 'Closed';
  established: number;
  facility_ids?: number[]; // List of facility IDs
}

// From ProgramSerializer (Read)
export interface Program {
  id: number;
  name: string;
  code: string;
  levels: string[]; // List of levels
  categories: string[]; // List of categories
  institution: number; 
  institution_name: string; 
  department?: number;
  department_name?: string;
  duration?: number;
  description?: string;
  coordinator?: string;
  student_capacity?: number;
  modules?: string;
  entry_requirements?: string;
  
  // Deprecated single fields
  level?: string;
  category?: string;
}

// From StudentReadSerializer
export interface Student {
  id: number;
  student_id: string;
  national_id: string | null;
  full_name: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth: string | null; 
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred' | 'Dropout';
  institution: string; 
  program: string; 
  program_name?: string;
  selected_level?: string;
  selected_category?: string;
  is_work_for_fees?: boolean;
  work_area?: string;
  hours_pledged?: number;
  disability_type?: string;
  created_at: string;
}

// From StudentWriteSerializer
export interface StudentWriteData {
  student_id: string;
  national_id?: string | null;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string | null; 
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred' | 'Dropout';
  institution: number; 
  program: number; 
  selected_level?: string;
  selected_category?: string;
  is_work_for_fees?: boolean;
  work_area?: string | null;
  hours_pledged?: number;
  disability_type?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
