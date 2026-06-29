import { useState } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Filter, Briefcase, Banknote, TrendingUp, Users, Edit, Building2, Trash2, Loader2 
} from "lucide-react";
import { ProjectFormDialog } from "./InnovationForms";
import { deleteProject } from "@/services/innovation.services";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper for stage colors
const getStageColor = (stage: string) => {
  switch (stage) {
    case 'ideation': return "bg-gray-100 text-gray-800 border-gray-200";
    case 'prototype': return "bg-purple-100 text-purple-800 border-purple-200";
    case 'incubation': return "bg-blue-100 text-blue-800 border-blue-200";
    case 'ip_registration': return "bg-green-100 text-green-800 border-green-200";
    case 'commercialisation': return "bg-amber-100 text-amber-800 border-amber-200";
    case 'industrial': return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default: return "bg-secondary text-secondary-foreground";
  }
};

interface ProjectManagerProps {
  projects: any[];
  onRefresh?: () => void;
}

const ProjectManager = ({ projects = [], onRefresh }: ProjectManagerProps) => {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      toast.success("Project deleted successfully");
      setProjectToDelete(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to delete project");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                          p.team_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || p.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-background p-1 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-10 h-10 sm:h-11" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 sm:h-11 text-xs sm:text-sm">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder="All Stages" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="ideation">Ideation</SelectItem>
              <SelectItem value="prototype">Prototyping</SelectItem>
              <SelectItem value="incubation">Incubation</SelectItem>
              <SelectItem value="ip_registration">IP Registration</SelectItem>
              <SelectItem value="commercialisation">Commercialisation</SelectItem>
              <SelectItem value="industrial">Industrialised</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Create Button */}
        <div className="w-full lg:w-auto">
          <ProjectFormDialog onSuccess={onRefresh} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 flex flex-col mx-1 border-none sm:border border-l-primary" style={{ borderLeftWidth: '4px', borderLeftColor: project.stage === 'industrial' ? '#4f46e5' : 'hsl(var(--primary))' }}>
            <CardHeader className="p-4 sm:p-6 pb-3 relative">
              <div className="flex justify-between items-start mb-2 gap-2">
                <Badge className={`uppercase text-[10px] font-bold tracking-wider px-1.5 py-0.5 whitespace-nowrap ${getStageColor(project.stage)}`}>
                  {project.stage_display || project.stage}
                </Badge>

                <div className="flex items-center gap-1">
                  {/* EDIT BUTTON */}
                  <ProjectFormDialog 
                    project={project} 
                    onSuccess={onRefresh}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                  {/* DELETE BUTTON */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setProjectToDelete(project)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <CardTitle className="text-lg sm:text-xl font-bold leading-tight line-clamp-1 pr-6 uppercase" title={project.name}>
                {project.name}
              </CardTitle>

              <div className="flex flex-col gap-1 mt-1.5">
                <CardDescription className="flex items-center gap-2 text-[10px] sm:text-xs">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate uppercase">{project.sector_display || project.sector}</span>
                </CardDescription>
                {project.hub_name && (
                    <CardDescription className="flex items-center gap-2 text-indigo-600 text-[10px] sm:text-xs">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-medium uppercase">{project.hub_name}</span>
                    </CardDescription>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-0 pb-3 flex-1">
              <div className="mb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[32px] sm:min-h-[40px] uppercase">
                    {project.problem_statement || "NO DESCRIPTION PROVIDED."}
                  </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> REVENUE
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600">
                        ${parseFloat(project.revenue_generated || '0').toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 pl-2 border-l">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> FUNDING
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-blue-600">
                        ${parseFloat(project.funding_acquired || '0').toLocaleString()}
                    </p>
                  </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 sm:p-6 pt-0 flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0" title="Team Name">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium text-foreground truncate uppercase">
                    {project.team_name}
                  </span>
                </div>
                {project.jobs_created > 0 && (
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] shrink-0">
                    {project.jobs_created} JOBS
                  </Badge>
                )}
            </CardFooter>
          </Card>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10 mx-1">
            <Filter className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-base sm:text-lg font-medium">NO PROJECTS FOUND</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ARE YOU ABSOLUTELY SURE?</DialogTitle>
            <DialogDescription>
              THIS ACTION CANNOT BE UNDONE. THIS WILL PERMANENTLY DELETE THE PROJECT{" "}
              <span className="font-semibold text-foreground">{projectToDelete?.name?.toUpperCase()}</span> AND ALL ASSOCIATED DATA.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProjectToDelete(null)} disabled={isDeleting}>
              CANCEL
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              DELETE PROJECT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManager;