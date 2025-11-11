import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import axiosInstance from "@/utils/axiosInstance";

export default function SettingsPage() {
  const navigate = useNavigate();

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [newDept, setNewDept] = useState({ name: "", description: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "", department: "", level: "" });

  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);

  const roleLevelMap: Record<string, string[]> = {
    Admin: ["1", "2", "3", "4"],
    Director: ["2", "3", "4"],
    Staff: ["4"],
  };

  // -------------------- Fetch Data --------------------
  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get("/settings/roles/");
      setRoles(res.data);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/settings/departments/");
      setDepartments(res.data);
    } catch (err: any) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/settings/users/");
      setUsers(res.data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    }
  };

  // -------------------- CRUD Handlers --------------------
  // Roles
  const addOrEditRole = async () => {
    if (!newRole.name || !newRole.description) return alert("Fill all fields!");
    try {
      if (editingItem) await axiosInstance.put(`/settings/roles/${editingItem.id}/`, newRole);
      else await axiosInstance.post("/settings/roles/", newRole);
      fetchRoles();
      setNewRole({ name: "", description: "" });
      setEditingItem(null);
      setOpenRoleModal(false);
    } catch (err: any) {
      console.error("Error saving role:", err);
      alert("Failed to save role. Please ensure you are logged in.");
    }
  };

  const editRole = (role: any) => {
    setEditingItem(role);
    setNewRole({ name: role.name, description: role.description });
    setOpenRoleModal(true);
  };

  const deleteRole = async (id: number) => {
    try {
      await axiosInstance.delete(`/settings/roles/${id}/`);
      fetchRoles();
    } catch (err: any) {
      console.error("Error deleting role:", err);
      alert("Failed to delete role.");
    }
  };

  // Departments
  const addOrEditDepartment = async () => {
    if (!newDept.name || !newDept.description) return alert("Fill all fields!");
    try {
      if (editingItem) await axiosInstance.put(`/settings/departments/${editingItem.id}/`, newDept);
      else await axiosInstance.post("/settings/departments/", newDept);
      fetchDepartments();
      setNewDept({ name: "", description: "" });
      setEditingItem(null);
      setOpenDeptModal(false);
    } catch (err: any) {
      console.error("Error saving department:", err);
      alert("Failed to save department.");
    }
  };

  const editDepartment = (dep: any) => {
    setEditingItem(dep);
    setNewDept({ name: dep.name, description: dep.description });
    setOpenDeptModal(true);
  };

  const deleteDepartment = async (id: number) => {
    try {
      await axiosInstance.delete(`/settings/departments/${id}/`);
      fetchDepartments();
    } catch (err: any) {
      console.error("Error deleting department:", err);
      alert("Failed to delete department.");
    }
  };

  // Users
  const addOrEditUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.department || !newUser.level)
      return alert("Fill all fields!");
    try {
      const payload = {
        username: newUser.name,
        email: newUser.email,
        role_id: roles.find(r => r.name === newUser.role)?.id,
        department_id: departments.find(d => d.name === newUser.department)?.id,
        level: newUser.level,
      };
      if (editingItem) await axiosInstance.put(`/settings/users/${editingItem.id}/`, payload);
      else await axiosInstance.post("/settings/users/", payload);
      fetchUsers();
      setNewUser({ name: "", email: "", role: "", department: "", level: "" });
      setEditingItem(null);
      setOpenUserModal(false);
    } catch (err: any) {
      console.error("Error saving user:", err);
      alert("Failed to save user.");
    }
  };

  const editUser = (user: any) => {
    setEditingItem(user);
    setNewUser({
      name: user.username,
      email: user.email,
      role: user.role?.name,
      department: user.department?.name,
      level: user.level,
    });
    setOpenUserModal(true);
  };

  const deleteUser = async (id: number) => {
    try {
      await axiosInstance.delete(`/settings/users/${id}/`);
      fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  const availableLevels = newUser.role ? roleLevelMap[newUser.role] || [] : [];

  // -------------------- JSX --------------------
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-7 w-7" /> System Settings
        </h1>

        {/* Roles */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Roles</CardTitle>
            <Button onClick={() => { setEditingItem(null); setNewRole({ name: "", description: "" }); setOpenRoleModal(true); }}>Add Role</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editRole(role)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteRole(role.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Departments</CardTitle>
            <Button onClick={() => { setEditingItem(null); setNewDept({ name: "", description: "" }); setOpenDeptModal(true); }}>Add Department</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(dep => (
                  <TableRow key={dep.id}>
                    <TableCell>{dep.name}</TableCell>
                    <TableCell>{dep.description}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editDepartment(dep)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteDepartment(dep.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Users</CardTitle>
            <Button onClick={() => { setEditingItem(null); setNewUser({ name: "", email: "", role: "", department: "", level: "" }); setOpenUserModal(true); }}>Add User</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role?.name}</TableCell>
                    <TableCell>{user.department?.name}</TableCell>
                    <TableCell>{user.level}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editUser(user)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modals */}
        <RoleModal open={openRoleModal} onClose={() => setOpenRoleModal(false)} role={newRole} setRole={setNewRole} onSave={addOrEditRole} editing={!!editingItem} />
        <DepartmentModal open={openDeptModal} onClose={() => setOpenDeptModal(false)} dept={newDept} setDept={setNewDept} onSave={addOrEditDepartment} editing={!!editingItem} />
        <UserModal open={openUserModal} onClose={() => setOpenUserModal(false)} user={newUser} setUser={setNewUser} onSave={addOrEditUser} roles={roles} departments={departments} availableLevels={availableLevels} editing={!!editingItem} />
      </div>
    </DashboardLayout>
  );
}

// ---------- Reusable Modal Components ----------
function RoleModal({ open, onClose, role, setRole, onSave, editing }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle></DialogHeader>
        <Input placeholder="Name" value={role.name} onChange={e => setRole({ ...role, name: e.target.value })} className="mb-2" />
        <Input placeholder="Description" value={role.description} onChange={e => setRole({ ...role, description: e.target.value })} />
        <DialogFooter className="mt-4"><Button onClick={onSave}>{editing ? "Update" : "Save"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentModal({ open, onClose, dept, setDept, onSave, editing }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle></DialogHeader>
        <Input placeholder="Name" value={dept.name} onChange={e => setDept({ ...dept, name: e.target.value })} className="mb-2" />
        <Input placeholder="Description" value={dept.description} onChange={e => setDept({ ...dept, description: e.target.value })} />
        <DialogFooter className="mt-4"><Button onClick={onSave}>{editing ? "Update" : "Save"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserModal({ open, onClose, user, setUser, onSave, roles, departments, availableLevels, editing }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-2">
          <Input placeholder="Name" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} />
          <Input placeholder="Email" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} />
          <Select value={user.role} onValueChange={val => setUser({ ...user, role: val, level: "" })}>
            <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
            <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={user.department} onValueChange={val => setUser({ ...user, department: val })}>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={user.level} onValueChange={val => setUser({ ...user, level: val })}>
            <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
            <SelectContent>
              {availableLevels.map(l => (
                <SelectItem key={l} value={l}>
                  {l === "1" ? "Level 1 - Full Access" :
                   l === "2" ? "Level 2 - No Editing" :
                   l === "3" ? "Level 3 - Department Access" :
                   "Level 4 - Staff Only"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="mt-4"><Button onClick={onSave}>{editing ? "Update" : "Save"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}