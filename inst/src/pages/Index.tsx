import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Database, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-4 px-2">
            TESC Institution Portal
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 px-4">
            Comprehensive management system for educational institutions in Zimbabwe
          </p>
          <Button size="lg" className="h-11 sm:h-12 px-8 text-base" onClick={() => navigate("/login")}>
            Access Portal
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure Access</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Ministry-approved authentication with robust role-based access control
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <Database className="h-8 w-8 sm:h-10 sm:w-10 text-secondary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Data Management</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Centralized student, staff, and academic records management system
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Seamless integration with Ministry systems and automated reporting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
