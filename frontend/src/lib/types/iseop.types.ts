// lib/types/iseop.types.ts

export interface IseopStudent {
  id: number;
  institution: number;
  institution_name: string; // Must match serializer output
  first_name: string;
  last_name: string;
  full_name: string;
  student_id: string;

  email: string | null;
  program: number | null;
  program_name: string; // Must match serializer output
  gender: string | null;
  enrollment_year: number | null;
  status: 'Active/Enrolled' | 'Deferred' | 'Completed';
  created_at: string;
}

export interface IseopStats {
  total_students: number;
  total_programs: number;

  status_breakdown: Record<string, number>;

  gender_stats: {
    male: number;
    female: number;
    male_pct: number;
    female_pct: number;
  };

  disability_stats: {
    with_disability: number;
    with_disability_pct: number;
    by_type: Record<string, number>;
  };

  program_capacity: {
    total_capacity: number;
    total_occupied: number;
    utilization_rate: number;
  };

  year_breakdown: Record<string, number>;
  program_breakdown: Record<string, number>;

  program_year_trends: {
    [program: string]: {
      [year: string]: {
        enrolled: number;
        completed: number;
      };
    };
  };
}
