// services/academic.service.ts

import apiClient from "./api"; // Use your new api.ts
import { Program, Facility } from "@/lib/types/academic.types";

// --- Facility Endpoints ---

/**
 * Fetch all facilities
 */
export const getAllFacilities = async (): Promise<Facility[]> => {
  // Corrected path
  const response = await apiClient.get<Facility[]>("/academic/facilities/");
  return response.data;
};

// --- Program Endpoints ---

/**
 * Fetch all programs
 */
export const getAllPrograms = async (): Promise<Program[]> => {
  // Corrected path
  const response = await apiClient.get<Program[]>("/academic/programs/");
  return response.data;
};

/**
 * Fetch programs filtered by a specific institution ID
 */
export const getProgramsByInstitution = async (
  institutionId: number
): Promise<Program[]> => {
  // Corrected path
  const response = await apiClient.get<Program[]>("/academic/programs/", {
    params: { institution_id: institutionId },
  });
  return response.data;
};
