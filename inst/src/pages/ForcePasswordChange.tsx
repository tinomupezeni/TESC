import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Lock, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ScalarEyeLogo } from "@/components/layout/ScalarEyeLogo";
import apiClient from "@/services/api";

const ForcePasswordChange = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = () => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;
    return strength;
  };

  const getStrengthLabel = () => {
    const strength = passwordStrength();
    if (strength <= 25) return { label: "Weak", color: "text-destructive" };
    if (strength <= 50) return { label: "Medium", color: "text-orange-500" };
    if (strength <= 75) return { label: "Good", color: "text-blue-500" };
    return { label: "Strong", color: "text-green-600" };
  };

  const passwordRequirements = [
    { test: newPassword.length >= 8, label: "At least 8 characters" },
    { test: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword), label: "Upper & lowercase letters" },
    { test: /[0-9]/.test(newPassword), label: "At least one number" },
    { test: /[^A-Za-z0-9]/.test(newPassword), label: "At least one symbol" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (passwordStrength() < 100) {
      toast.error("Password does not meet all security requirements");
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.patch("/instauth/profile/", {
        old_password: oldPassword,
        new_password: newPassword
      });
      
      toast.success("Password updated successfully! Please login again.");
      
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Failed to update password. Ensure your current password is correct.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getStrengthLabel();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <ScalarEyeLogo className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Security Update</CardTitle>
          <CardDescription className="text-center">
            Set your permanent password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-amber-50 border-orange-200 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Welcome {user?.first_name}. You must change your temporary password before accessing the institution portal.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="oldPassword">Temporary Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter current temporary password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 pr-10"
                  required
                />
                <div 
                  className="absolute right-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Secure Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Create new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 pr-10"
                  required
                />
                <div 
                  className="absolute right-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </div>
              </div>
              {newPassword && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Strength:</span>
                    <span className={`font-medium ${strength.color}`}>{strength.label}</span>
                  </div>
                  <Progress value={passwordStrength()} className="h-1.5" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 pr-10"
                  required
                />
                <div 
                  className="absolute right-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-muted p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Requirements:</p>
              <div className="space-y-1">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {req.test ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    <span className={req.test ? "text-green-700" : "text-muted-foreground"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isLoading || passwordStrength() < 100}
            >
              {isLoading ? "Saving..." : "Update & Sign In"}
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
