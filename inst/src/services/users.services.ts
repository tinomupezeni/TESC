import apiClient from "./api";

export interface InstUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: number | null;
    role_name: string;
    level: string;
    must_change_password: boolean;
    is_active: boolean;
}

export const getInstUsers = async () => {
    const response = await apiClient.get<InstUser[]>("/instauth/users/");
    return response.data;
};

export const createInstUser = async (data: any) => {
    const response = await apiClient.post<InstUser>("/instauth/users/", data);
    return response.data;
};

export const updateInstUser = async (id: number, data: any) => {
    const response = await apiClient.patch<InstUser>(`/instauth/users/${id}/`, data);
    return response.data;
};

export const deleteInstUser = async (id: number) => {
    await apiClient.delete(`/instauth/users/${id}/`);
};

export const getInstRoles = async () => {
    const response = await apiClient.get<any[]>("/instauth/roles/");
    return response.data;
};
