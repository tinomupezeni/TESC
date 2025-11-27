import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { bg_image, tesc_logo } from "@/constants/images";
import {
  getInstitutionAdminProfile,
  loginInstitutionAdmin,
} from "@/services/auth.services";

// Define TypeScript interfaces for the API responses
interface Tokens {
  refresh: string;
  access: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

interface LoginSuccessResponse {
  message: string;
  user: User;
  tokens: Tokens;
}

interface LoginErrorResponse {
  message?: string;
  errors?: {
    username?: string | string[];
    password?: string | string[];
    non_field_errors?: string | string[];
  };
}

interface ApiError {
  response?: {
    data: LoginErrorResponse;
    status: number;
  };
  request?: any;
  message?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // <-- Prevent page refresh
    setIsLoading(true);
    setError("");

    try {
      const { tokens } = await loginInstitutionAdmin({ username, password });
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);

      const profile = await getInstitutionAdminProfile();
      console.log("Logged in user:", profile);

      // Navigate to dashboard or home page after login
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
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_image})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <Card className="w-full max-w-md shadow-2xl rounded-2xl relative z-10">
        <CardHeader className="space-y-1 text-center">
          <img src={tesc_logo} className="h-28 mx-auto" />

          <CardTitle className="text-2xl font-bold">
            TESC INSTITUTION <br /> Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Institution</Label>
              <Input
                id="username"
                placeholder="e.g., mutarepoly"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Helper Links */}
            <div className="text-center space-y-2 mt-2">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => navigate("/forgot-password")}
                disabled={isLoading}
              >
                Forgot Password?
              </Button>

              <p className="text-sm text-muted-foreground">
                Don't have an account? Contact your system adminstration
                department
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
