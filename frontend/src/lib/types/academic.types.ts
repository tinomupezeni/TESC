// --- Dashboard & Chart Types ---
export interface StaffChartData {
  name: string;
  value: number;
  color?: string;
}

export interface StaffSummaryStats {
  kpis: {
    total: number;
    active: number;
    inactive: number;
    active_rate: number;
  };
  charts: {
    positions: StaffChartData[];
    faculties: StaffChartData[];
  };
}

export interface DashboardInnovationStats {
  total_projects: number;
  innovation_hubs: number;
  active_institutions: number;
  // Breakdown by stage for charts
  ideation: number;
  prototype: number;
  incubation: number;
  ip_registration: number;
  commercialisation: number;
  industrial: number;
}

// --- NEW: Completion Rate Interface ---
export interface ProgramCompletionStats {
  total_students: number;
  graduated: number;
  in_progress_on_time: number;
  in_progress_delayed: number;
  completion_rate_percentage: number;
}

// --- Facility & Institution ---
export interface Facility {
  id: number;
  name: string;
  current_usage: number;
}

export interface Institution {
  id: number;
  name: string;
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
  location: string;
  address: string;
  capacity: number;
  staff_count: number;
  status: 'Active' | 'Renovation' | 'Closed';
  established: number;
  facilities: Facility[];
  student_count: number;
  program_count: number;
}

export interface InstitutionWriteData {
  name: string;
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
  location: string;
  address?: string;
  capacity: number;
  staff: number;
  status: 'Active' | 'Renovation' | 'Closed';
  established: number;
  facility_ids?: number[];
}

// --- Program & Student ---
export interface Program {
  id: number;
  name: string;
  level: 'NC' | 'ND' | 'HND' | '1.1' | '2.1' | '3.1' | 'Other';
  institution: number;
  institution_name: string;
}

export interface Student {
  id: number;
  student_id: string;
  national_id: string | null;
  program_name: string;
  program_category: string; 
  institution_name: string;
  type: string;
  full_name: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth: string | null;
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: string;
  program: string;
  created_at: string;
}

export interface StudentWriteData {
  student_id: string;
  national_id?: string | null;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string | null;
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: number;
  program: number;
}

// --- Staff ---
export interface Staff {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  position: 'Professor' | 'Lecturer' | 'Assistant' | 'Admin' | 'Other';
  qualification: 'PhD' | 'Masters' | 'Bachelors' | 'Diploma' | 'Certificate' | 'Other';
  specialization?: string | null;
  date_joined: string;
  is_active: boolean;
  institution: number;
  institution_name?: string;
  faculty?: number | null;
  faculty_name?: string | null;
  department?: number | null;
  department_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffWriteData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: Staff['position'];
  qualification: Staff['qualification'];
  specialization?: string | null;
  date_joined: string;
  is_active?: boolean;
  institution: number;
  faculty?: number | null;
  department?: number | null;
}

// --- Innovation & IP ---
export interface IPRegistration {
  id: number;
  ip_type: string;
  ip_type_display: string;
  filing_route: string;
  filing_route_display: string;
  date_filed: string;
}

export interface DetailedInnovation {
  id: number;
  name: string;
  team_name: string;
  institution: number;
  institution_name: string;
  institution_type:string,
  hub: number | null;
  hub_name: string | null;
  sector: string;
  sector_display: string;
  stage: string;
  stage_display: string;
  problem_statement: string;
  proposed_solution: string;
  revenue_generated: number;
  funding_acquired: number;
  jobs_created: number;

  // --- Original nested IP details from API ---
  ip_details?: IPRegistration | null;

  // --- Flattened IP Fields for frontend usage ---
  ip_type: string | null; // e.g., "Patents" or "Integrated Circuit Lay-Out Designs"
  ip_route: string | null; // e.g., "National" or "Regional"
  ip_date: string | null; // ISO Date String, e.g., "2025-06-05"

  created_at: string;
  updated_at: string;
}

export interface InnovationHub {
  id: number;
  name: string;
  institution: number;
  location: string;
  
}

// --- Helpers ---
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GraduationStat {
  graduation_year: number;
  program__name: string;
  program__level: string;
  gender: 'Male' | 'Female' | 'Other';
  total_graduates: number;
  disabilities: number;
  distinctions: number;
  credits: number;
  passes: number;
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
}

// Summarized version for charts
export interface GraduationSummary {
  year: number;
  total: number;
  male: number;
  female: number;
  disabilities: number;
  programs: { [key: string]: number };
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
}

export interface StudentGraduate {
  id: number;
  student_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  // FIXED: API uses double underscore for related field
  program_name: string;
  program_level: string; // Added to match API
  // FIXED: Included based on API response
  program_category: string;
  institution_name: string;
  graduation_year: number;
  disabilities: number;
  final_grade: 'Distinction' | 'Credit' | 'Pass' | 'Fail';
  gender: string;
  status: 'Graduated';
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
  // Additional fields from API
  distinctions: number;
  credits: number;
  passes: number;
}

// --- ISEOP Types ---
export type IseopWorkArea = 'Library' | 'Grounds' | 'Labs' | 'Admin' | 'Cafeteria' | 'Maintenance';

export interface IseopProgram {
  id: number;
  institution: number;
  institution_name: string;
  name: string;
  capacity: number;
  occupied: number;
  status: 'Active' | 'Inactive' | 'Pending';
  activity_level: 'High' | 'Medium' | 'Low';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface IseopProgramWriteData {
  institution: number;
  name: string;
  capacity: number;
  occupied?: number;
  status?: 'Active' | 'Inactive' | 'Pending';
  activity_level?: 'High' | 'Medium' | 'Low';
  description?: string;
}

export interface IseopStudent {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  gender: 'Male' | 'Female' | 'Other';
  status: string;
  institution: number;
  institution_name: string;
  program: number;
  program_name: string;
  is_iseop: boolean;
  is_work_for_fees: boolean;
  work_area?: IseopWorkArea;
  hours_pledged: number;
  created_at: string;
}

export interface IseopEnrollData {
  student_id: number;
  is_work_for_fees?: boolean;
  work_area?: IseopWorkArea;
  hours_pledged?: number;
}

export interface IseopStats {
  programs: {
    total: number;
    active: number;
    capacity: number;
    occupied: number;
    utilization: number;
  };
  students: {
    total: number;
    work_for_fees: number;
    iseop_only: number;
  };
  work_areas: Array<{ work_area: string; count: number }>;
  gender_breakdown: Array<{ gender: string; count: number }>;
  status_breakdown: Array<{ status: string; count: number }>;
}