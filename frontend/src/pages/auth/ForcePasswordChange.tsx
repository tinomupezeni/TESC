import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { ScalarEyeLogo } from "@/components/layout/ScalarEyeLogo";
import { useAuth, updatePassword } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ForcePasswordChange = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    try {
      await updatePassword(passwords.oldPassword, passwords.newPassword);
      toast.success("Password updated successfully! Please login again.");
      
      // Delay logout slightly so they can see the success message
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (err: any) {
      const errorMsg = err.error || "Failed to update password. Please check your current password.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <ScalarEyeLogo className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold">Secure Your Account</CardTitle>
          <CardDescription>
            This is your first login. For security reasons, you must change your password before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex gap-3 items-start border border-blue-100">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p>Welcome, <strong>{user?.first_name}</strong>. Your account was created with a temporary password. Please set a new one now.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current/Temporary Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwords.oldPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10"
                />
                <div
                    className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10"
                />
                <div
                    className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10"
                />
                <div
                    className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password & Continue"}
            </Button>
            
            <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-gray-500 text-xs"
                onClick={() => logout()}
            >
                Cancel and Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForcePasswordChange;
