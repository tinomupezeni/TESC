// context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import apiClient, { setTokenForApi, onTokenRefresh } from "@/services/api";
import { useNavigate } from "react-router-dom";

// 1. Update User interface to match what Sidebar expects (nested institution object)
interface Institution {
  id: number;
  name: string;
  email?: string;
  type?: string;
  location?: string;
  address?: string;
  capacity?: number;
  established?: number;
  status?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  level: string;
  must_change_password: boolean;
  institution: Institution; // Changed from institution_id to object
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setTokenForApi(token);
  }, []);

  const fetchProfile = useCallback(async (token: string) => {
    try {
      // Set temporary token for profile fetch
      const res = await apiClient.get("/instauth/profile/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, [setAccessToken]);

  useEffect(() => {
    // Register the api callback listener
    onTokenRefresh((token) => {
      if (token) {
        setAccessTokenState(token);
      } else {
        // Refresh failed (logged out)
        setAccessTokenState(null);
        setUser(null);
        navigate("/login");
      }
    });

    const initAuth = async () => {
      try {
        setLoading(true);
        // Silently refresh token on app mount/load using the HTTP-only cookie
        const res = await apiClient.post("/instauth/token/refresh/");
        const token = res.data.access;
        setAccessToken(token);
        await fetchProfile(token);
      } catch (err) {
        console.log("No active session or session expired.");
        setAccessToken(null);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, [setAccessToken, fetchProfile, navigate]);

  const login = async (accessToken: string, refreshToken?: string) => {
    setAccessToken(accessToken);
    // Crucial: Fetch profile immediately after setting tokens
    await fetchProfile(accessToken);
  };

  const logout = async () => {
    try {
      await apiClient.post("/instauth/logout/");
    } catch (err) {
      console.error("Failed to clear cookie on logout", err);
    }
    setAccessToken(null);
    setUser(null);
    navigate("/login");
  };

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      await apiClient.patch("/users/profile/", {
        old_password: oldPassword,
        new_password: newPassword,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (error: any) {
      throw error.response?.data?.error || error.response?.data?.detail || "Failed to update password";
    }
  };

  const refreshProfile = async () => {
    if (accessToken) await fetchProfile(accessToken);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading, updatePassword, refreshProfile, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};