// src/contexts/AuthContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/services/api";

// --- 1. Define User Interfaces ---
interface RoleInfo {
  id: number;
  name: string;
}

interface DepartmentInfo {
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
  role: RoleInfo | null;
  department: DepartmentInfo | null;
}

// --- 2. Define the Context Shape ---
interface AuthContextType {
  accessToken: string | null;
  user: UserInfo | null;
  loading: boolean; // 🚨 Added loading state
  login: (email: string, password: string) => Promise<void>;
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

  // Function to handle user login
  const login = async (email: string, password: string) => {
    const response = await apiClient.post("/users/token/", {
      email: email,
      password,
    });

    const { access, refresh, user: fetchedUser } = response.data;

    // Store tokens
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    // Set context state
    setAccessToken(access);
    setUser(fetchedUser);

    return fetchedUser;
  };

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setUser(null);
    setLoading(false);
    navigate("/");
  };

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
  }, [accessToken]);

  const authContextValue: AuthContextType = {
    accessToken,
    user,
    loading, // 🚨 Added loading to context value
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
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
