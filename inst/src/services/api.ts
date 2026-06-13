import axios from "axios";

// Resolve baseURL dynamically
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    // If accessing via IP or localhost directly on port 8081/8082, 
    // the backend is likely on 8000
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("10.50.")) {
      return `${protocol}//${hostname}:8000/api`;
    }
    // Otherwise assume standard production routing (/api proxied by nginx)
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
});

// Request Interceptor: Adds the token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Check if error is 401 and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Safety check: Prevent infinite loop if the refresh OR login endpoint itself returns 401
      if (originalRequest.url?.includes("/instauth/login/") || originalRequest.url?.includes("/instauth/token/refresh/")) {
        // Only redirect to home if it was the refresh token that failed
        if (originalRequest.url?.includes("/instauth/token/refresh/")) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/";
        }
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

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        // Use standard axios here to avoid triggering the interceptor loop
        const response = await axios.post(`${baseURL}/instauth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("accessToken", access);

        // Update the main client and the current failed request
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        processQueue(null, access);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Refresh token expired. Logging out.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;