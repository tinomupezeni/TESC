import apiClient from "./api";

// --- Types ---

export type InnovationCategory = 'agritech' | 'edtech' | 'healthtech' | 'fintech' | 'greentech' | 'other';
export type InnovationStage = 'idea' | 'incubation' | 'prototype' | 'market';
export type InnovationStatus = 'pending' | 'approved' | 'rejected';

export interface Innovation {
  id: number;
  institution: number;
  institution_name: string; // Read-only
  title: string;
  category: InnovationCategory;
  category_display: string; // Read-only human readable
  team_name: string;
  department: string;
  problem_statement: string;
  proposed_solution: string;
  team_size: number;
  timeline_months: number;
  stage: InnovationStage;
  stage_display: string;    // Read-only human readable
  status: InnovationStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateInnovationData {
  institution: number;
  title: string;
  category: string;
  team_name: string;
  department: string;
  problem_statement: string;
  proposed_solution: string;
  team_size: number;
  timeline_months: number;
  stage: string;
}

export interface InnovationFilters {
  institution_id?: number;
  category?: string;
  stage?: string;
  search?: string; // Search by title, team_name, department
}

const END_POINT = '/academic/innovations/';

// --- Service Functions ---

/**
 * Fetch all innovations.
 * Supports filtering by institution, category, stage, or search query.
 */
export const getInnovations = async (filters?: InnovationFilters) => {
  try {
    const response = await apiClient.get<Innovation[]>(END_POINT, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching innovations:", error);
    throw error;
  }
};

/**
 * Get a single innovation by ID.
 */
export const getInnovationById = async (id: number) => {
  try {
    const response = await apiClient.get<Innovation>(`${END_POINT}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching innovation ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new innovation.
 */
export const createInnovation = async (data: CreateInnovationData): Promise<Innovation> => {
  try {
    const response = await apiClient.post<Innovation>(END_POINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating innovation:", error);
    throw error;
  }
};

/**
 * Update an innovation's information.
 */
export const updateInnovation = async (id: number, data: Partial<CreateInnovationData>): Promise<Innovation> => {
  try {
    const response = await apiClient.patch<Innovation>(`${END_POINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating innovation ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an innovation.
 */
export const deleteInnovation = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${END_POINT}${id}/`);
  } catch (error) {
    console.error(`Error deleting innovation ${id}:`, error);
    throw error;
  }
};

const innovationService = {
  getInnovations,
  getInnovationById,
  createInnovation,
  updateInnovation,
  deleteInnovation
};

export default innovationService;