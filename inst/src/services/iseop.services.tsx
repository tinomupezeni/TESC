import apiClient from "./api";

// --- Types ---

// Enums based on your Django Choices (Updated for Student/Program context)
export type Sector = 'agritech' | 'edtech' | 'healthtech' | 'fintech' | 'mining' | 'energy' | 'manufacturing' | 'other';
export type ProjectStage = 'ideation' | 'prototype' | 'incubation' | 'registered_ips' | 'commercialisation' | 'industrial';
export type HubStatus = 'High' | 'Medium' | 'Full';

// 1. Program Interface (Mapped from InnovationHub)
export interface InnovationHub {
  id: number;
  institution: number;
  name: string;
  capacity: number;
  occupied: number;
  services: number;
  status: HubStatus;
}

// 2. Student Detail Interface (Mapped from Project)
export interface Project {
  id: number;
  institution: number;
  hub?: number | null; 
  name: string;
  team_name: string;
  sector: Sector;
  location_category: 'Urban' | 'Rural';
  stage: ProjectStage;
  stage_display?: string; 
  problem_statement: string;
  proposed_solution: string;
  revenue_generated: number;
  funding_acquired: number;
  jobs_created: number;
  created_at?: string;
}

// 3. Analysis Interface (Mapped from Partnership)
export interface Partnership {
  id: number;
  institution: number;
  partner_name: string;
  focus_area: string;
  agreement_date: string; 
  status: string;
}

// 4. Research Grant Interface
export interface ResearchGrant {
  id: number;
  institution: number;
  project: number; 
  project_name?: string; 
  donor: string;
  amount: number;
  date_awarded: string;
}

// --- API Endpoints ---
const ENDPOINTS = {
  STUDENTSDETAILS: '/innovation/studentsdetails/',
  PROGRAMS: '/innovation/programs/',
  ANALYSIS: '/innovation/analysis/',
  GRANTS: '/innovation/grants/',
};

// --- Service Functions ---

// 1. STUDENTS DETAILS
export const getstudents = async (params?: { institution_id?: number; search?: string }) => {
  const response = await apiClient.get<Project[]>(ENDPOINTS.STUDENTSDETAILS, { params });
  return response.data;
};

export const createstudents = async (data: Partial<Project>) => {
  const response = await apiClient.post<Project>(ENDPOINTS.STUDENTSDETAILS, data);
  return response.data;
};

export const updatestudents = async (id: number, data: Partial<Project>) => {
  const response = await apiClient.patch<Project>(`${ENDPOINTS.STUDENTSDETAILS}${id}/`, data);
  return response.data;
};

export const deletestudents = async (id: number) => {
  await apiClient.delete(`${ENDPOINTS.STUDENTSDETAILS}${id}/`);
};

// 2. PROGRAMS
export const getprograms = async (params?: { institution_id?: number }) => {
  const response = await apiClient.get<InnovationHub[]>(ENDPOINTS.PROGRAMS, { params });
  return response.data;
};

export const createprograms = async (data: Partial<InnovationHub>) => {
  const response = await apiClient.post<InnovationHub>(ENDPOINTS.PROGRAMS, data);
  return response.data;
};

export const updateprograms = async (id: number, data: Partial<InnovationHub>) => {
  const response = await apiClient.patch<InnovationHub>(`${ENDPOINTS.PROGRAMS}${id}/`, data);
  return response.data;
};

// 3. ANALYSIS
export const getanalysis = async (params?: { institution_id?: number }) => {
  const response = await apiClient.get<Partnership[]>(ENDPOINTS.ANALYSIS, { params });
  return response.data;
};

export const createanalysis = async (data: Partial<Partnership>) => {
  const response = await apiClient.post<Partnership>(ENDPOINTS.ANALYSIS, data);
  return response.data;
};

export const updateanalysis = async (id: number, data: Partial<Partnership>) => {
  const response = await apiClient.patch<Partnership>(`${ENDPOINTS.ANALYSIS}${id}/`, data);
  return response.data;
};

// 4. GRANTS
export const getgrants = async (params?: { institution_id?: number }) => {
  const response = await apiClient.get<ResearchGrant[]>(ENDPOINTS.GRANTS, { params });
  return response.data;
};

export const creategrants = async (data: Partial<ResearchGrant>) => {
  const response = await apiClient.post<ResearchGrant>(ENDPOINTS.GRANTS, data);
  return response.data;
};

export const updategrants = async (id: number, data: Partial<ResearchGrant>) => {
  const response = await apiClient.patch<ResearchGrant>(`${ENDPOINTS.GRANTS}${id}/`, data);
  return response.data;
};

// --- Service Object Export ---
const iseopService = {
  getstudents,
  createstudents,
  updatestudents,
  deletestudents,
  getprograms,
  createprograms,
  updateprograms,
  getanalysis,
  createanalysis,
  updateanalysis,
  getgrants,
  creategrants,
  updategrants
};

export default iseopService;