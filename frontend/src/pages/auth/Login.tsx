import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { bg_image, ScalarEyeLogo } from "@/components/layout/ScalarEyeLogo";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP States
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { login, verifyOTP } = useAuth();
  const location = useLocation();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getDashboardRoute = (departmentName: string | undefined) => {
    if (!departmentName) return "/dashboard";
    switch (departmentName) {
      case "Innovation and Industrialisation": return "/dashboard/innovation";
      case "Admissions": return "/dashboard/admissions";
      case "Monitoring and Evaluation": return "/dashboard/mne";
      case "IT":
      case "Executive Administration": return "/dashboard";
      default: return "/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(form.email, form.password);
      
      if (response && response.requires_otp && response.user_id) {
        setRequiresOtp(true);
        setUserId(response.user_id);
        return;
      }
      
      const authenticatedUser = response;
      const departmentName = authenticatedUser?.department?.name;
      const redirectPath = getDashboardRoute(departmentName);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Invalid credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const authenticatedUser = await verifyOTP(userId, otp);
      const departmentName = authenticatedUser?.department?.name;
      const redirectPath = getDashboardRoute(departmentName);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Invalid OTP code.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_image})` }}
    >
      <div className="absolute inset-0 bg-black/70" />
      
      <Card className="w-full max-w-md bg-white/95 dark:bg-slate-950/95 border-white/10 shadow-2xl rounded-2xl relative z-10 text-slate-900 dark:text-white">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <ScalarEyeLogo className="h-24 w-24" />
          </div>
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Scalareye </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Zimbabwe Human Capital Planning and Skills Development
            </p>
          </div>

          {requiresOtp ? (
            <form className="space-y-4" onSubmit={handleOtpSubmit}>
              {error && (
                <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="mr-2" size={18} />
                  {error}
                </div>
              )}
              
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  An email has been sent to your address with a 6-digit OTP code.
                </p>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all" 
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </Button>

              <div className="text-center mt-4">
                <Button variant="link" onClick={() => setRequiresOtp(false)} className="text-xs text-muted-foreground hover:text-foreground">
                  Back to Login
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="mr-2" size={18} />
                  {error}
                </div>
              )}
              
              <div className="relative">
                <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <div
                  className="absolute right-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="flex justify-end -mt-3">
                <span 
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  Forgot password?
                </span>
              </div>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground mt-4">
            Don’t have an account? <br /> 
            <span className="font-semibold text-primary hover:underline cursor-pointer">
                Contact the system administrator
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;