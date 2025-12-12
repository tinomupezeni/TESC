import apiClient from "./api";

// --- Types ---

export interface Staff {
  id: number;
  user?: number | null; // ID of the linked Auth User
  institution: number;
  institution_name: string; // Read-only from backend
  faculty?: number | null;
  faculty_name?: string;    // Read-only from backend
  
  first_name: string;
  last_name: string;
  full_name: string;        // Read-only
  email: string;
  phone: string;
  
  employee_id: string;
  position: 'Professor' | 'Lecturer' | 'Assistant' | 'Admin' | 'Other';
  department: string;
  
  qualification: 'PhD' | 'Masters' | 'Bachelors' | 'Diploma' | 'Certificate' | 'Other';
  specialization: string;
  
  date_joined: string; // YYYY-MM-DD
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface CreateStaffData {
  institution: number;
  faculty?: number; // Optional
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_id: string;
  position: string;
  department: string;
  qualification: string;
  specialization?: string;
  date_joined: string;
  is_active?: boolean;
}

export interface Vacancy {
  id: number;
  institution: number;
  title: string;
  department: string;
  faculty?: string;
  quantity: number;
  deadline: string; // YYYY-MM-DD
  description?: string;
  status: 'Open' | 'Closed';
  created_at: string;
}

export interface CreateVacancyData {
  institution: number;
  title: string;
  department: string;
  faculty?: string;
  quantity: number;
  deadline: string;
  description?: string;
}

export interface StaffFilters {
  institution_id?: number;
  faculty_id?: number;
  status?: 'active' | 'inactive';
  search?: string; // Search by name, email, employee_id
}

const END_POINT = '/staff/members/';
const VACANCY_ENDPOINT = '/staff/vacancies/'; // Assuming this endpoint exists

// --- Service Functions ---

/**
 * Fetch all staff members.
 * Supports filtering by institution, faculty, status, or search query.
 */
export const getStaff = async (filters?: StaffFilters) => {
  try {
    const response = await apiClient.get<Staff[]>(END_POINT, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
};



/**
 * Get a single staff member by ID.
 */
export const getStaffById = async (id: number) => {
  try {
    const response = await apiClient.get<Staff>(`${END_POINT}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff member ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new staff member.
 */
export const createStaff = async (data: CreateStaffData): Promise<Staff> => {
  try {
    const response = await apiClient.post<Staff>(END_POINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating staff member:", error);
    throw error;
  }
};

/**
 * Update a staff member's information.
 */
export const updateStaff = async (id: number, data: Partial<CreateStaffData>): Promise<Staff> => {
  try {
    const response = await apiClient.patch<Staff>(`${END_POINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating staff member ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a staff member.
 */
export const deleteStaff = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${END_POINT}${id}/`);
  } catch (error) {
    console.error(`Error deleting staff member ${id}:`, error);
    throw error;
  }
};

export const getVacancies = async (institutionId: number) => {
  try {
    const response = await apiClient.get<Vacancy[]>(VACANCY_ENDPOINT, { 
      params: { institution: institutionId, status: 'Open' } 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching vacancies:", error);
    throw error;
  }
};

export const createVacancy = async (data: CreateVacancyData): Promise<Vacancy> => {
  try {
    const response = await apiClient.post<Vacancy>(VACANCY_ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating vacancy:", error);
    throw error;
  }
};

export const deleteVacancy = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${VACANCY_ENDPOINT}${id}/`);
  } catch (error) {
    console.error(`Error deleting vacancy ${id}:`, error);
    throw error;
  }
};

export const bulkUploadStaff = async (formData: FormData): Promise<any> => {
  try {
    // Note: Don't set Content-Type header manually here; 
    // axios/browser sets it automatically with the boundary for FormData
    const response = await apiClient.post(`${END_POINT}bulk_upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading bulk staff:", error);
    throw error;
  }
};

const staffService = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getVacancies,
  createVacancy,
  deleteVacancy,
  bulkUploadStaff,
};

export default staffService;