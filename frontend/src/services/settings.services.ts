import apiClient from "./api";

// -------------------- Fetch Data --------------------

/** Fetches all defined roles. */
export const fetchRoles = async () => {
  try {
    const response = await apiClient.get("/users/roles/");
    return response.data;
  } catch (err) {
    console.error("Error fetching roles:", err);
    // Returning an empty array on failure allows the component to still render without crashing
    return []; 
  }
};

/** Fetches all defined departments. */
export const fetchDepartments = async () => {
  try {
    const response = await apiClient.get("/users/departments/");
    console.log(response);
    
    return response.data;
  } catch (err) {
    console.error("Error fetching departments:", err);
    return [];
  }
};

/** Fetches all system users. */
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
export const addRole = async (newRole) => {
  try {
    return await apiClient.post("/roles/", newRole);
  } catch (err) {
    console.error("Error adding role:", err);
    throw new Error("Failed to add role.");
  }
};

/** Edits an existing role. */
export const editRole = async (id, updatedRole) => {
  try {
    return await apiClient.put(`/roles/${id}/`, updatedRole);
  } catch (err) {
    console.error("Error updating role:", err);
    throw new Error("Failed to update role.");
  }
};

/** Deletes a role by ID. */
export const deleteRole = async (id) => {
  try {
    return await apiClient.delete(`/roles/${id}/`);
  } catch (err) {
    console.error("Error deleting role:", err);
    throw new Error("Failed to delete role.");
  }
};

// -------------------- CRUD Handlers - Departments --------------------

/** Adds a new department. */
export const addDepartment = async (newDept) => {
  try {
    return await apiClient.post("/users/departments/", newDept);
  } catch (err) {
    console.error("Error adding department:", err);
    throw new Error("Failed to add department.");
  }
};

/** Edits an existing department. */
export const editDepartment = async (id, updatedDept) => {
  try {
    return await apiClient.put(`/users/departments/${id}/`, updatedDept);
  } catch (err) {
    console.error("Error updating department:", err);
    throw new Error("Failed to update department.");
  }
};

/** Deletes a department by ID. */
export const deleteDepartment = async (id, force = false) => {
  try {
    const url = `/users/departments/${id}/${force ? "?force=true" : ""}`;
    return await apiClient.delete(url);
  } catch (err: any) {
    console.error("Error deleting department:", err);
    throw err;
  }
};

// -------------------- CRUD Handlers - Users --------------------

/** Adds a new user. */
export const addUser = async (newUserPayload) => {
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

/** Edits an existing user. */
export const editUser = async (id, updatedUserPayload) => {
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

/** Deletes a user by ID. (Provided in prompt, keeping for completeness) */
export const deleteUser = async (id, force = false) => {
  try {
    const url = `/users/users/${id}/${force ? "?force=true" : ""}`;
    return await apiClient.delete(url);
  } catch (err: any) {
    console.error("Error deleting user:", err);
    throw err;
  }
};