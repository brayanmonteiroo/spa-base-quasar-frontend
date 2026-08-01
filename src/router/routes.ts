import type { RouteRecordRaw } from "vue-router";
import { Permission } from "@/constants/permissions";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/GuestLayout.vue"),
    meta: { guest: true },
    children: [
      {
        path: "",
        name: "login",
        component: () => import("@/pages/auth/LoginPage.vue")
      },
      {
        path: "forgot-password",
        name: "forgot-password",
        component: () => import("@/pages/auth/ForgotPasswordPage.vue")
      },
      {
        path: "reset-password",
        name: "reset-password",
        component: () => import("@/pages/auth/ResetPasswordPage.vue")
      }
    ]
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: { name: "admin-dashboard" }
      },
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("@/pages/admin/DashboardPage.vue"),
        meta: {
          permission: Permission.DashboardView,
          breadcrumb: { label: "Painel" }
        }
      },
      {
        path: "users",
        name: "admin-users",
        component: () => import("@/pages/admin/users/UsersIndexPage.vue"),
        meta: {
          permission: Permission.UsersView,
          breadcrumb: { label: "Usuários" }
        }
      },
      {
        path: "users/create",
        name: "admin-users-create",
        component: () => import("@/pages/admin/users/UserCreatePage.vue"),
        meta: {
          permission: Permission.UsersCreate,
          breadcrumb: { label: "Novo", parent: "admin-users" }
        }
      },
      {
        path: "users/:id",
        name: "admin-users-show",
        component: () => import("@/pages/admin/users/UserShowPage.vue"),
        meta: {
          permission: Permission.UsersShow,
          breadcrumb: {
            label: route => `Usuário #${String(route.params.id)}`,
            parent: "admin-users"
          }
        }
      },
      {
        path: "users/:id/edit",
        name: "admin-users-edit",
        component: () => import("@/pages/admin/users/UserEditPage.vue"),
        meta: {
          permission: Permission.UsersUpdate,
          breadcrumb: { label: "Editar", parent: "admin-users" }
        }
      },
      {
        path: "roles",
        name: "admin-roles",
        component: () => import("@/pages/admin/roles/RolesIndexPage.vue"),
        meta: {
          permission: Permission.RolesView,
          breadcrumb: { label: "Perfis" }
        }
      },
      {
        path: "roles/create",
        name: "admin-roles-create",
        component: () => import("@/pages/admin/roles/RoleCreatePage.vue"),
        meta: {
          permission: Permission.RolesCreate,
          breadcrumb: { label: "Novo", parent: "admin-roles" }
        }
      },
      {
        path: "roles/:id",
        name: "admin-roles-show",
        component: () => import("@/pages/admin/roles/RoleShowPage.vue"),
        meta: {
          permission: Permission.RolesShow,
          breadcrumb: {
            label: route => `Perfil #${String(route.params.id)}`,
            parent: "admin-roles"
          }
        }
      },
      {
        path: "roles/:id/edit",
        name: "admin-roles-edit",
        component: () => import("@/pages/admin/roles/RoleEditPage.vue"),
        meta: {
          permission: Permission.RolesUpdate,
          breadcrumb: { label: "Editar", parent: "admin-roles" }
        }
      },
      {
        path: "audits",
        name: "admin-audits",
        component: () => import("@/pages/admin/audits/AuditsIndexPage.vue"),
        meta: {
          permission: Permission.AuditView,
          breadcrumb: { label: "Auditoria" }
        }
      }
    ]
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/pages/ErrorNotFound.vue")
  }
];

export default routes;
