import { useEffect, useState, useCallback } from "react";
// 1. Import useAuth
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Users, Clock, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddProgramDialog } from "@/components/AddProgramDialog";
import { getPrograms, Program } from "@/services/programs.services";

const Programs = () => {
  // 2. Get User Context
  const { user } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 3. Update fetch logic to use Institution ID
  const fetchPrograms = useCallback(async () => {
    // Prevent fetching if user data isn't ready
    if (!user?.institution?.id) return;

    try {
      setLoading(true);
      // Pass the filter to the backend
      const data = await getPrograms({ 
        institution_id: user.institution.id 
      });
      setPrograms(data);
    } catch (error) {
      console.error("Failed to fetch programs", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const filteredPrograms = programs.filter((program) => {
    return (
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Programs & Courses
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage academic programs for <span className="font-semibold text-primary">{user?.institution?.name}</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Pass ID to Add Dialog if needed */}
        <AddProgramDialog 
            institutionId={user?.institution?.id} 
            onProgramAdded={fetchPrograms} 
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPrograms.length === 0 ? (
             <div className="col-span-2 text-center py-10 text-muted-foreground">
                No programs found.
             </div>
          ) : (
            filteredPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <Badge variant="outline">{program.code}</Badge>
                        <Badge variant="secondary">
                           {/* Level is a good thing to show here */}
                           {program.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {program.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Duration</span>
                      </div>
                      <p className="text-sm font-medium">{program.duration} Years</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Capacity</span>
                      </div>
                      {/* Note: using student_capacity from interface */}
                      <p className="text-sm font-medium">{program.student_capacity}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">Faculty</span>
                      </div>
                      {/* Truncate faculty name if too long */}
                      <p className="text-sm font-medium truncate w-24" title={program.faculty_name}>
                        {program.faculty_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{program.name}</DialogTitle>
                          <DialogDescription>
                            Program Details and Information
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              Program Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Code:</span>
                                <span className="font-medium">{program.code}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Level:</span>
                                <span className="font-medium">{program.level}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Coordinator:</span>
                                <span className="font-medium">{program.coordinator}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Modules:</span>
                                <span className="font-medium">{program.modules}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Entry Requirements:</span>
                                <span className="font-medium text-right max-w-[200px]">{program.entry_requirements}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit Program
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Programs;