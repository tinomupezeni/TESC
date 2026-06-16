// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/services/api";
import {
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Building,
  Briefcase,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth, updatePassword } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Updated type definition for the ScalarEye profile
type ProfileData = {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  institution_name: string;
};

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password Change States
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const toggleVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const initials = profile
    ? `${profile.first_name[0] || ""}${profile.last_name[0] || ""}`
    : "";

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/users/profile/"); // Correct URL
        setProfile(response.data);
        setFormData(response.data);
      } catch (err) {
        setError("Failed to fetch profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.patch("/users/profile/", formData); // Use PATCH for partial updates
      setProfile(response.data);
      setFormData(response.data);
      updateUser(response.data); // Update AuthContext
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const errorData = err.response?.data;
      const messages = errorData
        ? typeof errorData === "string" 
          ? errorData 
          : Object.values(errorData).flat().join(" ")
        : "Failed to update profile.";
      setError(messages);
      toast.error(messages);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.old || !passwordData.new) {
      return toast.error("Please fill in both current and new passwords");
    }
    if (passwordData.new !== passwordData.confirm) {
      return toast.error("New passwords do not match");
    }
    if (passwordData.new.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(passwordData.old, passwordData.new);
      toast.success("Password changed successfully");
      setPasswordData({ old: "", new: "", confirm: "" });
    } catch (err: any) {
      const errorMsg = typeof err === "string" ? err : err.error || "Failed to update password";
      toast.error(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = () => {
    if (profile) setFormData(profile);
    setIsEditing(false);
    setError(null);
  };

  if (isLoading && !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading ScalarEye Profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto p-4 md:p-8 bg-gray-50 dark:bg-transparent min-h-screen space-y-8">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader className="bg-gray-100 dark:bg-muted/50 p-4 sm:p-6 rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 text-xl border-2 border-white shadow-sm">
                <AvatarImage
                  src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile?.first_name} ${profile?.last_name}`}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl truncate">
                  {profile?.first_name} {profile?.last_name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2">
                  Human Capital Planning and Skills Development
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                <AlertCircle className="mr-2 h-5 w-5 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center p-3 text-sm text-green-700 bg-green-100 rounded-lg">
                <CheckCircle className="mr-2 h-5 w-5 shrink-0" /> {success}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name" className="text-xs sm:text-sm">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      className="h-9 sm:h-10"
                      value={formData.first_name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name" className="text-xs sm:text-sm">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      className="h-9 sm:h-10"
                      value={formData.last_name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="h-9 sm:h-10"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Institutional Role</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Institution</Label>
                    <div className="flex items-center px-3 h-9 sm:h-10 w-full rounded-md border border-input bg-muted/30 text-xs sm:text-sm overflow-hidden">
                      <Building className="mr-2 h-4 w-4 text-gray-500 shrink-0" />
                      <span className="truncate">{profile?.institution_name || "Not Assigned"}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Role</Label>
                    <div className="flex items-center px-3 h-9 sm:h-10 w-full rounded-md border border-input bg-muted/30 text-xs sm:text-sm overflow-hidden">
                      <Briefcase className="mr-2 h-4 w-4 text-gray-500 shrink-0" />
                      <span className="truncate uppercase tracking-wider">{profile?.role.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardFooter className="flex flex-col sm:flex-row justify-end p-0 pt-6 gap-3">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto h-10"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving} className="w-full sm:w-auto h-10">
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)} className="w-full sm:w-auto h-10">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Lock className="h-4 w-4" /> Change Password
            </CardTitle>
            <CardDescription>
              Ensure your account is using a long, random password to stay secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">Current Password</Label>
                <div className="relative">
                  <Input
                    className="h-9 sm:h-10 pr-10"
                    type={showPasswords.old ? "text" : "password"}
                    placeholder="Enter current password"
                    value={passwordData.old}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        old: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility("old")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                  >
                    {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="hidden md:block"></div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">New Password</Label>
                <div className="relative">
                  <Input
                    className="h-9 sm:h-10 pr-10"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility("new")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    className="h-9 sm:h-10 pr-10"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-4 sm:p-6 pt-0">
            <Button
              className="w-full sm:w-auto h-10"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
