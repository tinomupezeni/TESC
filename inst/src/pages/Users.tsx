import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchDepartments,
  fetchUsers,
  addDepartment,
  editDepartment,
  deleteDepartment,
  addUser,
  editUser,
  deleteUser,
} from "@/services/settings.services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShieldCheck, Users as UsersIcon, Building, Circle, CheckCircle2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import UsersTable from "@/modules/settings/Users";
import UserModal from "@/modules/settings/UserModal";
import { menuGroups } from "@/components/AppSidebar";

const INSTITUTION_PAGES = menuGroups.flatMap(group => 
  group.items.map(item => ({ name: item.title, url: item.url }))
);


const DepartmentModal = ({ open, onClose, dept, setDept, onSave }: any) => {
  const togglePage = (url: string) => {
    const current = dept.permissions || [];
    const updated = current.includes(url)
      ? current.filter((p: string) => p !== url)
      : [...current, url];
    setDept({ ...dept, permissions: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] overflow-hidden flex flex-col max-h-[90vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Department Access Control</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Assign page access permissions to this department</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1 overflow-y-auto pr-1 sm:pr-2">
          <Input
            placeholder="Department Name (e.g. Finance)"
            value={dept.name}
            className="h-10 sm:h-11"
            onChange={(e) => setDept({ ...dept, name: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border p-3 sm:p-4 rounded-xl bg-muted/20">
            {INSTITUTION_PAGES.map((page) => (
              <div
                key={page.url}
                onClick={() => togglePage(page.url)}
                className="flex items-center gap-3 cursor-pointer hover:bg-background p-3 rounded-lg border border-transparent hover:border-border transition-all"
              >
                {dept.permissions?.includes(page.url) ? (
                  <CheckCircle2 className="text-green-600 h-5 w-5 shrink-0" />
                ) : (
                  <Circle className="text-muted-foreground/30 h-5 w-5 shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-medium">{page.name}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="h-9 sm:h-10 text-xs sm:text-sm">
            Cancel
          </Button>
          <Button onClick={onSave} className="h-9 sm:h-10 text-xs sm:text-sm">Save Permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.level === "1";

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);

  const [newDept, setNewDept] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    role: "",
    level: "4",
  });

  const refreshData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [d, u] = await Promise.all([fetchDepartments(), fetchUsers()]);
      setDepartments(d || []);
      setUsers(u?.results || u || []);
    } catch (err) {
      toast.error("Failed to load users data");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const editUserHandler = (user: any) => {
    setEditingItem(user);
    setNewUser({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email || "",
      role: user.role?.name || "",
      department: user.department?.name || "",
      level: user.level || "4",
    });
    setOpenUserModal(true);
  };

  const saveUser = async () => {
    const deptObj: any = departments.find((d: any) => d.name === newUser.department);
    const payload = {
      username: newUser.email,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      email: newUser.email,
      department_id: deptObj?.id,
      level: newUser.level,
      institution: currentUser?.institution?.id,
    };

    try {
      if (editingItem) {
        await editUser((editingItem as any).id, payload);
        toast.success("User updated");
      } else {
        const response = await addUser(payload);
        setCreatedCredentials({
          email: response.email,
          password: response.password || "tesc@123",
        });
      }
      setOpenUserModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        role: "",
        level: "4",
      });
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Error saving user");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p>You do not have permission to view User Management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage staff accounts, departments, and permissions.</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-muted p-1 w-full sm:w-auto overflow-x-auto justify-start no-scrollbar">
          <TabsTrigger value="users" className="gap-2 text-xs sm:text-sm whitespace-nowrap">
            <UsersIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            Users
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2 text-xs sm:text-sm whitespace-nowrap">
            <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UsersTable
            users={users}
            setEditingItem={setEditingItem}
            setNewUser={setNewUser}
            setOpenUserModal={setOpenUserModal}
            editUserHandler={editUserHandler}
            deleteUserHandler={async (id) => {
              if (confirm("Delete user?")) {
                await deleteUser(id);
                refreshData();
              }
            }}
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card className="border-none sm:border">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6">
              <div>
                <CardTitle className="text-lg sm:text-xl">Departments & Access</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Create departments and assign page access permissions</CardDescription>
              </div>
              <Button
                size="sm"
                className="w-full sm:w-auto h-9"
                onClick={() => {
                  setEditingItem(null);
                  setNewDept({
                    name: "",
                    description: "",
                    permissions: [],
                  });
                  setOpenDeptModal(true);
                }}
              >
                Add Department
              </Button>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
              <div className="rounded-md border overflow-x-auto mx-1 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Department</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Permissions</TableHead>
                      <TableHead className="text-right text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableSkeleton columns={3} rows={5} />
                    ) : departments.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-xs">No departments created.</TableCell></TableRow>
                    ) : (
                      departments.map((dep: any) => (
                        <TableRow key={dep.id}>
                          <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-3">
                            {dep.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[10px] sm:text-xs hidden sm:table-cell">
                            {dep.permissions?.length || 0} Pages Accessible
                          </TableCell>
                          <TableCell className="text-right py-2 sm:py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 mr-2"
                              onClick={() => {
                                setEditingItem(dep);
                                setNewDept(dep);
                                setOpenDeptModal(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={async () => {
                                if (confirm("Delete department?")) {
                                  await deleteDepartment(dep.id);
                                  refreshData();
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- MODALS --- */}
      <Dialog
        open={!!createdCredentials}
        onOpenChange={(open) => !open && setCreatedCredentials(null)}
      >
        <DialogContent className="sm:max-w-md w-[95vw] p-4 sm:p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 text-lg sm:text-xl">
              <ShieldCheck className="h-6 w-6 shrink-0" />
              User Created
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Share these credentials with the user securely.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 p-4 rounded-lg border space-y-4 my-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold">Email</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background p-2 rounded border font-mono text-[10px] sm:text-sm truncate">
                  {createdCredentials?.email}
                </code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(createdCredentials?.email || "")} className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold">Temp Password</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background p-2 rounded border font-mono text-[10px] sm:text-sm">
                  {createdCredentials?.password}
                </code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(createdCredentials?.password || "")} className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCreatedCredentials(null)} className="w-full h-10">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DepartmentModal
        open={openDeptModal}
        onClose={() => setOpenDeptModal(false)}
        dept={newDept}
        setDept={setNewDept}
        onSave={async () => {
          try {
            if (editingItem) await editDepartment((editingItem as any).id, newDept);
            else await addDepartment({ ...newDept, institution: currentUser?.institution?.id });
            setOpenDeptModal(false);
            refreshData();
            toast.success("Department saved successfully");
          } catch (err: any) {
            toast.error(err.message || "Failed to save department");
          }
        }}
      />

      <UserModal
        open={openUserModal}
        onClose={() => setOpenUserModal(false)}
        user={newUser}
        setUser={setNewUser}
        onSave={saveUser}
        departments={departments}
        roles={[]}
        editing={!!editingItem}
      />
    </div>
  );
};

export default UsersPage;
