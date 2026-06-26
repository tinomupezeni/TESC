import { useState, useEffect } from "react";
// Import the updated service and the Partnership type
import { InnovationAnalyticsService, type Partnership } from "@/services/innovation.services";                
import type { DashboardInnovationStats, DetailedInnovation } from "@/lib/types/academic.types";

export const useInnovationStats = () => {
    const [data, setData] = useState<DashboardInnovationStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const stats = await InnovationAnalyticsService.getInnovationStats();
                if (!mounted) return;
                setData(stats);
            } catch (err) { if(!mounted) return; setError(err); }
            finally { if(!mounted) return; setLoading(false); }
        };
        load();
        return () => { mounted = false; };
    }, []);

    return { data, loading, error };
};

// --- UPDATED PARTNERSHIPS HOOK ---
export const usePartnerships = () => {
  const [data, setData] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
      let mounted = true;
      const load = async () => {
          try {
              // Now calling the service method we just added
              const partnerships = await InnovationAnalyticsService.getPartnerships(); 
              if (!mounted) return;
              setData(partnerships);
          } catch (err) { if(!mounted) return; setError(err); }
          finally { if(!mounted) return; setLoading(false); }
      };
      load();
      return () => { mounted = false; };
  }, []);

  return { data, loading, error };
};

export const useDetailedInnovations = () => {
    const [data, setData] = useState<DetailedInnovation[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const projects = await InnovationAnalyticsService.getDetailedInnovations();
                if (!mounted) return;
                setData(projects);
            } catch (err) { if(!mounted) return; setError(err); }
            finally { if(!mounted) return; setLoading(false); }
        };
        load();
        return () => { mounted = false; };
    }, []);

    return { data, loading, error };
};