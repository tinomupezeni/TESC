// lib/types/academic.types.ts
export interface DashboardInnovationStats {
  total_projects: number;        // matches API
  innovation_hubs: number;
  active_institutions: number;
  ideation: number;
  prototype: number;
  incubation: number;
  market_ready: number;
  scaling: number;
  industrial: number;
}
// From FacilitySerializer
export interface Facility {
  id: number;
  name: string;
  current_usage:number;
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
  student_count: number; // <-- ADD THIS
  program_count: number; // <-- ADD THIS
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
  level: 'NC' | 'ND' | 'HND' | '1.1' | '2.1' | '3.1' | 'Other';
  institution: number; // This is the ID
  institution_name: string; // This is the string name
}

// From StudentReadSerializer
export interface Student {
  id: number;
  student_id: string;
  national_id: string | null;
  program_name: string;
  institution_name: string;
  full_name: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth: string | null; // Dates come as strings
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: string; // StringRelatedField
  program: string; // StringRelatedField
  created_at: string;
}

// From StudentWriteSerializer
export interface StudentWriteData {
  student_id: string;
  national_id?: string | null;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string | null; // Format: 'YYYY-MM-DD'
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: number; // ID of the institution
  program: number; // ID of the program
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface DetailedInnovation {
  id: string;
  name: string;
  institution: string;
  stage: string;
  status: string;
}
