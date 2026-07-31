import type { RouteRecordRaw } from "vue-router";

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
        component: () => import("@/pages/admin/DashboardPage.vue")
      },
      {
        path: "users",
        name: "admin-users",
        component: () => import("@/pages/admin/users/UsersIndexPage.vue")
      },
      {
        path: "users/create",
        name: "admin-users-create",
        component: () => import("@/pages/admin/users/UserCreatePage.vue")
      },
      {
        path: "users/:id/edit",
        name: "admin-users-edit",
        component: () => import("@/pages/admin/users/UserEditPage.vue")
      }
    ]
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/pages/ErrorNotFound.vue")
  }
];

export default routes;
