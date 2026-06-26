import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Edit, Activity, Trash2, Loader2 } from "lucide-react";
import { HubFormDialog } from "./HubFormDialog";
import { deleteHub } from "@/services/innovation.services";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HubManagerProps {
  hubs: any[];
  onRefresh?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "High": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Medium": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Full": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-secondary";
  }
};

const HubManager = ({ hubs = [], onRefresh }: HubManagerProps) => {
  const [hubToDelete, setHubToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!hubToDelete) return;
    setIsDeleting(true);
    try {
      await deleteHub(hubToDelete.id);
      toast.success("Hub deleted successfully");
      setHubToDelete(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to delete hub");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background p-1 rounded-lg">
         <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage capacity and activity levels.</p>
         </div>
         <div className="w-full sm:w-auto">
           <HubFormDialog onSuccess={onRefresh} />
         </div>
      </div>
      
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {hubs.map((hub) => {
          const usage = hub.capacity > 0 ? (hub.occupied / hub.capacity) * 100 : 0;
          
          return (
            <Card key={hub.id} className="group hover:shadow-lg transition-all border-l-4 mx-1 border-none sm:border" style={{ borderLeftWidth: '4px', borderLeftColor: usage >= 100 ? '#ef4444' : '#3b82f6' }}>
              <CardHeader className="p-4 sm:p-6 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                     <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                     </div>
                     <div className="min-w-0">
                        <CardTitle className="text-sm sm:text-base font-bold truncate uppercase" title={hub.name}>{hub.name}</CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">Capacity: {hub.capacity} Units</CardDescription>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Edit Button */}
                    <HubFormDialog 
                      hub={hub} 
                      onSuccess={onRefresh}
                      trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground">
                              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                      }
                    />
                    {/* Delete Button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setHubToDelete(hub)}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-4 flex-1">
                <div className="space-y-4">
                  
                  {/* Status Badge */}
                  <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                    <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                        <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Activity</span>
                    </span>
                    <Badge variant="outline" className={`text-[10px] sm:text-xs px-1.5 py-0.5 whitespace-nowrap uppercase ${getStatusColor(hub.status)}`}>
                        {hub.status} Activity
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] sm:text-xs font-medium gap-2 uppercase">
                      <span className="truncate">Occupancy</span>
                      <span className={`shrink-0 ${usage > 90 ? "text-red-600 font-bold" : "text-muted-foreground"}`}>
                        {hub.occupied} / {hub.capacity} ({Math.round(usage)}%)
                      </span>
                    </div>
                    <Progress value={usage} className={`h-1.5 sm:h-2 ${usage > 90 ? "bg-red-100" : "bg-secondary"}`} />
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        })}

        {hubs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                <Building2 className="h-10 w-10 mb-2 opacity-20" />
                <p className="uppercase">No Innovation Hubs found.</p>
            </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!hubToDelete} onOpenChange={(open) => !open && setHubToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="uppercase">
              This action cannot be undone. This will permanently delete the innovation hub{" "}
              <span className="font-semibold text-foreground">{hubToDelete?.name?.toUpperCase()}</span> and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setHubToDelete(null)} disabled={isDeleting} className="uppercase">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="uppercase">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Hub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HubManager;