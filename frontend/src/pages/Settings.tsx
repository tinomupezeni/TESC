import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// FIX 1: Changed alias import to relative path
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// FIX 2: Changed alias import to relative path
import {
  fetchRoles,
  fetchDepartments,
  fetchUsers,
  addRole,
  editRole,
  deleteRole,
  addDepartment,
  editDepartment,
  deleteDepartment,
  addUser,
  editUser,
  deleteUser,
} from "../services/settings.services"; // Assuming services folder is a sibling of the current page folder
import UserModal from "@/modules/settings/UserModal";
import { toast } from "sonner";
import Users from "@/modules/settings/Users";
export default function SettingsPage() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [newDept, setNewDept] = useState({ name: "", description: "" });
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
  });

  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);

  // Role -> Level mapping for user creation validation
  const roleLevelMap = {
    Admin: ["1", "2", "3", "4"],
    Director: ["2", "3", "4"],
    Staff: ["4"],
  };

  // -------------------- Data Fetching --------------------

  const refreshData = useCallback(async () => {
    const fetchedRoles = await fetchRoles();
    if (fetchedRoles) setRoles(fetchedRoles);

    const fetchedDepartments = await fetchDepartments();
    if (fetchedDepartments) setDepartments(fetchedDepartments);

    const fetchedUsers = await fetchUsers();
    setUsers([fetchedUsers])

    // 1. FIX: Log the *result* of the fetch, not the function itself.
    console.log("Fetched Users Response:", fetchedUsers);

    // 2. FIX: Check if the response is a DRF pagination object and extract the array.
    if (fetchedUsers && Array.isArray(fetchedUsers.results)) {
      setUsers(fetchedUsers.results);
    } else if (fetchedUsers && Array.isArray(fetchedUsers)) {
      // Fallback for non-paginated endpoints
      setUsers(fetchedUsers);
    } else {
      // Ensure it's always an array on failure/unexpected format
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

  const addOrEditRole = async () => {
    if (!newRole.name || !newRole.description)
      return console.error("Fill all fields for role!");
    try {
      if (editingItem) {
        await editRole(editingItem.id, newRole);
      } else {
        await addRole(newRole);
      }
      refreshData();
      setNewRole({ name: "", description: "" });
      setEditingItem(null);
      setOpenRoleModal(false);
    } catch (err) {
      console.error("Failed to save role.", err);
    }
  };

  const editRoleHandler = (role) => {
    setEditingItem(role);
    setNewRole({ name: role.name, description: role.description });
    setOpenRoleModal(true);
  };

  const deleteRoleHandler = async (id) => {
    try {
      await deleteRole(id);
      refreshData();
    } catch (err) {
      console.error("Failed to delete role.", err);
    }
  };

  // -------------------- Departments CRUD --------------------

  const addOrEditDepartment = async () => {
    if (!newDept.name || !newDept.description)
      return console.error("Fill all fields for department!");
    try {
      if (editingItem) {
        await editDepartment(editingItem.id, newDept);
      } else {
        await addDepartment(newDept);
      }
      refreshData();
      setNewDept({ name: "", description: "" });
      setEditingItem(null);
      setOpenDeptModal(false);
    } catch (err) {
      console.error("Failed to save department.", err);
    }
  };

  const editDepartmentHandler = (dep) => {
    setEditingItem(dep);
    setNewDept({ name: dep.name, description: dep.description });
    setOpenDeptModal(true);
  };

  const deleteDepartmentHandler = async (id) => {
    try {
      await deleteDepartment(id);
      refreshData();
    } catch (err) {
      console.error("Failed to delete department.", err);
    }
  };

  // -------------------- Users CRUD --------------------

  const addOrEditUser = async () => {
    // 🚨 Update validation check
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.department
    )
      return toast.error("Fill all fields for user!");

    const roleId = roles.find((r) => r.name === newUser.role)?.id;
    const departmentId = departments.find(
      (d) => d.name === newUser.department
    )?.id;

    if (!departmentId) {
      return toast.error("Invalid role or department selected.");
    }

    const systemUsername =
      `${newUser.firstName.toLowerCase()}.${newUser.lastName.toLowerCase()}`.replace(
        /\s/g,
        "_"
      );

    try {
      const payload = {
        username: systemUsername, // e.g., 'john.doe'
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        email: newUser.email,

        department_id: departmentId,

        // Password is handled by the backend
      };

      if (editingItem) {
        await editUser(editingItem.id, payload);
      } else {
        await addUser(payload);
      }

      refreshData();
      setNewUser({ name: "", email: "", role: "", department: "", level: "" });
      setEditingItem(null);
      setOpenUserModal(false);
    } catch (err) {
      console.error("Failed to save user.", err);
    }
  };

  const editUserHandler = (user) => {
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

  const deleteUserHandler = async (id) => {
    try {
      await deleteUser(id);
      refreshData();
    } catch (err) {
      console.error("Failed to delete user.", err);
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
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle>Roles</CardTitle>
            <Button
              onClick={() => {
                setEditingItem(null);
                setNewRole({ name: "", description: "" });
                setOpenRoleModal(true);
              }}
            >
              Add Role
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-gray-500"
                    >
                      No roles defined.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editRoleHandler(role)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteRoleHandler(role.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle>Departments</CardTitle>
            <Button
              onClick={() => {
                setEditingItem(null);
                setNewDept({ name: "", description: "" });
                setOpenDeptModal(true);
              }}
            >
              Add Department
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-gray-500"
                    >
                      No departments defined.
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell>{dep.name}</TableCell>
                      <TableCell>{dep.description}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editDepartmentHandler(dep)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDepartmentHandler(dep.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Users */}
        <Users
          setEditingItem={setEditingItem}
          setNewUser={setNewUser}
          setOpenUserModal={setOpenUserModal}
          users={users}
          editUserHandler={editUserHandler}
          deleteUserHandler={deleteUserHandler}
        />

        {/* Modals - Keeping reusable components below the main component for simplicity */}
        <RoleModal
          open={openRoleModal}
          onClose={() => setOpenRoleModal(false)}
          role={newRole}
          setRole={setNewRole}
          onSave={addOrEditRole}
          editing={!!editingItem}
        />
        <DepartmentModal
          open={openDeptModal}
          onClose={() => setOpenDeptModal(false)}
          dept={newDept}
          setDept={setNewDept}
          onSave={addOrEditDepartment}
          editing={!!editingItem}
        />
        <UserModal
          open={openUserModal}
          onClose={() => setOpenUserModal(false)}
          user={newUser}
          setUser={setNewUser}
          onSave={addOrEditUser}
          roles={roles}
          departments={departments}
          availableLevels={availableLevels}
          editing={!!editingItem}
        />
      </div>
    </DashboardLayout>
  );
}

// ---------- Reusable Modal Components ----------
function RoleModal({ open, onClose, role, setRole, onSave, editing }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Name"
            value={role.name}
            onChange={(e) => setRole({ ...role, name: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={role.description}
            onChange={(e) => setRole({ ...role, description: e.target.value })}
          />
        </div>
        <DialogFooter>
          <Button onClick={onSave}>{editing ? "Update" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentModal({ open, onClose, dept, setDept, onSave, editing }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Department" : "Add Department"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Name"
            value={dept.name}
            onChange={(e) => setDept({ ...dept, name: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={dept.description}
            onChange={(e) => setDept({ ...dept, description: e.target.value })}
          />
        </div>
        <DialogFooter>
          <Button onClick={onSave}>{editing ? "Update" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
