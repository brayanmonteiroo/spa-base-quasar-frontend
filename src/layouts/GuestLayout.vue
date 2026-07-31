<template>
  <q-layout view="hHh lpR fFf">
    <q-btn
      class="guest-dark-toggle"
      flat
      round
      dense
      :icon="icon"
      :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
      @click="toggle"
    />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useDarkMode } from "@/composables/useDarkMode";

const { isDark, icon, toggle } = useDarkMode();
</script>

<style scoped>
.guest-dark-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}
</style>
