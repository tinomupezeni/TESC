import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building2,
  Lock,
  Bell,
  Upload,
  ShieldCheck,
  Copy,
  Check,
  Search,
  RotateCcw,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { user: currentUser, updatePassword } = useAuth();
  const isAdmin = currentUser?.level === "1";

  const [notifications, setNotifications] = useState({
    email: true,
    studentRegistration: true,
    resultUploads: false,
    ministryUpdates: true,
  });

  const [createdCredentials, setCreatedCredentials] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // States for Security
  const [passwordData, setPasswordData] = useState({
    old: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

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

  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);

  const refreshData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [r, d, u] = await Promise.all([
        fetchRoles(),
        fetchDepartments(),
        fetchUsers(),
      ]);
      setRoles(r || []);
      setDepartments(d || []);
      setUsers(u?.results || u || []);
    } catch (err) {
      toast.error("Failed to load access control data");
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

  const handleSaveProfile = () => {
    toast.success("Institution profile updated successfully");
  };

  const handleSaveSecurity = async () => {
    if (!passwordData.old || !passwordData.new) {
        return toast.error("Please fill in both current and new passwords");
      }
      if (passwordData.new !== passwordData.confirm) {
        return toast.error("New passwords do not match");
      }
      if (passwordData.new.length < 8) {
        return toast.error("New password must be at least 8 characters");
      }
  
      try {
        await updatePassword(passwordData.old, passwordData.new);
        toast.success("Password changed successfully");
        setPasswordData({ old: "", new: "", confirm: "" });
      } catch (err) {
        const errorMsg = typeof err === "string" ? err : "Failed to update password";
        toast.error(errorMsg);
      }
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
      username: newUser.email, // Using email as username for consistency
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      email: newUser.email,
      department_id: deptObj?.id,
      level: newUser.level,
      institution: currentUser?.institution?.id
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
    } catch (err) {
      toast.error("Error saving user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage institution profile and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <div className="px-1">
          <TabsList className="bg-muted p-1 w-full sm:w-auto overflow-x-auto justify-start no-scrollbar">
            <TabsTrigger value="profile" className="gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 text-xs sm:text-sm whitespace-nowrap">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-4 px-1">
          {/* ... Existing profile content ... */}
          <Card className="border-none sm:border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Institution Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your institution's public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="institution-name" className="text-xs sm:text-sm">Institution Name</Label>
                  <Input
                    id="institution-name"
                    defaultValue={currentUser?.institution?.name || "Mutare Polytechnic"}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="institution-type" className="text-xs sm:text-sm">Type</Label>
                  <Input
                    id="institution-type"
                    defaultValue={currentUser?.institution?.type || "Polytechnic"}
                    disabled
                    className="h-9 sm:h-10 text-xs sm:text-sm bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs sm:text-sm">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={currentUser?.institution?.email || "admin@institution.ac.zw"}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number</Label>
                  <Input id="phone" defaultValue="+263 20 123 4567" className="h-9 sm:h-10 text-xs sm:text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="province" className="text-xs sm:text-sm">Province</Label>
                  <Input id="province" defaultValue="Manicaland" disabled className="h-9 sm:h-10 text-xs sm:text-sm bg-muted" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs sm:text-sm">Physical Address</Label>
                <Textarea
                  id="address"
                  defaultValue="123 Education Drive, Mutare, Zimbabwe"
                  rows={3}
                  className="text-xs sm:text-sm"
                />
              </div>

              <Button onClick={handleSaveProfile} className="w-full sm:w-auto h-9 sm:h-10">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 px-1">
          <Card className="border-none sm:border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Change Password</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your account password regularly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-1.5 relative">
                <Label htmlFor="current-password" className="text-xs sm:text-sm">Current Password</Label>
                <Input 
                    id="current-password" 
                    type={showPasswords.old ? "text" : "password"} 
                    className="h-9 sm:h-10 pr-10" 
                    value={passwordData.old}
                    onChange={(e) => setPasswordData({...passwordData, old: e.target.value})}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-6 h-9 w-9"
                    onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                >
                    {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-1.5 relative">
                <Label htmlFor="new-password"  className="text-xs sm:text-sm">New Password</Label>
                <Input 
                    id="new-password" 
                    type={showPasswords.new ? "text" : "password"} 
                    className="h-9 sm:h-10 pr-10" 
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-6 h-9 w-9"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-1.5 relative">
                <Label htmlFor="confirm-password"  className="text-xs sm:text-sm">Confirm New Password</Label>
                <Input 
                    id="confirm-password" 
                    type={showPasswords.confirm ? "text" : "password"} 
                    className="h-9 sm:h-10 pr-10" 
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-6 h-9 w-9"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <Button onClick={handleSaveSecurity} className="w-full sm:w-auto h-9 sm:h-10">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 px-1">
           {/* ... Existing notifications content ... */}
           <Card className="border-none sm:border">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-sm sm:text-base">
                    Email Notifications
                  </Label>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="student-reg" className="text-sm sm:text-base">Student Registrations</Label>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Alert when new students register
                  </p>
                </div>
                <Switch
                  id="student-reg"
                  checked={notifications.studentRegistration}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      studentRegistration: checked,
                    })
                  }
                />
              </div>

              <Button
                onClick={() => toast.success("Notification preferences saved")}
                className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
              >
                Save Preferences
              </Button>
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

    </div>
  );
};

export default Settings;
