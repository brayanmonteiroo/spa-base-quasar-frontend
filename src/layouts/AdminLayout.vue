<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title shrink class="ellipsis">
          SPA Base Admin
        </q-toolbar-title>

        <q-space />

        <q-btn flat round dense icon="account_circle" aria-label="Conta">
          <q-menu>
            <q-list style="min-width: 180px; max-width: 90vw">
              <q-item>
                <q-item-section>
                  <q-item-label class="ellipsis">{{
                    auth.user?.name
                  }}</q-item-label>
                  <q-item-label caption class="ellipsis">{{
                    auth.user?.email
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item v-close-popup clickable @click="onLogout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Sair</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :breakpoint="1023"
      :width="260"
    >
      <q-list padding>
        <q-item-label header>Menu</q-item-label>

        <q-item
          v-for="link in links"
          :key="link.label"
          clickable
          v-ripple
          :to="link.to"
          exact
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify, useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const leftDrawerOpen = ref(false);

const links = [
  { label: "Painel", icon: "dashboard", to: { name: "admin-dashboard" } },
  { label: "Usuários", icon: "people", to: { name: "admin-users" } }
] as const;

watch(
  () => route.fullPath,
  () => {
    if ($q.screen.lt.md) {
      leftDrawerOpen.value = false;
    }
  }
);

function toggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function onLogout(): Promise<void> {
  try {
    await auth.logout();
    await router.replace({ name: "login" });
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Não foi possível encerrar a sessão.")
    });
  }
}
</script>
