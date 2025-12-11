// frontend/src/services/program.service.ts
import axios from "axios";
import { Program } from "@/lib/types/academic.types";

export const getAllPrograms = async (): Promise<Program[]> => {
  const { data } = await axios.get("/api/programs"); // adjust your API endpoint
  return data;
};
