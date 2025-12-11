// frontend/src/lib/types/academic.types.ts

// --- Facility ---
export interface Facility {
  id: number;
  name: string;
}

// --- Institution (Read) ---
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
  student_count: number; // Total students enrolled
  program_count: number; // Total programs offered
}

// --- Institution (Write) ---
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

// --- Program (Read) ---
export interface Program {
  id: number;
  name: string;
  level: 'NC' | 'ND' | 'HND' | '1.1' | '2.1' | '3.1' | 'Other';
  institution: number; // Institution ID
  institution_name: string; // Institution name
  enrolled_students: number; // Number of students in the program
}

// --- Student (Read) ---
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
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: string; // Institution name
  program: string; // Program name
  created_at: string;
}

// --- Student (Write) ---
export interface StudentWriteData {
  student_id: string;
  national_id?: string | null;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string | null; // Format: 'YYYY-MM-DD'
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: number; // Institution ID
  program: number; // Program ID
}

// --- Paginated Response ---
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
