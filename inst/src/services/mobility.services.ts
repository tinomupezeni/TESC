import apiClient from "@/services/api";

export interface InternationalMobility {
  id: number;
  student: number;
  student_name: string;
  student_id_number: string;
  program_name: string;
  institution_id: number;
  direction: "Inbound" | "Outbound";
  country: string;
  foreign_institution?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMobilityData {
  student: number;
  direction: "Inbound" | "Outbound";
  country: string;
  foreign_institution?: string | null;
}

const END_POINT = "/academic/mobility/";

export const getMobility = async () => {
  const response = await apiClient.get<InternationalMobility[]>(END_POINT);
  return response.data;
};

export const createMobility = async (data: CreateMobilityData) => {
  const response = await apiClient.post<InternationalMobility>(END_POINT, data);
  return response.data;
};

export const mobilityService = {
  getMobility,
  createMobility,
};

export default mobilityService;