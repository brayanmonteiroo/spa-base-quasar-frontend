import { defineBoot } from "#q-app";
import { Notify } from "quasar";
import type { RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/boot/axios";
import { Permission } from "@/constants/permissions";

const FORBIDDEN_PAGE_MESSAGE =
  "Você não tem permissão para acessar esta página.";

export default defineBoot(({ router }) => {
  const auth = useAuthStore();

  api.interceptors.response.use(
    response => response,
    error => {
      const status = error.response?.status as number | undefined;

      if (status === 401 || status === 419) {
        auth.clearUser();

        if (router.currentRoute.value.path.startsWith("/admin")) {
          void router.replace({ name: "login" });
        }
      }

      return Promise.reject(error);
    }
  );

  function routePermission(route: RouteLocationNormalized): string | undefined {
    return route.matched
      .map(record => record.meta.permission)
      .filter((value): value is string => typeof value === "string")
      .at(-1);
  }

  function canAccessRoute(route: RouteLocationNormalized): boolean {
    const permission = routePermission(route);
    return permission === undefined || auth.can(permission);
  }

  function firstAllowedAdminRoute(): { name: string } {
    if (auth.can(Permission.DashboardView)) {
      return { name: "admin-dashboard" };
    }

    if (auth.can(Permission.UsersView)) {
      return { name: "admin-users" };
    }

    if (auth.can(Permission.RolesView)) {
      return { name: "admin-roles" };
    }

    if (auth.can(Permission.AuditView)) {
      return { name: "admin-audits" };
    }

    return { name: "login" };
  }

  function notifyForbiddenPage(): void {
    Notify.create({
      type: "warning",
      icon: "lock",
      message: FORBIDDEN_PAGE_MESSAGE,
      timeout: 3500,
      position: "bottom"
    });
  }

  router.beforeEach(async (to, from) => {
    const isGuestRoute = to.matched.some(record => record.meta.guest === true);
    const isAdminRoute = to.path.startsWith("/admin");

    // Semelhante ao Inertia: atualiza a autenticação (papéis/permissões) na inicialização e
    // a cada navegação administrativa, para que a interface seja atualizada sem necessidade de F5.
    if (!auth.isBootstrapped) {
      await auth.fetchUser();
    } else if (auth.isAuthenticated && isAdminRoute) {
      await auth.fetchUser();
    }

    if (isGuestRoute && auth.isAuthenticated) {
      return firstAllowedAdminRoute();
    }

    if (isAdminRoute && !auth.isAuthenticated) {
      return { name: "login", query: { redirect: to.fullPath } };
    }

    const requiredPermission = routePermission(to);

    if (
      auth.isAuthenticated &&
      requiredPermission !== undefined &&
      !auth.can(requiredPermission)
    ) {
      notifyForbiddenPage();

      // Já está em tela permitida (ex.: menu com sidebar sem .view) → só avisa
      if (
        from.name != null &&
        from.path.startsWith("/admin") &&
        canAccessRoute(from)
      ) {
        return false;
      }

      const fallback = firstAllowedAdminRoute();

      if (fallback.name === to.name) {
        return { name: "login" };
      }

      return fallback;
    }

    return true;
  });
});
