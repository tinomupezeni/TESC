import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap } from "lucide-react";

import IseopStudentManager from "@/components/innovation_dept/IseopStudentManager";
import IseopManager from "@/components/innovation_dept/IseopManager";

import { useIseopData } from "@/hooks/useIseop";
import { useAuth } from "@/context/AuthContext";

const InnovationDashboard = () => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;
  const { students, programs, loading, refresh } = useIseopData(institutionId);

  if (loading) return (
    <div className="flex items-center justify-center p-10">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      <span className="ml-3 text-muted-foreground">Loading ISEOP Data...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">ISEOP Enrollment Statistics</h1>
        <p className="text-muted-foreground">Integrated Skills Empowerment Outreach Programme</p>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" /> STUDENTS' DETAILS
          </TabsTrigger>
          <TabsTrigger value="programs" className="gap-2">
            <GraduationCap className="h-4 w-4" /> PROGRAMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <IseopStudentManager 
            students={students} 
            programs={programs.map(p => p.name)}
            loading={loading} 
            onRefresh={refresh} 
          />
        </TabsContent>

        <TabsContent value="programs">
          <IseopManager 
            programs={programs} 
            onRefresh={refresh} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InnovationDashboard;
