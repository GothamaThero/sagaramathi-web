import type { IUser, ICreateUserInput, IUpdateUserInput } from "../types/user";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getAuthHeaders = (overrideToken?: string | null) => {
  const token = overrideToken || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === "AbortError") {
      throw new Error("Server request timed out. Please verify backend server is running.", { cause: err });
    }
    throw new Error("Cannot connect to backend server. Please check backend connection.", { cause: err });
  }
};

export async function fetchUsers(overrideToken?: string | null): Promise<IUser[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(overrideToken),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch users");
  }
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
}

export async function createUser(data: ICreateUserInput, overrideToken?: string | null): Promise<IUser> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(overrideToken),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create user");
  }
  return result.data || result;
}

export async function updateUser(id: number, data: IUpdateUserInput, overrideToken?: string | null): Promise<IUser> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(overrideToken),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update user");
  }
  return result.data || result;
}

export async function deleteUser(id: number, overrideToken?: string | null): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(overrideToken),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete user");
  }
}


