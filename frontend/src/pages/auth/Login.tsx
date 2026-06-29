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

  const navigate = useNavigate();
  const { login } = useAuth();
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
      const authenticatedUser = await login(form.email, form.password);
      const departmentName = authenticatedUser?.department?.name;
      const redirectPath = getDashboardRoute(departmentName);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const status = err.response?.status;
      setError(status === 401 || status === 400 ? "Invalid credentials." : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_image})` }}
    >
      {/* Dark overlay to make the glass effect pop */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      
      {/* Glassmorphism Card */}
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-lg border-white/10 shadow-2xl rounded-2xl relative z-10 text-white">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <ScalarEyeLogo className="h-24 w-24" />
          </div>
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Scalareye </h1>
            <p className="text-gray-300 text-sm font-medium">
              Zimbabwe Human Capital Planning and Skills Development
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center p-3 text-sm text-red-200 bg-red-900/30 border border-red-500/50 rounded-lg">
                <AlertCircle className="mr-2" size={18} />
                {error}
              </div>
            )}
            
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-blue-400"
                disabled={isLoading}
              />
              <div
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-white"
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
          </form>

          <div className="text-center text-sm text-gray-400">
            Don’t have an account? <br /> 
            <span className="font-semibold text-gray-200 hover:underline cursor-pointer">
                Contact the system administrator
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;