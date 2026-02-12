import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  UserCheck,
  CreditCard,
  Loader2,
  Inbox,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Building,
  BarChart3,
  UserMinus,
  RefreshCw,
  Filter,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useState, useEffect, useCallback } from "react";
import { IseopService } from "@/services/innovation.services";
import type { IseopProgram, IseopStudent, IseopStats, IseopProgramWriteData, IseopWorkArea } from "@/lib/types/academic.types";
import { toast } from "sonner";

const WORK_AREAS: IseopWorkArea[] = ['Library', 'Grounds', 'Labs', 'Admin', 'Cafeteria', 'Maintenance'];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function SpecialEnrollment() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<IseopStats | null>(null);
  const [programs, setPrograms] = useState<IseopProgram[]>([]);
  const [students, setStudents] = useState<IseopStudent[]>([]);

  // Filter states
  const [studentSearch, setStudentSearch] = useState("");
  const [workAreaFilter, setWorkAreaFilter] = useState<string>("all");

  // Dialog states
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<IseopProgram | null>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IseopStudent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: 'program' | 'student'; item: any } | null>(null);
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [unenrollingStudent, setUnenrollingStudent] = useState<IseopStudent | null>(null);

  // Form states
  const [programForm, setProgramForm] = useState<Partial<IseopProgramWriteData>>({
    name: '',
    capacity: 0,
    occupied: 0,
    status: 'Active',
    activity_level: 'Medium',
    description: '',
  });
  const [studentForm, setStudentForm] = useState({
    work_area: '' as IseopWorkArea | '',
    hours_pledged: 0,
    is_work_for_fees: false,
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, programsData, studentsData] = await Promise.all([
        IseopService.getStats(),
        IseopService.getPrograms(),
        IseopService.getStudents({
          search: studentSearch || undefined,
          work_area: workAreaFilter !== 'all' ? workAreaFilter : undefined,
        }),
      ]);
      setStats(statsData);
      setPrograms(programsData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Failed to fetch ISEOP data:", error);
      toast.error("Failed to load ISEOP data");
    } finally {
      setLoading(false);
    }
  }, [studentSearch, workAreaFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Program handlers
  const handleProgramSubmit = async () => {
    if (!programForm.name) {
      toast.error("Program name is required");
      return;
    }
    setSubmitting(true);
    try {
      if (editingProgram) {
        await IseopService.updateProgram(editingProgram.id, programForm);
        toast.success("Program updated successfully");
      } else {
        await IseopService.createProgram(programForm);
        toast.success("Program created successfully");
      }
      setProgramDialogOpen(false);
      setEditingProgram(null);
      resetProgramForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to save program");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProgram = (program: IseopProgram) => {
    setEditingProgram(program);
    setProgramForm({
      name: program.name,
      capacity: program.capacity,
      occupied: program.occupied,
      status: program.status,
      activity_level: program.activity_level,
      description: program.description || '',
    });
    setProgramDialogOpen(true);
  };

  const handleDeleteProgram = async () => {
    if (!deletingItem || deletingItem.type !== 'program') return;
    setSubmitting(true);
    try {
      await IseopService.deleteProgram(deletingItem.item.id);
      toast.success("Program deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete program");
    } finally {
      setSubmitting(false);
    }
  };

  const resetProgramForm = () => {
    setProgramForm({
      name: '',
      capacity: 0,
      occupied: 0,
      status: 'Active',
      activity_level: 'Medium',
      description: '',
    });
  };

  // Student handlers
  const handleEditStudent = (student: IseopStudent) => {
    setEditingStudent(student);
    setStudentForm({
      work_area: student.work_area || '',
      hours_pledged: student.hours_pledged,
      is_work_for_fees: student.is_work_for_fees,
    });
    setStudentDialogOpen(true);
  };

  const handleStudentSubmit = async () => {
    if (!editingStudent) return;
    setSubmitting(true);
    try {
      await IseopService.updateStudent(editingStudent.id, {
        work_area: studentForm.work_area || null,
        hours_pledged: studentForm.hours_pledged,
        is_work_for_fees: studentForm.is_work_for_fees,
      });
      toast.success("Student updated successfully");
      setStudentDialogOpen(false);
      setEditingStudent(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnenroll = async () => {
    if (!unenrollingStudent) return;
    setSubmitting(true);
    try {
      await IseopService.unenrollStudent(unenrollingStudent.id);
      toast.success("Student unenrolled successfully");
      setUnenrollDialogOpen(false);
      setUnenrollingStudent(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to unenroll student");
    } finally {
      setSubmitting(false);
    }
  };

  // Chart data
  const workAreaChartData = stats?.work_areas.map((item, index) => ({
    name: item.work_area,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  })) || [];

  const genderChartData = stats?.gender_breakdown.map((item, index) => ({
    name: item.gender,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  })) || [];

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-7 w-7 text-primary" />
              ISEOP Management
            </h1>
            <p className="text-muted-foreground">
              Integrated Skills Empowerment Outreach Programme - Manage programs and students
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Programs"
            value={stats?.programs.total || 0}
            icon={Building}
            variant="accent"
          />
          <StatsCard
            title="Total ISEOP Students"
            value={stats?.students.total || 0}
            icon={Users}
            variant="info"
          />
          <StatsCard
            title="Work-for-Fees"
            value={stats?.students.work_for_fees || 0}
            icon={CreditCard}
            variant="success"
          />
          <StatsCard
            title="Program Utilization"
            value={`${stats?.programs.utilization || 0}%`}
            icon={BarChart3}
            variant="warning"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Work Area Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Area Distribution</CardTitle>
                  <CardDescription>Students by work area assignment</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {workAreaChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workAreaChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                      <Inbox className="mb-2 h-8 w-8" />
                      <p>No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gender Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Gender Breakdown</CardTitle>
                  <CardDescription>ISEOP students by gender</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {genderChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {genderChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                      <Inbox className="mb-2 h-8 w-8" />
                      <p>No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Program Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Program Capacity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Programs</TableCell>
                      <TableCell className="text-right">{stats?.programs.total || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Active Programs</TableCell>
                      <TableCell className="text-right">{stats?.programs.active || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Capacity</TableCell>
                      <TableCell className="text-right">{stats?.programs.capacity || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Currently Occupied</TableCell>
                      <TableCell className="text-right">{stats?.programs.occupied || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Utilization Rate</TableCell>
                      <TableCell className="text-right">{stats?.programs.utilization || 0}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>ISEOP Programs</CardTitle>
                  <CardDescription>Manage institutional programs</CardDescription>
                </div>
                <Button onClick={() => {
                  resetProgramForm();
                  setEditingProgram(null);
                  setProgramDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead className="text-center">Capacity</TableHead>
                      <TableHead className="text-center">Occupied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No programs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      programs.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell className="font-medium">{program.name}</TableCell>
                          <TableCell>{program.institution_name}</TableCell>
                          <TableCell className="text-center">{program.capacity}</TableCell>
                          <TableCell className="text-center">{program.occupied}</TableCell>
                          <TableCell>
                            <Badge variant={program.status === 'Active' ? 'default' : 'secondary'}>
                              {program.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              program.activity_level === 'High' ? 'default' :
                              program.activity_level === 'Medium' ? 'secondary' : 'outline'
                            }>
                              {program.activity_level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditProgram(program)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  setDeletingItem({ type: 'program', item: program });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>ISEOP Students</CardTitle>
                    <CardDescription>Students enrolled in ISEOP or Work-for-Fees program</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        className="pl-8 w-[200px]"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                    <Select value={workAreaFilter} onValueChange={setWorkAreaFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Work Area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        {WORK_AREAS.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Work Area</TableHead>
                      <TableHead className="text-center">Hours</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.student_id}</TableCell>
                          <TableCell>{student.full_name}</TableCell>
                          <TableCell>{student.institution_name}</TableCell>
                          <TableCell>{student.program_name}</TableCell>
                          <TableCell>{student.work_area || '-'}</TableCell>
                          <TableCell className="text-center">{student.hours_pledged}</TableCell>
                          <TableCell>
                            {student.is_work_for_fees ? (
                              <Badge variant="default">Work-for-Fees</Badge>
                            ) : (
                              <Badge variant="secondary">ISEOP</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-500 hover:text-orange-700"
                                onClick={() => {
                                  setUnenrollingStudent(student);
                                  setUnenrollDialogOpen(true);
                                }}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Program Dialog */}
      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Add New Program'}</DialogTitle>
            <DialogDescription>
              {editingProgram ? 'Update program details' : 'Create a new ISEOP program'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={programForm.name}
                onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                placeholder="Enter program name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={programForm.capacity}
                  onChange={(e) => setProgramForm({ ...programForm, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="occupied">Occupied</Label>
                <Input
                  id="occupied"
                  type="number"
                  value={programForm.occupied}
                  onChange={(e) => setProgramForm({ ...programForm, occupied: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={programForm.status}
                  onValueChange={(value: any) => setProgramForm({ ...programForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="activity_level">Activity Level</Label>
                <Select
                  value={programForm.activity_level}
                  onValueChange={(value: any) => setProgramForm({ ...programForm, activity_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={programForm.description}
                onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                placeholder="Enter program description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgramDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleProgramSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProgram ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Edit Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Student ISEOP Details</DialogTitle>
            <DialogDescription>
              Update work assignment for {editingStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="work_area">Work Area</Label>
              <Select
                value={studentForm.work_area}
                onValueChange={(value: any) => setStudentForm({ ...studentForm, work_area: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {WORK_AREAS.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours_pledged">Hours Pledged</Label>
              <Input
                id="hours_pledged"
                type="number"
                value={studentForm.hours_pledged}
                onChange={(e) => setStudentForm({ ...studentForm, hours_pledged: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_work_for_fees"
                checked={studentForm.is_work_for_fees}
                onChange={(e) => setStudentForm({ ...studentForm, is_work_for_fees: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_work_for_fees">Work for Fees Program</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStudentSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deletingItem?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProgram} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unenroll Confirmation Dialog */}
      <Dialog open={unenrollDialogOpen} onOpenChange={setUnenrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Unenrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll {unenrollingStudent?.full_name} from the ISEOP program?
              This will remove their work-for-fees status and work area assignment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnenrollDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleUnenroll} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Unenroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
