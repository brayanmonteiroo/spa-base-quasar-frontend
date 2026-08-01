import { Permission } from "@/constants/permissions";

export interface PermissionCatalogItem {
  name: string;
  label: string;
}

export interface PermissionCatalogGroup {
  key: string;
  label: string;
  permissions: PermissionCatalogItem[];
}

/** Mirrors backend PermissionCatalog order (sidebar order). Append modules at the end. */
export const permissionCatalog: PermissionCatalogGroup[] = [
  {
    key: "dashboard",
    label: "Painel",
    permissions: [
      { name: Permission.DashboardSidebar, label: "Menu" },
      { name: Permission.DashboardView, label: "Visualizar" }
    ]
  },
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
  }
];
