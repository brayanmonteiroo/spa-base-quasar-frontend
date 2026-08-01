import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { api } from "@/boot/axios";
import type { Permission } from "@/constants/permissions";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
  permissions: string[];
}

interface UserResponse {
  data: AuthUser;
}

interface LoginResponse {
  user: AuthUser;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const isBootstrapped = ref(false);

  const isAuthenticated = computed(() => user.value !== null);

  function can(permission: Permission | string): boolean {
    return user.value?.permissions.includes(permission) ?? false;
  }

  async function ensureCsrf(): Promise<void> {
    await api.get("/sanctum/csrf-cookie");
  }

  async function fetchUser(): Promise<AuthUser | null> {
    try {
      const { data } = await api.get<UserResponse>("/api/user");
      user.value = data.data;
      return user.value;
    } catch {
      user.value = null;
      return null;
    } finally {
      isBootstrapped.value = true;
    }
  }

  async function login(
    email: string,
    password: string,
    remember = false
  ): Promise<AuthUser> {
    await ensureCsrf();

    const { data } = await api.post<LoginResponse>("/api/login", {
      email,
      password,
      remember
    });

    user.value = data.user;
    isBootstrapped.value = true;

    return data.user;
  }

  async function logout(): Promise<void> {
    try {
      await ensureCsrf();
      await api.post("/api/logout");
    } finally {
      user.value = null;
    }
  }

  async function forgotPassword(email: string): Promise<string> {
    await ensureCsrf();
    const { data } = await api.post<{ message: string }>(
      "/api/forgot-password",
      { email }
    );
    return data.message;
  }

  async function resetPassword(payload: {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
  }): Promise<string> {
    await ensureCsrf();
    const { data } = await api.post<{ message: string }>(
      "/api/reset-password",
      payload
    );
    return data.message;
  }

  function clearUser(): void {
    user.value = null;
  }

  return {
    user,
    isBootstrapped,
    isAuthenticated,
    can,
    ensureCsrf,
    fetchUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
    clearUser
  };
});
