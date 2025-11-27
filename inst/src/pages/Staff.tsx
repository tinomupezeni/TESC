import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, MoreVertical, Filter, Mail, Phone, Users, TrendingDown, Briefcase, GraduationCap, Award } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddStaffDialog } from "@/components/AddStaffDialog";

const Staff = () => {
  const [staff, setStaff] = useState([])
  const [vacantPositions, setVacantPositions] = useState([])
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterFaculty, setFilterFaculty] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<typeof staff[0] | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const filteredStaff = staff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || staff.department === filterDepartment;
    const matchesFaculty = filterFaculty === "all" || staff.faculty === filterFaculty;
    return matchesSearch && matchesDepartment && matchesFaculty;
  });

  const totalStaff = staff.length;
  const professors = staff.filter(s => s.role === "Professor").length;
  const lecturers = staff.filter(s => s.role === "Senior Lecturer" || s.role === "Lecturer").length;
  const assistants = staff.filter(s => s.role === "Assistant Lecturer").length;
  
  const requiredProfessors = 8;
  const requiredLecturers = 25;
  const requiredAssistants = 10;

  const handleViewProfile = (staff: typeof staff[0]) => {
    setSelectedStaff(staff);
    setShowProfile(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground mt-1">Manage academic and non-academic staff</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Staff</CardDescription>
            <CardTitle className="text-3xl">{totalStaff}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Professors
            </CardDescription>
            <CardTitle className="text-3xl">
              {professors} / {requiredProfessors}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-destructive">
              <TrendingDown className="h-3 w-3" />
              <span>{requiredProfessors - professors} positions short</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Lecturers
            </CardDescription>
            <CardTitle className="text-3xl">
              {lecturers} / {requiredLecturers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-destructive">
              <TrendingDown className="h-3 w-3" />
              <span>{requiredLecturers - lecturers} positions short</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assistants
            </CardDescription>
            <CardTitle className="text-3xl">
              {assistants} / {requiredAssistants}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-destructive">
              <TrendingDown className="h-3 w-3" />
              <span>{requiredAssistants - assistants} positions short</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vacant Positions</CardTitle>
              <CardDescription>Open positions awaiting recruitment</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-warning">
              {vacantPositions.length} Open
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vacantPositions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{position.position}</p>
                    <p className="text-sm text-muted-foreground">{position.faculty} - {position.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{position.required} position(s)</p>
                    <p className="text-xs text-muted-foreground">Deadline: {position.deadline}</p>
                  </div>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>View and manage all staff members</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <AddStaffDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterFaculty} onValueChange={setFilterFaculty}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                <SelectItem value="Engineering & Technology">Engineering & Technology</SelectItem>
                <SelectItem value="Commerce">Commerce</SelectItem>
                <SelectItem value="Applied Sciences">Applied Sciences</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                <SelectItem value="Business Management">Business Management</SelectItem>
                <SelectItem value="Information Technology">Information Technology</SelectItem>
                <SelectItem value="Human Resources">Human Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No staff members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff) => (
                    <TableRow 
                      key={staff.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewProfile(staff)}
                    >
                      <TableCell className="font-medium">{staff.id}</TableCell>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.faculty}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{staff.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{staff.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={staff.status === "Active" ? "default" : "secondary"}
                          className={staff.status === "Active" ? "bg-success" : ""}
                        >
                          {staff.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewProfile(staff)}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Suspend Staff
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStaff.length} of {staff.length} staff members
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Staff Profile</DialogTitle>
            <DialogDescription>Detailed information and qualifications</DialogDescription>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedStaff.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                  <Badge 
                    variant={selectedStaff.status === "Active" ? "default" : "secondary"}
                    className={`mt-2 ${selectedStaff.status === "Active" ? "bg-success" : ""}`}
                  >
                    {selectedStaff.status}
                  </Badge>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{selectedStaff.id}</p>
                  <p className="text-muted-foreground">Joined: {selectedStaff.joinDate}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Department Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Faculty:</span>
                      <p className="font-medium">{selectedStaff.faculty}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <p className="font-medium">{selectedStaff.department}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Specialization:</span>
                      <p className="font-medium">{selectedStaff.specialization}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedStaff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedStaff.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Academic Qualifications
                </h4>
                <div className="space-y-3">
                  {selectedStaff.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Award className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm">{qual}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Experience</h4>
                <p className="text-sm text-muted-foreground">{selectedStaff.experience}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Edit Profile</Button>
                <Button variant="outline" className="flex-1">Download CV</Button>
                <Button variant="outline">Reset Password</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Staff;
