import type { IUser, ICreateUserInput, IUpdateUserInput } from "../types/user";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function fetchUsers(): Promise<IUser[]> {
  const response = await fetch(`${API_BASE_URL}/users`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch users");
  }
  return result.data;
}

export async function createUser(data: ICreateUserInput): Promise<IUser> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create user");
  }
  return result.data;
}

export async function updateUser(id: number, data: IUpdateUserInput): Promise<IUser> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update user");
  }
  return result.data;
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete user");
  }
}
