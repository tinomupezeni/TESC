import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building, MapPin, Users, GraduationCap, Plus } from "lucide-react";
import { useState } from "react";

const institutions = [
  {
    id: 1,
    name: "Harare Polytechnic",
    type: "Polytechnic",
    location: "Harare Province",
    address: "Willowvale Road, Harare",
    students: 3250,
    capacity: 4000,
    staff: 145,
    programs: ["Electrical Engineering", "Civil Engineering", "Business Studies", "IT"],
    facilities: ["Library", "Workshops", "Hostels", "Sports Complex"],
    status: "Active",
    established: 1963,
  },
  {
    id: 2,
    name: "Mkoba Teachers College",
    type: "Teachers College", 
    location: "Midlands Province",
    address: "Mkoba, Gweru",
    students: 1850,
    capacity: 2200,
    staff: 89,
    programs: ["Primary Education", "Early Childhood Development", "Special Needs"],
    facilities: ["Library", "Teaching Practice Schools", "Hostels"],
    status: "Active",
    established: 1978,
  },
  {
    id: 3,
    name: "Bulawayo Industrial Training Centre",
    type: "Industrial Training",
    location: "Bulawayo Province", 
    address: "Kelvin Industrial Area",
    students: 980,
    capacity: 1200,
    staff: 67,
    programs: ["Automotive Mechanics", "Welding", "Electrical Installation", "Plumbing"],
    facilities: ["Workshops", "Equipment Labs", "Canteen"],
    status: "Active",
    established: 1985,
  },
  {
    id: 4,
    name: "Mutare Polytechnic",
    type: "Polytechnic",
    location: "Manicaland Province",
    address: "Dangamvura, Mutare", 
    students: 2100,
    capacity: 2800,
    staff: 112,
    programs: ["Agriculture", "Engineering", "Business", "Applied Sciences"],
    facilities: ["Library", "Labs", "Farm", "Hostels"],
    status: "Renovation",
    established: 1971,
  },
];

export default function Institutions() {

  const [registerInst, setRegisterInst] = useState(false);

  return (
    <>
    
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Educational Institutions</h1>
            <p className="text-muted-foreground">
              Manage Teachers Colleges, Polytechnics, and Industrial Training Centres
            </p>
          </div>
          <Button onClick={() => setRegisterInst(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register Institution
          </Button>
        </div>

        {/* Institution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {institutions.map((institution) => (
            <Card key={institution.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      {institution.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {institution.address}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline">{institution.type}</Badge>
                    <Badge 
                      variant={institution.status === "Active" ? "default" : "secondary"}
                    >
                      {institution.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      Students
                    </div>
                    <div className="font-bold text-lg">{institution.students.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <Building className="h-3 w-3" />
                      Staff
                    </div>
                    <div className="font-bold text-lg">{institution.staff}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                      <GraduationCap className="h-3 w-3" />
                      Programs
                    </div>
                    <div className="font-bold text-lg">{institution.programs.length}</div>
                  </div>
                </div>

                {/* Capacity Utilization */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Capacity Utilization</span>
                    <span>{Math.round((institution.students / institution.capacity) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(institution.students / institution.capacity) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {institution.students.toLocaleString()} / {institution.capacity.toLocaleString()} students
                  </div>
                </div>

                {/* Programs */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Key Programs</h4>
                  <div className="flex flex-wrap gap-1">
                    {institution.programs.slice(0, 3).map((program, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {program}
                      </Badge>
                    ))}
                    {institution.programs.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{institution.programs.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-1">
                    {institution.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>

                {/* Footer Info */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Established: {institution.established} | {institution.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
    {registerInst && 
    <RegisterInst />
    }
    </>
  );
}