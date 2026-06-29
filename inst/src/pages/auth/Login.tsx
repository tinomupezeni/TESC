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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2, Loader2, Mail, Lock, Eye, EyeOff, Check, ChevronsUpDown } from "lucide-react";
import { bg_image } from "@/components/layout/ScalarEyeLogo";
import { ScalarEyeLogo } from "@/components/layout/ScalarEyeLogo";
import {
  getInstitutionAdminProfile,
  loginInstitutionAdmin,
} from "@/services/auth.services";
import { getAllInstitutions } from "@/services/institution.service";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form States
  const [selectedInstId, setSelectedInstId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  
  // OTP States
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  
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
      const res = await loginInstitutionAdmin({ 
        username: email, 
        password 
      });
      
      if (res.requires_otp && res.user_id) {
        setRequiresOtp(true);
        setUserId(res.user_id);
        return;
      }
      
      if (res.tokens) {
        await login(res.tokens.access, res.tokens.refresh);
        navigate("/dashboard");
      }

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

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsLoading(true);
    setError("");

    try {
      const { verifyInstitutionOTP } = await import("@/services/auth.services");
      const res = await verifyInstitutionOTP(userId, otp);
      
      if (res.tokens) {
        await login(res.tokens.access, res.tokens.refresh);
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Verification failed. Please try again.");
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
          {requiresOtp ? (
            <form onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <Alert variant="destructive" className="py-2.5 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5 text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  An email has been sent to your address with a 6-digit OTP code.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-xs sm:text-sm font-medium">OTP Code</Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    className="h-10 sm:h-11 px-9 bg-slate-50/50 text-xs sm:text-sm transition-all focus:bg-white"
                    maxLength={6}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-10 sm:h-11 font-medium bg-[#1e293b] hover:bg-[#0f172a] text-white transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>
              <div className="text-center mt-4">
                <Button variant="link" onClick={() => setRequiresOtp(false)} className="text-xs">
                  Back to Login
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {error && (
                <Alert variant="destructive" className="py-2.5 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {/* 1. Searchable Institution Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="institution" className="text-xs sm:text-sm font-medium">Institution Name</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between h-10 sm:h-11 bg-slate-50/50 text-xs sm:text-sm font-normal"
                      disabled={isLoading || isLoadingInsts}
                    >
                      {selectedInstId
                        ? institutions?.find((i: any) => i.id.toString() === selectedInstId)?.name
                        : "Select institution..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search institution..." />
                      <CommandList>
                        <CommandEmpty>No institution found.</CommandEmpty>
                        <CommandGroup>
                          {institutions?.map((inst: any) => (
                            <CommandItem
                              key={inst.id}
                              value={inst.name}
                              onSelect={() => {
                                setSelectedInstId(inst.id.toString());
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedInstId === inst.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {inst.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 2. Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-10 sm:h-11 pl-9 bg-slate-50/50 text-xs sm:text-sm transition-all focus:bg-white group-hover:border-slate-400"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600" />
                </div>
              </div>

              {/* 3. Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Password</Label>
                  <Button variant="link" className="p-0 h-auto text-xs font-normal" onClick={() => navigate("/forgot-password")}>
                    Forgot password?
                  </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;