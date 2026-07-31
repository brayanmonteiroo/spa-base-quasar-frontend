import { defineBoot } from "#q-app";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/boot/axios";

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

  router.beforeEach(async to => {
    if (!auth.isBootstrapped) {
      await auth.fetchUser();
    }

    const isGuestRoute = to.matched.some(record => record.meta.guest === true);
    const isAdminRoute = to.path.startsWith("/admin");

    if (isGuestRoute && auth.isAuthenticated) {
      return { name: "admin-dashboard" };
    }

    if (isAdminRoute && !auth.isAuthenticated) {
      return { name: "login", query: { redirect: to.fullPath } };
    }

    return true;
  });
});
