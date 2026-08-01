<template>
  <q-page padding>
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col">
        <div class="text-h5">Usuários</div>
      </div>
      <div v-if="auth.can(Permission.UsersCreate)" class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          :label="$q.screen.gt.xs ? 'Novo usuário' : undefined"
          :round="$q.screen.lt.sm"
          :dense="$q.screen.lt.sm"
          unelevated
          aria-label="Novo usuário"
          :to="{ name: 'admin-users-create' }"
        />
      </div>
    </div>

    <TableFilters
      :active-count="activeFilterCount"
      @apply="applyFilters"
      @clear="clearFilters"
    >
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="draft.q"
          label="Buscar"
          dense
          clearable
          outlined
          hint="Nome ou e-mail"
          @keyup.enter="applyFilters"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
          v-model="draft.role"
          :options="roleOptions"
          label="Perfil"
          dense
          clearable
          outlined
          emit-value
          map-options
          options-dense
        />
      </div>
    </TableFilters>

    <q-table
      class="users-table full-width"
      flat
      bordered
      wrap-cells
      row-key="id"
      :rows="rows"
      :columns="columns"
      :loading="isLoading"
      :dense="$q.screen.lt.md"
      :grid="$q.screen.lt.sm"
      v-model:pagination="pagination"
      :rows-per-page-options="[5, 10, 15, 25, 50]"
      @request="onRequest"
    >
      <template #item="props">
        <div class="q-pa-sm col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">
                {{ props.row.name }}
              </div>
              <div class="text-caption text-grey-7 ellipsis">
                {{ props.row.email }}
              </div>
              <div class="text-caption q-mt-xs">
                {{ formatRoles(props.row.roles) }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
              <q-btn
                v-if="auth.can(Permission.UsersShow)"
                flat
                dense
                round
                icon="visibility"
                color="primary"
                aria-label="Visualizar"
                :to="{
                  name: 'admin-users-show',
                  params: { id: String(props.row.id) }
                }"
              />
              <q-btn
                v-if="auth.can(Permission.UsersUpdate)"
                flat
                dense
                round
                icon="edit"
                color="primary"
                aria-label="Editar"
                :to="{
                  name: 'admin-users-edit',
                  params: { id: String(props.row.id) }
                }"
              />
              <q-btn
                v-if="auth.can(Permission.UsersDelete)"
                flat
                dense
                round
                icon="delete"
                color="negative"
                aria-label="Excluir"
                :disable="props.row.id === auth.user?.id"
                @click="confirmDelete(props.row)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="auth.can(Permission.UsersShow)"
            flat
            dense
            round
            icon="visibility"
            color="primary"
            aria-label="Visualizar"
            :to="{
              name: 'admin-users-show',
              params: { id: String(props.row.id) }
            }"
          />
          <q-btn
            v-if="auth.can(Permission.UsersUpdate)"
            flat
            dense
            round
            icon="edit"
            color="primary"
            aria-label="Editar"
            :to="{
              name: 'admin-users-edit',
              params: { id: String(props.row.id) }
            }"
          />
          <q-btn
            v-if="auth.can(Permission.UsersDelete)"
            flat
            dense
            round
            icon="delete"
            color="negative"
            aria-label="Excluir"
            :disable="props.row.id === auth.user?.id"
            @click="confirmDelete(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  Dialog,
  Notify,
  useQuasar,
  type QTableColumn,
  type QTableProps
} from "quasar";
import TableFilters from "@/components/table/TableFilters.vue";
import { useAuthStore, type AuthUser } from "@/stores/auth";
import { Permission } from "@/constants/permissions";
import { RoleLabel, roleLabel } from "@/constants/role-labels";
import { fetchRoles } from "@/services/roles";
import { deleteUser, fetchUsers } from "@/services/users";
import { sortDirectionFromDescending } from "@/types/table";
import { getApiErrorMessage } from "@/utils/api-error";

interface UserFilters {
  q: string;
  role: string | null;
}

const $q = useQuasar();
const auth = useAuthStore();
const rows = ref<AuthUser[]>([]);
const isLoading = ref(false);
const roleOptions = ref<{ label: string; value: string }[]>(
  Object.entries(RoleLabel).map(([value, label]) => ({ label, value }))
);

const draft = reactive<UserFilters>({
  q: "",
  role: null
});

const applied = reactive<UserFilters>({
  q: "",
  role: null
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (applied.q.trim() !== "") count += 1;
  if (applied.role) count += 1;
  return count;
});

function formatRoles(roles: string[]): string {
  if (roles.length === 0) {
    return "Nenhum";
  }

  return roles.map(roleLabel).join(", ");
}

const columns = computed((): QTableColumn[] => {
  const cols: QTableColumn[] = [
    {
      name: "id",
      label: "ID",
      field: "id",
      align: "left",
      sortable: true,
      style: "width: 72px"
    },
    {
      name: "name",
      label: "Nome",
      field: "name",
      align: "left",
      sortable: true
    },
    {
      name: "email",
      label: "E-mail",
      field: "email",
      align: "left",
      sortable: true
    },
    {
      name: "roles",
      label: "Perfis",
      field: (row: AuthUser) => formatRoles(row.roles),
      align: "left"
    },
    {
      name: "actions",
      label: "Ações",
      field: "actions",
      align: "right",
      style: "width: 140px"
    }
  ];

  if ($q.screen.lt.md) {
    return cols.filter(column => column.name !== "id");
  }

  return cols;
});

const pagination = ref({
  sortBy: "name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

async function loadUsers(): Promise<void> {
  isLoading.value = true;

  try {
    const response = await fetchUsers({
      page: pagination.value.page,
      per_page: pagination.value.rowsPerPage,
      ...(pagination.value.sortBy ? { sort: pagination.value.sortBy } : {}),
      direction: sortDirectionFromDescending(pagination.value.descending),
      ...(applied.q.trim() !== "" ? { q: applied.q.trim() } : {}),
      ...(applied.role ? { role: applied.role } : {})
    });
    rows.value = response.data;
    pagination.value.page = response.meta.current_page;
    pagination.value.rowsPerPage = response.meta.per_page;
    pagination.value.rowsNumber = response.meta.total;
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(
        error,
        "Não foi possível carregar os usuários."
      )
    });
  } finally {
    isLoading.value = false;
  }
}

const onRequest: QTableProps["onRequest"] = ({ pagination: next }) => {
  pagination.value = {
    ...pagination.value,
    ...next
  };
  void loadUsers();
};

function applyFilters(): void {
  applied.q = draft.q;
  applied.role = draft.role;
  pagination.value.page = 1;
  void loadUsers();
}

function clearFilters(): void {
  draft.q = "";
  draft.role = null;
  applied.q = "";
  applied.role = null;
  pagination.value.page = 1;
  void loadUsers();
}

function confirmDelete(user: AuthUser): void {
  Dialog.create({
    title: "Excluir usuário",
    message: `Remover ${user.name}? Esta ação não pode ser desfeita.`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await deleteUser(user.id);
        Notify.create({ type: "positive", message: "Usuário removido." });
        await loadUsers();
      } catch (error) {
        Notify.create({
          type: "negative",
          message: getApiErrorMessage(
            error,
            "Não foi possível excluir o usuário."
          )
        });
      }
    })();
  });
}

async function loadRoleOptions(): Promise<void> {
  if (!auth.can(Permission.RolesView)) {
    return;
  }

  try {
    const response = await fetchRoles({ page: 1, per_page: 100 });
    roleOptions.value = response.data.map(role => ({
      label: role.label,
      value: role.name
    }));
  } catch {
    // Keep static RoleLabel fallback.
  }
}

onMounted(() => {
  void loadRoleOptions();
  void loadUsers();
});
</script>

<style scoped lang="scss">
.users-table {
  :deep(.q-table__bottom) {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
