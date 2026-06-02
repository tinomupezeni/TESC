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
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">ISEOP Enrollment</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Integrated Skills Empowerment Outreach Programme</p>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <div className="px-1">
          <TabsList className="bg-slate-100 p-1 w-full sm:w-auto overflow-x-auto justify-start no-scrollbar">
            <TabsTrigger value="students" className="gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> STUDENTS' DETAILS
            </TabsTrigger>
            <TabsTrigger value="programs" className="gap-2 text-xs sm:text-sm whitespace-nowrap">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> PROGRAMS
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="students" className="mt-4 sm:mt-6 px-1">
          <IseopStudentManager 
            students={students} 
            programs={programs.map(p => p.name)}
            loading={loading} 
            onRefresh={refresh} 
          />
        </TabsContent>

        <TabsContent value="programs" className="px-1">
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
