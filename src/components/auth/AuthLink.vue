<template>
  <router-link class="auth-link" :to="to">
    <q-icon :name="icon" size="18px" />
    <span>{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

export interface AuthLinkProps {
  to: RouteLocationRaw;
  label: string;
  icon: string;
}

defineProps<AuthLinkProps>();
</script>

<style lang="scss" scoped>
.auth-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.2;
  text-decoration: none;
  color: #0b1f33;
  transition:
    color 0.15s ease,
    opacity 0.15s ease;

  &:hover {
    color: $primary;
  }
}

body.body--dark .auth-link {
  color: $dark-text-muted;

  &:hover {
    color: $dark-primary;
  }
}
</style>
