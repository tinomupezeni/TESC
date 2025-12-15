// services/academic.service.ts

import apiClient from "./api"; // Axios instance
import { Program, Facility, DetailedInnovation } from "@/lib/types/academic.types";
import type { DashboardInnovationStats } from "@/lib/types/academic.types";

// --- Facility Endpoints ---
export const getAllFacilities = async (): Promise<Facility[]> => {
  const response = await apiClient.get<Facility[]>("/academic/facilities/");
  return response.data;
};

// --- Program Endpoints ---
export const getAllPrograms = async (): Promise<Program[]> => {
  const response = await apiClient.get<Program[]>("/academic/programs/");
  return response.data;
};

export const getProgramsByInstitution = async (
  institutionId: number
): Promise<Program[]> => {
  const response = await apiClient.get<Program[]>("/academic/programs/", {
    params: { institution_id: institutionId },
  });
  return response.data;
};

// --- Innovation Endpoints ---
export const getInnovationStats = async (): Promise<DashboardInnovationStats> => {
  const response = await apiClient.get<DashboardInnovationStats>(
    "/academic/innovation/dashboard/stats/"
  );
  return response.data;
};

/**
 * Fetch all detailed innovations for the dashboard table
 */
export const getDetailedInnovations = async (): Promise<DetailedInnovation[]> => {
  const response = await apiClient.get<DetailedInnovation[]>(
    "/academic/dashboard/detailed-projects/"
  );
  return response.data;
};

