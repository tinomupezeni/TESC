import axios from "axios";

// Resolve baseURL dynamically
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("10.50.")) {
      return `${protocol}//${hostname}:8000/api`;
    }
    if (hostname.endsWith(".zchpc.ac.zw")) {
      return `${protocol}//${hostname}/api`;
    }
    return `${protocol}//${hostname}/api`;
  }
  return "https://tesc.zchpc.ac.zw/api";
};

export const baseURL = getBaseURL();

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Since we cannot directly import useAuth (it's a hook, context provider wraps the app),
// we need a mechanism to get the token.
// A common pattern is to update the interceptor when the token changes,
// or store it in a module-level variable that the AuthProvider updates.
let currentToken: string | null = null;

export const setTokenForApi = (token: string | null) => {
  currentToken = token;
};

// Listeners to propagate refreshed tokens back to AuthContext
type TokenRefreshListener = (token: string | null) => void;
let tokenRefreshListener: TokenRefreshListener | null = null;

export const onTokenRefresh = (cb: TokenRefreshListener) => {
  tokenRefreshListener = cb;
};

// Request Interceptor: Adds the token to headers from module variable
apiClient.interceptors.request.use(
  (config) => {
    console.log("Interceptor: Using token:", !!currentToken);
    if (currentToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    } else {
        console.warn("Interceptor: No access token available.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables for handling the refresh token queue
let isRefreshing = false;
let failedQueue: Array<{ 
  resolve: (token: string) => void; 
  reject: (error: any) => void; 
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handles 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Prevent infinite loop
      if (originalRequest.url?.includes("/instauth/login/") || originalRequest.url?.includes("/instauth/token/refresh/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send a POST request to refresh. The browser automatically attaches the HttpOnly cookie.
        const res = await apiClient.post("/instauth/token/refresh/");
        const newAccessToken = res.data.access;

        setTokenForApi(newAccessToken);

        if (tokenRefreshListener) {
          tokenRefreshListener(newAccessToken);
        }

        processQueue(null, newAccessToken);
        
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        
        // If refresh fails, clear token and notify listener (which will trigger log out)
        setTokenForApi(null);
        if (tokenRefreshListener) {
          tokenRefreshListener(null);
        }
        
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;