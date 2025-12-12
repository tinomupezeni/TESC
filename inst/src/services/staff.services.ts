import apiClient from "./api";
import * as XLSX from "xlsx"; // Import SheetJS
// --- Types ---

export interface Staff {
  id: number;
  user?: number | null;
  institution: number;
  institution_name: string;
  faculty?: number | null;
  faculty_name?: string;
  department?: number | null; // Added based on recent changes
  department_name?: string;   // Added based on recent changes
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  position: string;
  qualification: string;
  specialization: string;
  date_joined: string;
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

/**
 * Export a list of staff members to an Excel file (.xlsx).
 * * @param staffList - Array of Staff objects to export
 * @param filename - Name of the file to download (default: 'Staff_List.xlsx')
 */
export const exportStaffToExcel = (staffList: Staff[], filename: string = "Staff_List.xlsx") => {
  if (!staffList || staffList.length === 0) {
    console.warn("No staff data to export.");
    return;
  }

  // 1. Prepare Data for Excel
  // We map the raw data to "User Friendly" column headers
  const excelData = staffList.map((staff) => ({
    "Employee ID": staff.employee_id,
    "First Name": staff.first_name,
    "Last Name": staff.last_name,
    "Email": staff.email,
    "Phone": staff.phone,
    "Position": staff.position,
    "Faculty": staff.faculty_name || "N/A",
    "Department": staff.department_name || "N/A",
    "Qualification": staff.qualification,
    "Specialization": staff.specialization,
    "Status": staff.is_active ? "Active" : "Inactive",
    "Date Joined": staff.date_joined,
  }));

  // 2. Create Workbook and Worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Directory");

  // 3. Trigger Download
  // This automatically creates a blob and triggers the browser download behavior
  XLSX.writeFile(workbook, filename);
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
  exportStaffToExcel,
};

export default staffService;