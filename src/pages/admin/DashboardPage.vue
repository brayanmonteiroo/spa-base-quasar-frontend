<template>
  <q-page padding>
    <div
      v-if="!auth.can(Permission.DashboardCards)"
      class="text-body2 text-grey-7"
    >
      Você não tem permissão para ver os cards do painel.
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="card in cards"
        :key="card.key"
        class="col-12 col-sm-6 col-md-3"
      >
        <q-card
          flat
          bordered
          class="dashboard-card cursor-pointer"
          role="link"
          tabindex="0"
          @click="onCardClick(card)"
          @keyup.enter="onCardClick(card)"
        >
          <q-card-section class="row items-center no-wrap">
            <q-avatar
              rounded
              size="48px"
              :color="card.color"
              text-color="white"
              :icon="card.icon"
            />
            <div class="q-ml-md ellipsis">
              <div class="text-caption text-grey-7">{{ card.label }}</div>
              <div class="text-h5 text-weight-medium">
                {{ isLoading ? "…" : card.value }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, type RouteLocationRaw } from "vue-router";
import { Notify } from "quasar";
import { Permission } from "@/constants/permissions";
import { fetchDashboardStats, type DashboardStats } from "@/services/dashboard";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";

interface DashboardCard {
  key: keyof DashboardStats;
  label: string;
  icon: string;
  color: string;
  value: number;
  permission: Permission;
  forbiddenMessage: string;
  to: RouteLocationRaw;
}

const auth = useAuthStore();
const router = useRouter();
const isLoading = ref(false);
const stats = ref<DashboardStats>({
  users: 0,
  roles: 0,
  permissions: 0,
  audits_today: 0
});

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const cards = computed((): DashboardCard[] => {
  const today = todayIsoDate();

  return [
    {
      key: "users",
      label: "Usuários",
      icon: "people",
      color: "primary",
      value: stats.value.users,
      permission: Permission.UsersView,
      forbiddenMessage: "Você não tem permissão para ver os usuários.",
      to: { name: "admin-users" }
    },
    {
      key: "roles",
      label: "Perfis",
      icon: "badge",
      color: "primary",
      value: stats.value.roles,
      permission: Permission.RolesView,
      forbiddenMessage: "Você não tem permissão para ver os perfis.",
      to: { name: "admin-roles" }
    },
    {
      key: "permissions",
      label: "Permissões",
      icon: "key",
      color: "primary",
      value: stats.value.permissions,
      permission: Permission.RolesView,
      forbiddenMessage: "Você não tem permissão para ver as permissões.",
      to: { name: "admin-roles" }
    },
    {
      key: "audits_today",
      label: "Auditorias do dia",
      icon: "history",
      color: "primary",
      value: stats.value.audits_today,
      permission: Permission.AuditView,
      forbiddenMessage: "Você não tem permissão para ver a auditoria.",
      to: {
        name: "admin-audits",
        query: { from: today, to: today }
      }
    }
  ];
});

function onCardClick(card: DashboardCard): void {
  if (!auth.can(card.permission)) {
    Notify.create({
      type: "warning",
      icon: "lock",
      message: card.forbiddenMessage,
      timeout: 3500,
      position: "top"
    });

    return;
  }

  void router.push(card.to);
}

async function loadStats(): Promise<void> {
  if (!auth.can(Permission.DashboardCards)) {
    return;
  }

  isLoading.value = true;

  try {
    stats.value = await fetchDashboardStats();
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(
        error,
        "Não foi possível carregar os totais do painel."
      )
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void loadStats();
});
</script>

<style scoped lang="scss">
.dashboard-card {
  border-radius: 12px;
  transition: background-color 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &:focus-visible {
    outline: 2px solid var(--admin-action, #1565c0);
    outline-offset: 2px;
  }
}
</style>

<style lang="scss">
body.body--dark .dashboard-card:hover {
  background: rgba(255, 255, 255, 0.04);
}
</style>
