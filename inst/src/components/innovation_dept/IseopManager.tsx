import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Edit, Activity, Users } from "lucide-react";

// UPDATED IMPORT: Swapped ProgramFormDialog for IseopFormDialog
import { IseopFormDialog } from "./IseopFormDialog"; 

interface ProgramManagerProps {
  hubs: any[]; 
  onRefresh?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "full": return "bg-orange-100 text-orange-800 border-orange-200";
    case "closed": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-secondary";
  }
};

const IseopManager = ({ hubs = [], onRefresh }: ProgramManagerProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-background p-1 rounded-lg">
         <div>
            <h2 className="text-lg font-semibold text-slate-900">Training Programs</h2>
            <p className="text-sm text-muted-foreground">Manage vocational courses and student enrollment quotas.</p>
         </div>
         
         {/* UPDATED: Component name changed to IseopFormDialog */}
         <IseopFormDialog onSuccess={onRefresh} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hubs.map((program) => {
          const enrollmentRate = program.capacity > 0 ? (program.occupied / program.capacity) * 100 : 0;
          
          return (
            <Card key={program.id} className="group hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: '#002e5b' }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-[#002e5b]/10 rounded-lg text-[#002e5b]">
                        <GraduationCap className="h-5 w-5" />
                     </div>
                     <div>
                        <CardTitle className="text-base font-bold">{program.name}</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500 uppercase">
                          {program.duration || '6 Months'}
                        </CardDescription>
                     </div>
                  </div>
                  
                  {/* UPDATED: Component name changed to IseopFormDialog */}
                  <IseopFormDialog 
                    hub={program} 
                    onSuccess={onRefresh}
                    trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#002e5b]">
                            <Edit className="h-4 w-4" />
                        </Button>
                    }
                  />
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5" /> Admission Status
                    </span>
                    <Badge variant="outline" className={`${getStatusColor(program.status)} capitalize`}>
                        {program.status || 'Active'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Users className="h-3 w-3" /> Enrolled Students
                      </span>
                      <span>
                        {program.occupied} / {program.capacity}
                      </span>
                    </div>
                    <Progress value={enrollmentRate} className="h-2 bg-slate-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default IseopManager;