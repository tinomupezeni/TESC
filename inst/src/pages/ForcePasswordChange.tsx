import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const ForcePasswordChange = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    if (strength <= 50) return { label: "Medium", color: "text-warning" };
    if (strength <= 75) return { label: "Good", color: "text-info" };
    return { label: "Strong", color: "text-success" };
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
      toast.error("Password does not meet all requirements");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Password updated successfully!");
      navigate("/dashboard");
    }, 1500);
  };

  const strength = getStrengthLabel();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_left]" />
      <Card className="w-full max-w-md shadow-2xl relative z-10 border-warning/10 rounded-2xl">
        <CardHeader className="space-y-1 p-6 sm:p-8 pb-4 sm:pb-6">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-warning/10 flex items-center justify-center shadow-inner">
              <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-warning" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center tracking-tight">Change Password</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm px-4">
            You're using a temporary password. Please create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8 sm:pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Alert className="bg-warning/10 border-warning py-2.5 px-3">
              <AlertCircle className="h-4 w-4 text-warning shrink-0" />
              <AlertDescription className="text-warning-foreground text-[10px] sm:text-xs">
                For security, you must change your password before proceeding.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="newPassword text-xs sm:text-sm font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="h-10 sm:h-11 text-xs sm:text-sm shadow-sm"
              />
              {newPassword && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="text-muted-foreground">Strength:</span>
                    <span className={`font-bold ${strength.color}`}>{strength.label}</span>
                  </div>
                  <Progress value={passwordStrength()} className="h-1.5 sm:h-2" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword text-xs sm:text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="h-10 sm:h-11 text-xs sm:text-sm shadow-sm"
              />
            </div>

            <div className="space-y-2.5 rounded-xl bg-muted/50 p-4 border border-border/50">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requirements:</p>
              <div className="space-y-2">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[10px] sm:text-xs">
                    {req.test ? (
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 opacity-40" />
                    )}
                    <span className={req.test ? "text-success font-medium" : "text-muted-foreground"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-sm sm:text-base font-semibold shadow-lg shadow-primary/20" 
              disabled={isLoading || passwordStrength() < 100}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Updating...
                </div>
              ) : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForcePasswordChange;
