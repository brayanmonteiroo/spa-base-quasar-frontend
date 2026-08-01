import { api } from "@/boot/axios";
import type { AuthUser } from "@/stores/auth";

export interface PaginatedUsers {
  data: AuthUser[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  roles: string[];
}

export async function fetchUsers(
  page = 1,
  perPage = 10
): Promise<PaginatedUsers> {
  const { data } = await api.get<PaginatedUsers>("/api/admin/users", {
    params: { page, per_page: perPage }
  });
  return data;
}

export async function fetchUser(id: number): Promise<AuthUser> {
  const { data } = await api.get<{ data: AuthUser }>(`/api/admin/users/${id}`);
  return data.data;
}

export async function createUser(payload: UserPayload): Promise<AuthUser> {
  const { data } = await api.post<{ data: AuthUser }>(
    "/api/admin/users",
    payload
  );
  return data.data;
}

export async function updateUser(
  id: number,
  payload: UserPayload
): Promise<AuthUser> {
  const { data } = await api.put<{ data: AuthUser }>(
    `/api/admin/users/${id}`,
    payload
  );
  return data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/admin/users/${id}`);
}
