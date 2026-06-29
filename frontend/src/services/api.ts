import axios from "axios";

// Resolve baseURL dynamically
// const getBaseURL = () => {
//   if (typeof window !== "undefined") {
//     const { hostname, protocol } = window.location;
//     // If accessing via IP or localhost directly on port 8081/8082,
//     // the backend is likely on 8000
//     if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("10.50.")) {
//       return `${protocol}//${hostname}:8000/api`;
//     }
//     // Otherwise assume standard production routing (/api proxied by nginx)
//     if (hostname.endsWith(".zchpc.ac.zw")) {
//       return `${protocol}//${hostname}/api`;
//     }
//     return `${protocol}//${hostname}/api`;
//   }
//   // Server-side fallback – use environment variable or a sensible default
//   return "http://127.0.0.1:8000/api";
// };


// export const baseURL = getBaseURL();
export const baseURL = "http://127.0.0.1:8000/api";


const apiClient = axios.create({
  baseURL,
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
      // Skip retry for login/refresh endpoints themselves
      if (originalRequest.url?.includes("/users/token/")) {
        // If it's the refresh endpoint failing, clear tokens and redirect
        if (originalRequest.url?.includes("/users/token/refresh/")) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/";
        }
        // For login failures, just pass the error to the component
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
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
        const response = await axios.post(`${baseURL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("accessToken", access);

        // Update default and current request headers
        apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

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