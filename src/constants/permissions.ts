export const Permission = {
  DashboardSidebar: "dashboard.sidebar",
  DashboardView: "dashboard.view",
  UsersSidebar: "users.sidebar",
  UsersView: "users.view",
  UsersShow: "users.show",
  UsersCreate: "users.create",
  UsersUpdate: "users.update",
  UsersDelete: "users.delete",
  RolesSidebar: "roles.sidebar",
  RolesView: "roles.view",
  RolesShow: "roles.show",
  RolesCreate: "roles.create",
  RolesUpdate: "roles.update",
  RolesDelete: "roles.delete",
  AuditSidebar: "audit.sidebar",
  AuditView: "audit.view"
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
