<template>
  <q-page padding>
    <div class="text-h5 q-mb-sm">Painel</div>
    <div class="text-body1 text-grey-8">
      Bem-vindo{{ auth.user?.name ? `, ${auth.user.name}` : "" }}. Use o menu
      para gerenciar usuários.
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>
