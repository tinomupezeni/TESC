// src/hooks/useFacilitiesStats.ts
import { useState, useEffect } from "react";

export interface Facility {
  id: number;
  institution: number;
  institution_name: string;
  name: string;
  facility_type: string;
  building: string;
  capacity: number;
  status: string;
  description?: string;
  equipment?: string;
  manager?: string;
  contact_number?: string;
}

export function useFacilities() {
  const [data, setData] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadFacilities() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/academic/facilities/");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        setData(json);
      } catch (err: any) {
        if (!mounted) return;
        console.error("Error fetching facilities:", err);
        setError(err.message || "Unknown error");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadFacilities();
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
