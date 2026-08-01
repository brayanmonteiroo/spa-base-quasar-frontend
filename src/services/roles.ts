import { api } from "@/boot/axios";
import type { PermissionCatalogSection } from "@/constants/permission-catalog";

export interface Role {
  id: number;
  name: string;
  label: string;
  guard_name: string;
  permissions: string[];
  users_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginatedRoles {
  data: Role[];
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

export interface RolePayload {
  name: string;
  permissions: string[];
}

export async function fetchRoles(
  page = 1,
  perPage = 10
): Promise<PaginatedRoles> {
  const { data } = await api.get<PaginatedRoles>("/api/admin/roles", {
    params: { page, per_page: perPage }
  });
  return data;
}

export async function fetchRole(id: number): Promise<Role> {
  const { data } = await api.get<{ data: Role }>(`/api/admin/roles/${id}`);
  return data.data;
}

export async function createRole(payload: RolePayload): Promise<Role> {
  const { data } = await api.post<{ data: Role }>("/api/admin/roles", payload);
  return data.data;
}

export async function updateRole(
  id: number,
  payload: RolePayload
): Promise<Role> {
  const { data } = await api.put<{ data: Role }>(
    `/api/admin/roles/${id}`,
    payload
  );
  return data.data;
}

export async function deleteRole(id: number): Promise<void> {
  await api.delete(`/api/admin/roles/${id}`);
}

export async function fetchPermissionCatalog(): Promise<
  PermissionCatalogSection[]
> {
  const { data } = await api.get<{ data: PermissionCatalogSection[] }>(
    "/api/admin/permissions/catalog"
  );
  return data.data;
}
