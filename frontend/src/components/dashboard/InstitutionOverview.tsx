import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, GraduationCap, Building } from "lucide-react";

const institutionData = [
  {
    name: "Harare Polytechnic",
    type: "Polytechnic",
    location: "Harare",
    students: 3250,
    capacity: 4000,
    programs: 12,
    status: "Active",
  },
  {
    name: "Mkoba Teachers College",
    type: "Teachers College",
    location: "Gweru",
    students: 1850,
    capacity: 2200,
    programs: 8,
    status: "Active",
  },
  {
    name: "Bulawayo Industrial Training",
    type: "Industrial Training",
    location: "Bulawayo",
    students: 980,
    capacity: 1200,
    programs: 15,
    status: "Active",
  },
  {
    name: "Mutare Polytechnic",
    type: "Polytechnic",
    location: "Mutare",
    students: 2100,
    capacity: 2800,
    programs: 10,
    status: "Renovation",
  },
];

export function InstitutionOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Institution Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {institutionData.map((institution, index) => (
            <div key={index} className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{institution.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {institution.location}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{institution.type}</Badge>
                  <Badge 
                    variant={institution.status === "Active" ? "default" : "secondary"}
                  >
                    {institution.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    Students
                  </div>
                  <div className="font-semibold">{institution.students.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Building className="h-3 w-3" />
                    Capacity
                  </div>
                  <div className="font-semibold">{institution.capacity.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <GraduationCap className="h-3 w-3" />
                    Programs
                  </div>
                  <div className="font-semibold">{institution.programs}</div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Utilization</span>
                  <span>{Math.round((institution.students / institution.capacity) * 100)}%</span>
                </div>
                <Progress 
                  value={(institution.students / institution.capacity) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}