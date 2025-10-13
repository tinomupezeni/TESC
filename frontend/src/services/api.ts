// src/services/api.ts
import axios from "axios";

// Create an axios instance with the base URL of your Django API
const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Make sure this matches your Django server
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add the interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("accessToken");
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default apiClient;