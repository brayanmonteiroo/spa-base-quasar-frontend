import { api } from "@/boot/axios";
import type { TableListParams } from "@/types/table";

export interface AuditUser {
  id: number;
  name: string;
  email: string;
}

/** Lightweight audit row from index. */
export interface AuditEntry {
  id: number;
  event: string;
  event_label: string;
  auditable_type: string;
  auditable_label: string;
  auditable_id: number | string;
  user: AuditUser | null;
  ip_address: string | null;
  created_at: string | null;
}

/** Full audit payload from show. */
export interface AuditDetail extends AuditEntry {
  url: string | null;
  user_agent: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
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

export interface FetchAuditsParams extends TableListParams {
  event?: string;
  user_id?: number | null;
  from?: string;
  to?: string;
}

export async function fetchAudits(
  params: FetchAuditsParams = {}
): Promise<PaginatedAudits> {
  const { data } = await api.get<PaginatedAudits>("/api/admin/audits", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      sort: params.sort,
      direction: params.direction,
      event: params.event || undefined,
      user_id: params.user_id || undefined,
      from: params.from || undefined,
      to: params.to || undefined
    }
  });
  return data;
}

export async function fetchAudit(id: number): Promise<AuditDetail> {
  const { data } = await api.get<{ data: AuditDetail }>(
    `/api/admin/audits/${id}`
  );
  return data.data;
}
