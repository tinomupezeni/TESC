import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
      setIsLoading(false);
      toast.success("Password reset link sent!");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_left]" />
        <Card className="w-full max-w-md shadow-2xl relative z-10 border-success/10 rounded-2xl">
          <CardHeader className="text-center p-6 sm:p-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-success/10 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">Check Your Email</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2 px-2">
              We've sent a password reset link to <br /><strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-8 sm:pb-10">
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_left]" />
      <Card className="w-full max-w-md shadow-2xl relative z-10 border-primary/10 rounded-2xl">
        <CardHeader className="space-y-1 p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
              <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm px-4">
            Enter your email or username to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8 sm:pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="e.g., mutarepoly or admin@mutarepoly.ac.zw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-10 sm:h-11 text-xs sm:text-sm shadow-sm"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-sm sm:text-base font-semibold shadow-lg shadow-primary/20" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Sending...
                </div>
              ) : "Send Reset Link"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full h-10 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
