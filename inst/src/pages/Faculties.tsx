import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  MapPin,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Ensure this path matches your file structure
import { AddFacultyDialog } from "@/components/AddFacultyDialog";
import { getFaculties, Faculty } from "@/services/faculties.services";

const Faculties = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Define the fetch function so we can use it on load AND refresh it later
  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const data = await getFaculties();
      
      // Safety check to ensure we received an array
      if (Array.isArray(data)) {
        setFaculties(data);
      } else {
        console.error("Received invalid data format:", data);
        setFaculties([]);
      }
    } catch (error) {
      console.error("Failed to fetch faculties:", error);
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const filteredFaculties = faculties.filter((faculty) => {
    const query = searchQuery.toLowerCase();
    return (
      faculty.name.toLowerCase().includes(query) ||
      (faculty.dean && faculty.dean.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Faculties</h1>
        <p className="text-muted-foreground mt-1">
          Manage faculty departments, deans, and resource allocations
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculties or deans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Pass the refresh function to the dialog */}
        <AddFacultyDialog onSuccess={fetchFaculties} />
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading faculties...
        </div>
      )}

      {!loading && filteredFaculties.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
           <Building2 className="mx-auto h-12 w-12 opacity-20 mb-3"/>
           <p>No faculties found.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {filteredFaculties.map((faculty) => (
          <Card
            key={faculty.id}
            className="hover:shadow-md transition-shadow group"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className="text-xs">
                      {faculty.id}
                    </Badge>
                    <Badge
                      variant={
                        faculty.status === "Active" ? "default" : "secondary"
                      }
                      className={
                        faculty.status === "Active"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-amber-500 hover:bg-amber-600"
                      }
                    >
                      {faculty.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{faculty.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {faculty.location || "No location assigned"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-1 p-2 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">
                      Depts
                    </span>
                  </div>
                  {/* Using departments_count from your serializer */}
                  <p className="text-lg font-bold">{faculty.departments_count || 0}</p>
                </div>
                <div className="space-y-1 p-2 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">
                      Staff
                    </span>
                  </div>
                  {/* Placeholder until Staff is connected in backend */}
                  <p className="text-lg font-bold text-muted-foreground">-</p>
                </div>
                <div className="space-y-1 p-2 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-3 w-3" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">
                      Students
                    </span>
                  </div>
                   {/* Placeholder until Students are connected in backend */}
                  <p className="text-lg font-bold text-muted-foreground">-</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {faculty.description || "No description provided."}
                </p>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <DialogTitle>{faculty.name}</DialogTitle>
                          <DialogDescription>
                            {faculty.id} • {faculty.status}
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Description */}
                      <div className="bg-muted/50 p-4 rounded-md text-sm">
                        {faculty.description || "No description provided."}
                      </div>

                      {/* Leadership Info */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" /> Administration
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-xs">
                              Dean of Faculty
                            </span>
                            <p className="font-medium">{faculty.dean || "N/A"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-xs">
                              Main Office
                            </span>
                            <p className="font-medium">{faculty.location || "N/A"}</p>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <span className="text-muted-foreground text-xs">
                              Contact Email
                            </span>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="font-medium text-primary">
                                {faculty.email || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Breakdown (Detail View) */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Briefcase className="h-4 w-4" /> Capacity & Metrics
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="border rounded-md p-3 text-center">
                            <div className="text-2xl font-bold">
                              {faculty.departments_count || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Departments
                            </div>
                          </div>
                          {/* Placeholders for Future Data */}
                          <div className="border rounded-md p-3 text-center opacity-50">
                            <div className="text-2xl font-bold">-</div>
                            <div className="text-xs text-muted-foreground">
                              Academic Staff
                            </div>
                          </div>
                          <div className="border rounded-md p-3 text-center opacity-50">
                            <div className="text-2xl font-bold">-</div>
                            <div className="text-xs text-muted-foreground">
                              Enrolled
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="secondary" size="sm" className="flex-1">
                  Manage Departments
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Faculties;