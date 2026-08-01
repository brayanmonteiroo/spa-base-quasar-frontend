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
        meta: { permission: Permission.DashboardView }
      },
      {
        path: "users",
        name: "admin-users",
        component: () => import("@/pages/admin/users/UsersIndexPage.vue"),
        meta: { permission: Permission.UsersView }
      },
      {
        path: "users/create",
        name: "admin-users-create",
        component: () => import("@/pages/admin/users/UserCreatePage.vue"),
        meta: { permission: Permission.UsersCreate }
      },
      {
        path: "users/:id",
        name: "admin-users-show",
        component: () => import("@/pages/admin/users/UserShowPage.vue"),
        meta: { permission: Permission.UsersShow }
      },
      {
        path: "users/:id/edit",
        name: "admin-users-edit",
        component: () => import("@/pages/admin/users/UserEditPage.vue"),
        meta: { permission: Permission.UsersUpdate }
      },
      {
        path: "roles",
        name: "admin-roles",
        component: () => import("@/pages/admin/roles/RolesIndexPage.vue"),
        meta: { permission: Permission.RolesView }
      },
      {
        path: "roles/create",
        name: "admin-roles-create",
        component: () => import("@/pages/admin/roles/RoleCreatePage.vue"),
        meta: { permission: Permission.RolesCreate }
      },
      {
        path: "roles/:id",
        name: "admin-roles-show",
        component: () => import("@/pages/admin/roles/RoleShowPage.vue"),
        meta: { permission: Permission.RolesShow }
      },
      {
        path: "roles/:id/edit",
        name: "admin-roles-edit",
        component: () => import("@/pages/admin/roles/RoleEditPage.vue"),
        meta: { permission: Permission.RolesUpdate }
      }
    ]
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/pages/ErrorNotFound.vue")
  }
];

export default routes;
