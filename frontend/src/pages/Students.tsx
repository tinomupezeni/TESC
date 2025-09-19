import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, UserPlus, Download, Filter } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

const studentData = [
  {
    id: "ST001",
    name: "Tendai Mukamuri",
    institution: "Harare Polytechnic",
    program: "Electrical Engineering - HND",
    level: "HND",
    gender: "Male",
    status: "Active",
    year: 2024,
  },
  {
    id: "ST002", 
    name: "Grace Chigumba",
    institution: "Mkoba Teachers College",
    program: "Primary Education",
    level: "2.1",
    gender: "Female", 
    status: "Attachment",
    year: 2024,
  },
  {
    id: "ST003",
    name: "Blessing Moyo",
    institution: "Bulawayo Industrial Training",
    program: "Automotive Mechanics",
    level: "Year 1",
    gender: "Male",
    status: "Active",
    year: 2024,
  },
  {
    id: "ST004",
    name: "Patience Sibanda",
    institution: "Mutare Polytechnic", 
    program: "Business Studies - ND",
    level: "ND",
    gender: "Female",
    status: "Active",
    year: 2024,
  },
];

export default function Students() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Student Records</h1>
            <p className="text-muted-foreground">
              Manage and track student information across all institutions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Student Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Active Students"
            value={59500}
            description="Currently enrolled"
            icon={Users}
            variant="accent"
          />
          <StatsCard
            title="Female Students"
            value={28750}
            description="48.3% of total enrollment"
            icon={UserCheck}
            variant="success"
          />
          <StatsCard
            title="Students with Disabilities"
            value={1247}
            description="2.1% receiving support"
            icon={Users}
            variant="warning"
          />
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search and Filter Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input placeholder="Search by name or ID..." />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Institution Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  <SelectItem value="teachers">Teachers Colleges</SelectItem>
                  <SelectItem value="polytechnic">Polytechnics</SelectItem>
                  <SelectItem value="industrial">Industrial Training</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Program Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="nc">NC</SelectItem>
                  <SelectItem value="nd">ND</SelectItem>
                  <SelectItem value="hnd">HND</SelectItem>
                  <SelectItem value="1.1">Level 1.1</SelectItem>
                  <SelectItem value="2.1">Level 2.1</SelectItem>
                  <SelectItem value="3.1">Level 3.1</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="attachment">Attachment</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Student Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.institution}</TableCell>
                    <TableCell>{student.program}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.level}</Badge>
                    </TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          student.status === "Active" 
                            ? "default" 
                            : student.status === "Attachment"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}