import { api } from "@/boot/axios";
import type { AuthUser } from "@/stores/auth";
import type { TableListParams } from "@/types/table";

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

export interface FetchUsersParams extends TableListParams {
  q?: string;
  role?: string;
}

export async function fetchUsers(
  params: FetchUsersParams = {}
): Promise<PaginatedUsers> {
  const { data } = await api.get<PaginatedUsers>("/api/admin/users", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      sort: params.sort,
      direction: params.direction,
      q: params.q || undefined,
      role: params.role || undefined
    }
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
