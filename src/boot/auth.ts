import { defineBoot } from "#q-app";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/boot/axios";
import { Permission } from "@/constants/permissions";

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

    return { name: "login" };
  }

  router.beforeEach(async to => {
    if (!auth.isBootstrapped) {
      await auth.fetchUser();
    }

    const isGuestRoute = to.matched.some(record => record.meta.guest === true);
    const isAdminRoute = to.path.startsWith("/admin");

    if (isGuestRoute && auth.isAuthenticated) {
      return firstAllowedAdminRoute();
    }

    if (isAdminRoute && !auth.isAuthenticated) {
      return { name: "login", query: { redirect: to.fullPath } };
    }

    const requiredPermission = to.matched
      .map(record => record.meta.permission)
      .filter((value): value is string => typeof value === "string")
      .at(-1);

    if (
      auth.isAuthenticated &&
      requiredPermission !== undefined &&
      !auth.can(requiredPermission)
    ) {
      const fallback = firstAllowedAdminRoute();

      if (fallback.name === to.name) {
        return { name: "login" };
      }

      return fallback;
    }

    return true;
  });
});
