import apiClient from "@/services/api";

export interface IndustryPlacement {
  id: number;
  student: number;
  student_name: string;
  student_id_number: string;
  program_name: string;
  institution_id: number;
  placement_type: "Attachment" | "Apprenticeship";
  company_name: string;
  start_date: string;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePlacementData {
  student: number;
  placement_type: "Attachment" | "Apprenticeship";
  company_name: string;
  start_date: string;
  end_date?: string | null;
}

const END_POINT = "/academic/placements/";

export const getPlacements = async () => {
  const response = await apiClient.get<IndustryPlacement[]>(END_POINT);
  return response.data;
};

export const createPlacement = async (data: CreatePlacementData) => {
  const response = await apiClient.post<IndustryPlacement>(END_POINT, data);
  return response.data;
};

export const updatePlacement = async (id: number, data: Partial<CreatePlacementData>) => {
  const response = await apiClient.patch<IndustryPlacement>(`${END_POINT}${id}/`, data);
  return response.data;
};

export const deletePlacement = async (id: number) => {
  await apiClient.delete(`${END_POINT}${id}/`);
};

export const placementService = {
  getPlacements,
  createPlacement,
  updatePlacement,
  deletePlacement,
};

export default placementService;