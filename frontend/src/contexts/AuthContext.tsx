// src/contexts/AuthContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- 1. Define User Interfaces ---
interface RoleInfo {
  id: number;
  name: string;
}

interface DepartmentInfo {
  id: number;
  name: string;
}

interface InstitutionInfo {
  id: number;
  name: string;
}

interface UserInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  level: string;
  must_change_password: boolean;
  institution: InstitutionInfo | null;
  role: RoleInfo | null;
  department: DepartmentInfo | null;
}

// --- 2. Define the Context Shape ---
interface AuthContextType {
  accessToken: string | null;
  user: UserInfo | null;
  loading: boolean; // 🚨 Added loading state
  login: (email: string, password: string) => Promise<any>;
  verifyOTP: (user_id: number, otp_code: string) => Promise<any>;
  logout: () => void;
  updateUser: (userData: Partial<UserInfo>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. AuthProvider Component ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  // State for token (retrieved from localStorage on load)
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true); // 🚨 Start in loading state
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const showTimeoutWarningRef = useRef(false);

  // Function to handle user login
  const login = async (email: string, password: string) => {
    const response = await apiClient.post("/users/token/", {
      email: email,
      password,
    });

    if (response.data.requires_otp) {
      return response.data;
    }

    const { access, refresh, user: fetchedUser } = response.data;

    // 🚨 Block Institution Users from Main Dashboard
    if (fetchedUser.institution) {
      throw new Error("Institution accounts are not authorized to access the main dashboard. Please use the Institution Portal.");
    }

    // Store tokens
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    // Set context state
    setAccessToken(access);
    setUser(fetchedUser);

    return fetchedUser;
  };

  const verifyOTP = async (user_id: number, otp_code: string) => {
    const response = await apiClient.post("/users/verify-otp/", {
      user_id,
      otp_code,
    });

    const { access, refresh, user: fetchedUser } = response.data;

    // 🚨 Block Institution Users from Main Dashboard
    if (fetchedUser.institution) {
      throw new Error("Institution accounts are not authorized to access the main dashboard. Please use the Institution Portal.");
    }

    // Store tokens
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    // Set context state
    setAccessToken(access);
    setUser(fetchedUser);

    return fetchedUser;
  };

  // Function to handle user logout
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setUser(null);
    setLoading(false);
    navigate("/");
  }, [navigate]);

  // Function to update user in state
  const updateUser = (userData: Partial<UserInfo>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  useEffect(() => {
    const fetchUserOnLoad = async () => {
      if (accessToken) {
        try {
          const profileResponse = await apiClient.get<UserInfo>(
            "/users/profile/"
          );
          setUser(profileResponse.data);
        } catch (error) {
          console.error(
            "Failed to fetch user profile on load. Logging out.",
            error
          );
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserOnLoad();
  }, [accessToken, logout]);

  // --- Inactivity Timeout (5 minutes) ---
  useEffect(() => {
    let warningTimeoutId: ReturnType<typeof setTimeout>;
    let logoutTimeoutId: ReturnType<typeof setTimeout>;

    const resetTimeout = () => {
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (logoutTimeoutId) clearTimeout(logoutTimeoutId);
      setShowTimeoutWarning(false);
      showTimeoutWarningRef.current = false;

      if (accessToken) {
        warningTimeoutId = setTimeout(() => {
          setShowTimeoutWarning(true);
          showTimeoutWarningRef.current = true;
        }, 4.5 * 60 * 1000);

        logoutTimeoutId = setTimeout(() => {
          console.log("Logged out due to inactivity");
          setShowTimeoutWarning(false);
          showTimeoutWarningRef.current = false;
          logout();
        }, 5 * 60 * 1000);
      }
    };

    resetTimeout();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (!showTimeoutWarningRef.current) {
        resetTimeout();
      }
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (logoutTimeoutId) clearTimeout(logoutTimeoutId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [accessToken, logout]);

  const authContextValue: AuthContextType = {
    accessToken,
    user,
    loading, // 🚨 Added loading to context value
    login,
    verifyOTP,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}

      <AlertDialog open={showTimeoutWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inactivity Warning</AlertDialogTitle>
            <AlertDialogDescription>
              You have been inactive for a while. For your security, you will be automatically logged out in 30 seconds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowTimeoutWarning(false);
              showTimeoutWarningRef.current = false;
              // Simulate activity to reset the timer
              window.dispatchEvent(new Event('mousemove'));
            }}>
              Keep Me Logged In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  );
};

// Inside AuthContext.tsx
export const updatePassword = async (oldPassword, newPassword) => {
  try {
    const response = await apiClient.patch("/users/profile/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to update password";
  }
};

// Custom hook to easily use the auth context (remains the same)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
