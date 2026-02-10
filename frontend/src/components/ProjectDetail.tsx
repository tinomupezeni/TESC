import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";

interface ProjectViewProps {
  project: any;
  onClose: () => void;
}

export function ProjectView({ project, onClose }: ProjectViewProps) {
  return (
    <Dialog open={!!project} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
          <DialogDescription>{project?.name} ({project?.team_name}) from {project?.institution_name}</DialogDescription>
        </DialogHeader>

        {project && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Project Name</p><p className="font-medium">{project.name}</p></div>
                  <div><p className="text-sm text-muted-foreground">Team</p><p className="font-medium">{project.team_name}</p></div>
                  <div><p className="text-sm text-muted-foreground">Institution</p><p className="font-medium">{project.institution_name}</p></div>
                  <div><p className="text-sm text-muted-foreground">Hub</p><p className="font-medium">{project.hub_name || "No Hub"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Stage</p>
                    <Badge variant="outline" style={{ borderColor: project.stage_color, color: project.stage_color }}>{project.stage_display}</Badge>
                  </div>
                  <div><p className="text-sm text-muted-foreground">Sector</p><p className="font-medium">{project.sector_display}</p></div>
                  <div><p className="text-sm text-muted-foreground">IP Type</p><p className="font-medium">{project.ip_type || "Unregistered"}</p></div>
                  <div><p className="text-sm text-muted-foreground">IP Route</p><p className="font-medium">{project.ip_route || "-"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Date Filed</p><p className="font-medium">{project.ip_date ? new Date(project.ip_date).toLocaleDateString() : "-"}</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>Problem Statement:</strong><p>{project.problem_statement}</p></div>
                  <div><strong>Proposed Solution:</strong><p>{project.proposed_solution}</p></div>
                  <div className="flex gap-4">
                    <div><strong>Revenue Generated:</strong> ${project.revenue_generated || 0}</div>
                    <div><strong>Funding Acquired:</strong> ${project.funding_acquired || 0}</div>
                    <div><strong>Jobs Created:</strong> {project.jobs_created || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
