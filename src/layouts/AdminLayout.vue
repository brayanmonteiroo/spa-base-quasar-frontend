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

        <q-btn
          flat
          round
          dense
          :icon="darkIcon"
          :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
          @click="toggleDark"
        />

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
        <template v-for="section in visibleSections" :key="section.label">
          <q-item-label header>{{ section.label }}</q-item-label>

          <q-item
            v-for="link in section.items"
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
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify, useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { useDarkMode } from "@/composables/useDarkMode";
import { Permission } from "@/constants/permissions";
import { getApiErrorMessage } from "@/utils/api-error";

interface NavLink {
  label: string;
  icon: string;
  to: { name: string };
  permission: Permission;
}

interface NavSection {
  label: string;
  items: NavLink[];
}

const auth = useAuthStore();
const { isDark, icon: darkIcon, toggle: toggleDark } = useDarkMode();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const leftDrawerOpen = ref(false);

const navSections: NavSection[] = [
  {
    label: "Menu",
    items: [
      {
        label: "Painel",
        icon: "dashboard",
        to: { name: "admin-dashboard" },
        permission: Permission.DashboardSidebar
      }
    ]
  },
  {
    label: "Configurações",
    items: [
      {
        label: "Usuários",
        icon: "people",
        to: { name: "admin-users" },
        permission: Permission.UsersSidebar
      },
      {
        label: "Perfis",
        icon: "badge",
        to: { name: "admin-roles" },
        permission: Permission.RolesSidebar
      },
      {
        label: "Auditoria",
        icon: "history",
        to: { name: "admin-audits" },
        permission: Permission.AuditSidebar
      }
    ]
  }
];

const visibleSections = computed(() =>
  navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => auth.can(item.permission))
    }))
    .filter(section => section.items.length > 0)
);

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
