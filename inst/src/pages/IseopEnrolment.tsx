import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, BarChart3, Banknote } from "lucide-react";

// The core management components for the ISEOP Department
import IseopStudentManager from "../components/innovation_dept/IseopStudentManager";
import IseopManager from "../components/innovation_dept/IseopManager"; // This file now uses IseopFormDialog internally
import PartnershipManager from "../components/innovation_dept/PartnershipManager";
import GrantManager from "../components/innovation_dept/GrantManager";

import { useIseopData } from "@/hooks/useIseop"; 
import { useAuth } from "@/context/AuthContext";

const InnovationDashboard = () => {
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;

  // Data fetching hook for students, programs (hubs), analysis, and grants
  const { students, programs, analysis, grants, loading, refresh } = useIseopData(institutionId);

  if (loading) return (
    <div className="flex items-center justify-center p-10">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      <span className="ml-3 text-muted-foreground">Loading ISEOP Statistics...</span>
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
            <Users className="h-4 w-4"/> STUDENTS' DETAILS
          </TabsTrigger>
          <TabsTrigger value="programs" className="gap-2">
            <GraduationCap className="h-4 w-4"/> PROGRAMS
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <BarChart3 className="h-4 w-4"/> ANALYSIS
          </TabsTrigger>
          <TabsTrigger value="grants" className="gap-2">
            <Banknote className="h-4 w-4"/> GRANTS
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Student List & Detailed Enrollment */}
        <TabsContent value="students" className="mt-6">
          <IseopStudentManager 
            students={students} 
            loading={loading} 
            onRefresh={refresh} 
          />
        </TabsContent>

        {/* Tab 2: Vocational Programs (Managed via IseopManager + IseopFormDialog) */}
        <TabsContent value="programs">
           <IseopManager 
             hubs={programs} 
             onRefresh={refresh} 
           />
        </TabsContent>

        {/* Tab 3: Partnership & Institutional Analysis */}
        <TabsContent value="analysis">
          <PartnershipManager partnerships={analysis} />
        </TabsContent>

        {/* Tab 4: Financial Grants & Funding */}
        <TabsContent value="grants">
          <GrantManager grants={grants} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InnovationDashboard;