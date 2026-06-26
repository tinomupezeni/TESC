import apiClient from "./api";

// -------------------- Fetch Data --------------------

/** Fetches all defined roles for the institution. */
export const fetchRoles = async () => {
  try {
    const response = await apiClient.get("/users/roles/");
    return response.data;
  } catch (err) {
    console.error("Error fetching roles:", err);
    return []; 
  }
};

/** Fetches all defined departments for the institution. */
export const fetchDepartments = async () => {
  try {
    const response = await apiClient.get("/users/departments/");
    return response.data;
  } catch (err) {
    console.error("Error fetching departments:", err);
    return [];
  }
};

/** Fetches all institutional users. */
export const fetchUsers = async () => {
  try {
    const response = await apiClient.get("/users/users/");
    return response.data;
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
};

// -------------------- CRUD Handlers - Roles --------------------

/** Adds a new role. */
export const addRole = async (newRole: any) => {
  try {
    return await apiClient.post("/users/roles/", newRole);
  } catch (err) {
    console.error("Error adding role:", err);
    throw new Error("Failed to add role.");
  }
};

/** Edits an existing role. */
export const editRole = async (id: number, updatedRole: any) => {
  try {
    return await apiClient.put(`/users/roles/${id}/`, updatedRole);
  } catch (err) {
    console.error("Error updating role:", err);
    throw new Error("Failed to update role.");
  }
};

/** Deletes a role by ID. */
export const deleteRole = async (id: number) => {
  try {
    return await apiClient.delete(`/users/roles/${id}/`);
  } catch (err) {
    console.error("Error deleting role:", err);
    throw new Error("Failed to delete role.");
  }
};

// -------------------- CRUD Handlers - Departments --------------------

/** Adds a new department. */
export const addDepartment = async (newDept: any) => {
  try {
    return await apiClient.post("/users/departments/", newDept);
  } catch (err: any) {
    console.error("Error adding department:", err);
    let errorMessage = "Failed to add department.";
    if (err.response?.data) {
       const data = err.response.data;
       if (data.name && Array.isArray(data.name)) errorMessage = data.name[0];
       else if (data.detail) errorMessage = data.detail;
       else if (typeof data === 'string') errorMessage = data;
       else errorMessage = JSON.stringify(data);
    }
    throw new Error(errorMessage);
  }
};

/** Edits an existing department. */
export const editDepartment = async (id: number, updatedDept: any) => {
  try {
    return await apiClient.put(`/users/departments/${id}/`, updatedDept);
  } catch (err: any) {
    console.error("Error updating department:", err);
    let errorMessage = "Failed to update department.";
    if (err.response?.data) {
       const data = err.response.data;
       if (data.name && Array.isArray(data.name)) errorMessage = data.name[0];
       else if (data.detail) errorMessage = data.detail;
       else if (typeof data === 'string') errorMessage = data;
       else errorMessage = JSON.stringify(data);
    }
    throw new Error(errorMessage);
  }
};

/** Deletes a department by ID. */
export const deleteDepartment = async (id: number) => {
  try {
    return await apiClient.delete(`/users/departments/${id}/`);
  } catch (err) {
    console.error("Error deleting department:", err);
    throw new Error("Failed to delete department.");
  }
};

// -------------------- CRUD Handlers - Users --------------------

/** Adds a new institutional user. */
export const addUser = async (newUserPayload: any) => {
  try {
    const response = await apiClient.post("/users/users/", newUserPayload);
    return response.data;
  } catch (err: any) {
    console.error("Error adding user:", err);
    let errorMessage = "Failed to add user.";
    if (err.response?.data) {
       const data = err.response.data;
       if (data.email && Array.isArray(data.email)) errorMessage = data.email[0];
       else if (data.username && Array.isArray(data.username)) errorMessage = data.username[0];
       else if (data.detail) errorMessage = data.detail;
       else if (typeof data === 'string') errorMessage = data;
       else errorMessage = JSON.stringify(data);
    }
    throw new Error(errorMessage);
  }
};

/** Edits an existing institutional user. */
export const editUser = async (id: number, updatedUserPayload: any) => {
  try {
    const response = await apiClient.put(`/users/users/${id}/`, updatedUserPayload);
    return response.data;
  } catch (err: any) {
    console.error("Error updating user:", err);
    let errorMessage = "Failed to update user.";
    if (err.response?.data) {
       const data = err.response.data;
       if (data.email && Array.isArray(data.email)) errorMessage = data.email[0];
       else if (data.username && Array.isArray(data.username)) errorMessage = data.username[0];
       else if (data.detail) errorMessage = data.detail;
       else if (typeof data === 'string') errorMessage = data;
       else errorMessage = JSON.stringify(data);
    }
    throw new Error(errorMessage);
  }
};

/** Deletes an institutional user by ID. */
export const deleteUser = async (id: number) => {
  try {
    return await apiClient.delete(`/users/users/${id}/`);
  } catch (err) {
    console.error("Error deleting user:", err);
    throw new Error("Failed to delete user.");
  }
};
