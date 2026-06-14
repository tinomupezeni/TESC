import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { bg_image } from "@/components/layout/ScalarEyeLogo";
import { ScalarEyeLogo } from "@/components/layout/ScalarEyeLogo";
import {
  getInstitutionAdminProfile,
  loginInstitutionAdmin,
} from "@/services/auth.services";
import { getAllInstitutions } from "@/services/institution.service";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form States
  const [selectedInstId, setSelectedInstId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Fetch Institutions for the Dropdown ---
  const { data: institutions, isLoading: isLoadingInsts } = useQuery({
    queryKey: ["institutions-list"],
    queryFn: getAllInstitutions,
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Authenticate with the backend
      const { tokens } = await loginInstitutionAdmin({ 
        username: email, 
        password 
      });
      
      await login(tokens.access, tokens.refresh);

      // 3. Navigate only after the user data is ready
      navigate("/dashboard");

    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${bg_image})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />
      
      <Card className="w-full max-w-[420px] shadow-2xl rounded-2xl relative z-10 border-white/10 bg-white/95 dark:bg-slate-950/95 overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-4 sm:pb-6 p-6 sm:p-8">
          <div className="mx-auto flex justify-center mb-4">
            <ScalarEyeLogo className="h-20 w-20 sm:h-24 sm:w-24" />
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
            Institution Portal
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Verify your institution and sign in
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8 sm:pb-10">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {error && (
              <Alert variant="destructive" className="py-2.5 px-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* 1. Institution Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="institution" className="text-xs sm:text-sm font-medium">Institution Name</Label>
              <Select 
                onValueChange={(value) => setSelectedInstId(value)} 
                disabled={isLoading || isLoadingInsts}
              >
                <SelectTrigger id="institution" className="h-10 sm:h-11 bg-slate-50/50 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground truncate">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <SelectValue placeholder={isLoadingInsts ? "Loading list..." : "Select institution"} />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {institutions?.map((inst: any) => (
                    <SelectItem key={inst.id} value={inst.id.toString()} className="text-xs sm:text-sm">
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Email Input */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Institutional Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@institution.ac.zw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-10 sm:h-11 text-xs sm:text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* 3. Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" title="password" className="text-xs sm:text-sm font-medium">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-[10px] sm:text-xs text-muted-foreground hover:text-primary"
                  onClick={() => navigate("/forgot-password")}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 h-10 sm:h-11 text-xs sm:text-sm transition-all"
                  required
                />
                <div 
                  className="absolute right-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold mt-2 shadow-lg shadow-primary/20" 
              disabled={isLoading || !selectedInstId || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Verifying...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center pt-4 sm:pt-6 border-t mt-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                Protected by ZCHPC System Security
                <span className="h-1 w-1 rounded-full bg-slate-400" />
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;