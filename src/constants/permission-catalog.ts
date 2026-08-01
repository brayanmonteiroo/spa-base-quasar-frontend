import { Permission } from "@/constants/permissions";

export interface PermissionCatalogItem {
  name: string;
  label: string;
}

export interface PermissionCatalogModule {
  key: string;
  label: string;
  permissions: PermissionCatalogItem[];
}

export interface PermissionCatalogSection {
  key: string;
  label: string;
  modules: PermissionCatalogModule[];
}

/** @deprecated Prefer PermissionCatalogModule */
export type PermissionCatalogGroup = PermissionCatalogModule;

/** Mirrors backend PermissionCatalog::sections() order (sidebar order). */
export const permissionCatalogSections: PermissionCatalogSection[] = [
  {
    key: "menu",
    label: "Menu",
    modules: [
      {
        key: "dashboard",
        label: "Painel",
        permissions: [
          { name: Permission.DashboardSidebar, label: "Menu" },
          { name: Permission.DashboardView, label: "Visualizar" }
        ]
      }
    ]
  },
  {
    key: "settings",
    label: "Configurações",
    modules: [
      {
        key: "users",
        label: "Usuários",
        permissions: [
          { name: Permission.UsersSidebar, label: "Menu" },
          { name: Permission.UsersView, label: "Listar" },
          { name: Permission.UsersShow, label: "Visualizar" },
          { name: Permission.UsersCreate, label: "Cadastrar" },
          { name: Permission.UsersUpdate, label: "Editar" },
          { name: Permission.UsersDelete, label: "Excluir" }
        ]
      },
      {
        key: "roles",
        label: "Perfis",
        permissions: [
          { name: Permission.RolesSidebar, label: "Menu" },
          { name: Permission.RolesView, label: "Listar" },
          { name: Permission.RolesShow, label: "Visualizar" },
          { name: Permission.RolesCreate, label: "Cadastrar" },
          { name: Permission.RolesUpdate, label: "Editar" },
          { name: Permission.RolesDelete, label: "Excluir" }
        ]
      },
      {
        key: "audit",
        label: "Auditoria",
        permissions: [
          { name: Permission.AuditSidebar, label: "Menu" },
          { name: Permission.AuditView, label: "Listar" }
        ]
      }
    ]
  }
];

/** Flat modules for legacy callers. */
export const permissionCatalog: PermissionCatalogModule[] =
  permissionCatalogSections.flatMap(section => section.modules);
