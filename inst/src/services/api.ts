import axios from "axios";

export const baseURL = "http://127.0.0.1:8000/api";
// export const baseURL = "https://tesc.zchpc.ac.zw/api";

// =========================
// TYPES (ADDED — REQUIRED FOR TS)
// =========================
interface RefreshTokenResponse {
  access: string;
}

// =========================
// AXIOS INSTANCE
// =========================
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// REQUEST INTERCEPTOR
// =========================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// RESPONSE INTERCEPTOR
// =========================
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

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // =========================
    // HANDLE 401 ERRORS
    // =========================
    if (error.response?.status === 401 && !originalRequest._retry) {

      // ❌ DO NOT RETRY REFRESH ENDPOINT
      if (originalRequest.url === "/instauth/token/refresh/") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(error);
      }

      // =========================
      // QUEUE REQUESTS IF REFRESHING
      // =========================
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
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
        // =========================
        // REFRESH TOKEN REQUEST
        // =========================
        const rs = await axios.post<RefreshTokenResponse>(
          `${baseURL}/instauth/token/refresh/`,
          { refresh: refreshToken }
        );

        const access = rs.data.access;

        localStorage.setItem("accessToken", access);
        apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null, access);

        return apiClient(originalRequest);

      } catch (_error) {
        processQueue(_error, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(_error);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
