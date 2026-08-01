import { api } from "@/boot/axios";

export interface DashboardStats {
  users: number;
  roles: number;
  permissions: number;
  audits_today: number;
}

interface DashboardStatsResponse {
  data: DashboardStats;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStatsResponse>(
    "/api/admin/dashboard/stats"
  );

  return data.data;
}
