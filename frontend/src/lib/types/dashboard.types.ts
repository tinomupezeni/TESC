
// Define precise interfaces for type safety
export interface DashboardStats {
  total_students: number;
  active_institutions: number;
  graduates_year: number;
  completion_rate: number;
  breakdown: {
    teachers_colleges: number;
    polytechnics: number;
    industrial_training: number;
  };
}

export interface EnrollmentTrendItem {
  year: string;
  [key: string]: string | number; // Allows dynamic keys like "Polytechnic": 1200
}

export interface InstitutionOverviewItem {
  id: number;
  name: string;
  type: string;
  location: string;
  students: number; // mapped from student_count
  capacity: number;
  programs: number; // mapped from program_count
  status: 'Active' | 'Renovation' | 'Closed';
  utilization: number;
}
