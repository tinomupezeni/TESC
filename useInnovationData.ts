import { useQuery } from "@tanstack/react-query";
import InnovationService from "@/services/innovation.service";

export const useInnovationData = () => {
  const patentsQuery = useQuery({
    queryKey: ["innovation", "patents"],
    queryFn: InnovationService.getPatentStats,
  });

  const projectsQuery = useQuery({
    queryKey: ["innovation", "projects"],
    queryFn: InnovationService.getInnovationProjects,
  });

  const stagesQuery = useQuery({
    queryKey: ["innovation", "stages"],
    queryFn: InnovationService.getInnovationStageSummary,
  });

  const loading =
    patentsQuery.isLoading ||
    projectsQuery.isLoading ||
    stagesQuery.isLoading;

  return {
    loading,
    patentData: patentsQuery.data || [],
    innovationProjects: projectsQuery.data || [],
    stageFlowData: stagesQuery.data || [],
  };
};
