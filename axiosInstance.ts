// frontend/src/utils/axiosInstance.ts
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000", // Default to localhost
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Replace with your token storage method
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional: handle global errors)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: log out on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
