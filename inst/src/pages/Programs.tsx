import { useEffect, useState } from "react";
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
import { Search, BookOpen, Users, Clock, FileText } from "lucide-react";
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

// const mockPrograms = [
//   {
//     id: "PRG001",
//     name: "National Diploma in Computer Science",
//     code: "NDCS",
//     duration: "3 years",
//     level: "Diploma",
//     students: 342,
//     modules: 24,
//     status: "Active",
//     description: "Comprehensive program covering software development, databases, and networking."
//   },
//   {
//     id: "PRG002",
//     name: "Higher National Diploma in Engineering",
//     code: "HNDE",
//     duration: "2 years",
//     level: "Higher Diploma",
//     students: 198,
//     modules: 18,
//     status: "Active",
//     description: "Advanced engineering principles with practical applications."
//   },
//   {
//     id: "PRG003",
//     name: "National Certificate in Business Studies",
//     code: "NCBS",
//     duration: "1 year",
//     level: "Certificate",
//     students: 156,
//     modules: 12,
//     status: "Active",
//     description: "Foundation business skills and entrepreneurship."
//   },
//   {
//     id: "PRG004",
//     name: "National Diploma in Information Technology",
//     code: "NDIT",
//     duration: "3 years",
//     level: "Diploma",
//     students: 289,
//     modules: 22,
//     status: "Active",
//     description: "IT infrastructure, cybersecurity, and system administration."
//   },
//   {
//     id: "PRG005",
//     name: "Certificate in Accounting",
//     code: "CAC",
//     duration: "1 year",
//     level: "Certificate",
//     students: 87,
//     modules: 10,
//     status: "Suspended",
//     description: "Basic accounting principles and financial management."
//   },
// ];

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 2. Create an async function inside useEffect
    const fetchPrograms = async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
      } catch (error) {
        console.error("Failed to fetch programs", error);
      }
    };

    // 3. Call the async function
    fetchPrograms();
  }, []);

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
          Manage academic programs and course modules
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
        <AddProgramDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <Badge variant="outline">{program.code}</Badge>
                    <Badge
                      variant={
                        program.status === "Active" ? "default" : "secondary"
                      }
                      className={
                        program.status === "Active" ? "bg-success" : ""
                      }
                    >
                      {program.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <CardDescription className="mt-2">
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
                  <p className="text-sm font-medium">{program.duration}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Students</span>
                  </div>
                  <p className="text-sm font-medium">{program.students}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">Modules</span>
                  </div>
                  <p className="text-sm font-medium">{program.modules}</p>
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
                        Program Details and Modules
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
                            <span className="text-muted-foreground">
                              Level:
                            </span>
                            <span className="font-medium">{program.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Duration:
                            </span>
                            <span className="font-medium">
                              {program.duration}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Enrolled Students:
                            </span>
                            <span className="font-medium">
                              {program.students}
                            </span>
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
        ))}
      </div>
    </div>
  );
};

export default Programs;
