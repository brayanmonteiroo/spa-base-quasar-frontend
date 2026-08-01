import { api } from "@/boot/axios";

export interface AuditUser {
  id: number;
  name: string;
  email: string;
}

export interface AuditEntry {
  id: number;
  event: string;
  event_label: string;
  auditable_type: string;
  auditable_label: string;
  auditable_id: number | string;
  user: AuditUser | null;
  ip_address: string | null;
  url: string | null;
  user_agent: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string | null;
}

export interface PaginatedAudits {
  data: AuditEntry[];
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

export async function fetchAudits(
  page = 1,
  perPage = 10
): Promise<PaginatedAudits> {
  const { data } = await api.get<PaginatedAudits>("/api/admin/audits", {
    params: { page, per_page: perPage }
  });
  return data;
}
