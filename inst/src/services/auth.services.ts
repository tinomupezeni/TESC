import apiClient from "./api"; // your Axios instance

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  tokens?: {
    access: string;
    refresh?: string;
  };
  must_change_password?: boolean;
  institution_id?: number;
  requires_otp?: boolean;
  user_id?: number;
  message?: string;
}

/**
 * Login as Institution Admin
 */
export const loginInstitutionAdmin = async (
  data: LoginData
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/instauth/login/",  // Django endpoint
    data
  );
  console.log(response);
  
  return response.data;
};

export const verifyInstitutionOTP = async (
  user_id: number,
  otp_code: string
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/instauth/verify-otp/",
    { user_id, otp_code }
  );
  return response.data;
};

/**
 * Refresh JWT access token
 */
export const refreshToken = async (): Promise<{ access: string }> => {
  const response = await apiClient.post<{ access: string }>(
    "/instauth/token/refresh/"
  );
  return response.data;
};

/**
 * Verify JWT token
 */
export const verifyToken = async (token: string): Promise<void> => {
  await apiClient.post("/instauth/token/verify/", { token });
};

/**
 * Logout institution admin
 */
export const logoutInstitutionAdmin = async (): Promise<void> => {
  await apiClient.post("/instauth/logout/");
};

/**
 * Get current logged-in user profile
 */
export const getInstitutionAdminProfile = async () => {
  const response = await apiClient.get("/instauth/profile/");
  return response.data;
};
