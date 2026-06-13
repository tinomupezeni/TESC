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
    // 🚨 Respect the current protocol (http or https)
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

// 1. Request Interceptor: Attach the Access Token
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

// 2. Response Interceptor: Handle Token Expiration (401)
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Safety: If the refresh request OR login request itself fails, don't try to refresh
      if (originalRequest.url?.includes("/users/token/")) {
        // If it was the refresh token failing, clear and redirect
        if (originalRequest.url?.includes("/users/token/refresh/")) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/";
        }
        // If it was the login failing, just pass the error through to the component
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
        // We use a clean axios instance here to avoid interceptor loops
        const response = await axios.post(`${baseURL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("accessToken", access);

        // Update the current request and the instance defaults
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        processQueue(null, access);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
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