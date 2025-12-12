import apiClient from "./api";

// --- Types ---

export interface Faculty {
  id: number;
  institution: number;
  institution_name: string;
  name: string;
  dean: string;
  location: string;
  email: string;
  description: string;
  status: 'Active' | 'Setup' | 'Review' | 'Archived';
  departments_count: number;
  created_at: string;
  updated_at: string;
}

export interface FacultyStats {
  total_faculties: number;
  active_faculties: number;
}

// Omit read-only fields for creation
export interface CreateFacultyData {
  institution: number; // ID of the institution
  name: string;
  dean?: string;
  location?: string;
  email?: string;
  description?: string;
  status?: string;
}

// Partial for updates
export interface UpdateFacultyData extends Partial<CreateFacultyData> {}

const END_POINT = '/faculties/faculties/';

// --- Service Functions ---

/**
 * Fetch all faculties.
 * Optionally filter by institution ID.
 */
export const getFaculties = async (): Promise<Faculty[]> => {
  const response = await apiClient.get<Faculty[]>(END_POINT);
  console.log(response);
  

  return response.data;
};

/**
 * Get a single faculty by ID
 */
export const getFaculty = async (id: number): Promise<Faculty> => {
  const response = await apiClient.get<Faculty>(`${END_POINT}${id}/`);
  return response.data;
};

/**
 * Create a new faculty
 */
export const createFaculty = async (data: CreateFacultyData): Promise<Faculty> => {
  const response = await apiClient.post<Faculty>(END_POINT, data);
  return response.data;
};

/**
 * Update an existing faculty (PATCH)
 */
export const updateFaculty = async (id: number, data: UpdateFacultyData): Promise<Faculty> => {
  const response = await apiClient.patch<Faculty>(`${END_POINT}${id}/`, data);
  return response.data;
};

/**
 * Delete a faculty
 */
export const deleteFaculty = async (id: number): Promise<void> => {
  await apiClient.delete(`${END_POINT}${id}/`);
};

/**
 * Get faculty summary statistics
 */
export const getFacultyStats = async (): Promise<FacultyStats> => {
  const response = await apiClient.get<FacultyStats>(`${END_POINT}stats/`);
  return response.data;
};

const facultyService = {
    getFaculties,
    getFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getFacultyStats
};

export default facultyService;