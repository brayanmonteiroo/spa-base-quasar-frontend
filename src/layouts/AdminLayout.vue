<template>
  <q-layout view="lHh Lpr lFf" class="admin-shell">
    <q-header :elevated="!isDark" class="admin-shell__chrome text-white">
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

        <q-btn
          flat
          dense
          no-caps
          class="q-px-sm"
          :aria-label="accountAriaLabel"
        >
          <div class="row items-center no-wrap">
            <q-avatar
              color="primary"
              text-color="white"
              size="32px"
              font-size="14px"
            >
              {{ initials }}
            </q-avatar>
            <span class="q-ml-sm gt-xs ellipsis admin-shell__account-name">{{
              auth.user?.name
            }}</span>
            <q-icon name="arrow_drop_down" size="20px" class="q-ml-xs" />
          </div>
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
      class="admin-shell__chrome admin-shell__drawer"
    >
      <q-list padding>
        <template v-for="section in visibleSections" :key="section.label">
          <q-item-label header class="admin-shell__section-label">
            {{ section.label }}
          </q-item-label>

          <q-item
            v-for="link in section.items"
            :key="link.label"
            clickable
            v-ripple
            :to="link.to"
            exact
            class="admin-shell__nav-item"
            active-class="admin-shell__nav-item--active"
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
      <div class="admin-shell__page-top">
        <AppBreadcrumbs />
      </div>
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
import { userInitials } from "@/utils/user-initials";
import AppBreadcrumbs from "@/components/navigation/AppBreadcrumbs.vue";

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

const initials = computed(() => userInitials(auth.user?.name));
const accountAriaLabel = computed(() =>
  auth.user?.name ? `Conta de ${auth.user.name}` : "Conta"
);

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

<style lang="scss">
// Chrome = estrutura (header/sidebar). Primary = destaque (CTAs).
// Light: navy alto contraste (mantém o visual que já funciona).
// Dark: azul-acinzentado neutro, sem saturação gritante.
.admin-shell {
  --admin-chrome: #0b1f33;
  --admin-chrome-text: rgba(255, 255, 255, 0.92);
  --admin-chrome-muted: rgba(255, 255, 255, 0.58);
  --admin-chrome-hover: rgba(255, 255, 255, 0.1);
  --admin-nav-active-bg: #ffffff;
  --admin-nav-active-text: #0b1f33;
  --admin-nav-active-accent: #{$primary};
  --admin-drawer-border: rgba(255, 255, 255, 0.12);
}

body.body--dark .admin-shell {
  --admin-chrome: #{$dark-chrome};
  --admin-chrome-text: #{$dark-text};
  --admin-chrome-muted: #{$dark-text-muted};
  --admin-chrome-hover: rgba(255, 255, 255, 0.06);
  --admin-nav-active-bg: #{$dark-chrome-hover};
  --admin-nav-active-text: #ffffff;
  --admin-nav-active-accent: #{$dark-primary};
  --admin-drawer-border: #{$dark-border};
}

.admin-shell__chrome {
  background: var(--admin-chrome);
  color: var(--admin-chrome-text);
}

// A “luz” não é box-shadow do header — o Quasar injeta .q-layout__shadow.
// No dark o elevated já fica off (:elevated="!isDark"); isso é rede de segurança.
body.body--dark .admin-shell .q-header .q-layout__shadow {
  display: none;
}

.admin-shell__drawer {
  background: var(--admin-chrome) !important;
  border-color: var(--admin-drawer-border) !important;

  .q-drawer__content {
    background: var(--admin-chrome);
    color: var(--admin-chrome-text);
  }
}

.admin-shell__section-label {
  color: var(--admin-chrome-muted) !important;
}

.admin-shell__nav-item {
  color: var(--admin-chrome-text);
  border-radius: 8px;
  margin: 2px 8px;

  .q-icon {
    color: var(--admin-chrome-text);
  }

  &:hover {
    background: var(--admin-chrome-hover);
  }
}

.admin-shell__nav-item--active {
  position: relative;
  background: var(--admin-nav-active-bg) !important;
  color: var(--admin-nav-active-text) !important;

  .q-icon {
    color: var(--admin-nav-active-text) !important;
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--admin-nav-active-accent);
  }
}

// Breadcrumbs: logo abaixo do header, alinhado ao padding da página
.admin-shell__page-top {
  padding: 16px 32px 0;
}

.admin-shell__account-name {
  max-width: 12rem;
}

@media (max-width: 599px) {
  .admin-shell__page-top {
    padding: 12px 16px 0;
  }
}
</style>
