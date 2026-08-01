<template>
  <q-page padding>
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col">
        <div class="text-h5">Perfis</div>
      </div>
      <div v-if="auth.can(Permission.RolesCreate)" class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          :label="$q.screen.gt.xs ? 'Novo perfil' : undefined"
          :round="$q.screen.lt.sm"
          :dense="$q.screen.lt.sm"
          unelevated
          aria-label="Novo perfil"
          :to="{ name: 'admin-roles-create' }"
        />
      </div>
    </div>

    <q-table
      class="roles-table full-width"
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
                {{ props.row.label }}
              </div>
              <div class="text-caption text-grey-7">
                {{ props.row.permissions.length }} permissões ·
                {{ props.row.users_count }} usuários
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
              <q-btn
                v-if="auth.can(Permission.RolesShow)"
                flat
                dense
                round
                icon="visibility"
                color="primary"
                aria-label="Visualizar"
                :to="{
                  name: 'admin-roles-show',
                  params: { id: String(props.row.id) }
                }"
              />
              <q-btn
                v-if="auth.can(Permission.RolesUpdate)"
                flat
                dense
                round
                icon="edit"
                color="primary"
                aria-label="Editar"
                :to="{
                  name: 'admin-roles-edit',
                  params: { id: String(props.row.id) }
                }"
              />
              <q-btn
                v-if="auth.can(Permission.RolesDelete)"
                flat
                dense
                round
                icon="delete"
                color="negative"
                aria-label="Excluir"
                :disable="
                  props.row.name === 'admin' || props.row.users_count > 0
                "
                @click="confirmDelete(props.row)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="auth.can(Permission.RolesShow)"
            flat
            dense
            round
            icon="visibility"
            color="primary"
            aria-label="Visualizar"
            :to="{
              name: 'admin-roles-show',
              params: { id: String(props.row.id) }
            }"
          />
          <q-btn
            v-if="auth.can(Permission.RolesUpdate)"
            flat
            dense
            round
            icon="edit"
            color="primary"
            aria-label="Editar"
            :to="{
              name: 'admin-roles-edit',
              params: { id: String(props.row.id) }
            }"
          />
          <q-btn
            v-if="auth.can(Permission.RolesDelete)"
            flat
            dense
            round
            icon="delete"
            color="negative"
            aria-label="Excluir"
            :disable="props.row.name === 'admin' || props.row.users_count > 0"
            @click="confirmDelete(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Dialog,
  Notify,
  useQuasar,
  type QTableColumn,
  type QTableProps
} from "quasar";
import { useAuthStore } from "@/stores/auth";
import { Permission } from "@/constants/permissions";
import { deleteRole, fetchRoles, type Role } from "@/services/roles";
import { getApiErrorMessage } from "@/utils/api-error";

const $q = useQuasar();
const auth = useAuthStore();
const rows = ref<Role[]>([]);
const isLoading = ref(false);

const columns = computed((): QTableColumn[] => {
  const cols: QTableColumn[] = [
    {
      name: "name",
      label: "Nome",
      field: "label",
      align: "left",
      sortable: true
    },
    {
      name: "permissions",
      label: "Permissões",
      field: (row: Role) => row.permissions.length,
      align: "left"
    },
    {
      name: "users_count",
      label: "Usuários",
      field: "users_count",
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

  return cols;
});

const pagination = ref({
  sortBy: "name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

async function loadRoles(
  page = pagination.value.page,
  rowsPerPage = pagination.value.rowsPerPage
): Promise<void> {
  isLoading.value = true;

  try {
    const response = await fetchRoles(page, rowsPerPage);
    rows.value = response.data;
    pagination.value.page = response.meta.current_page;
    pagination.value.rowsPerPage = response.meta.per_page;
    pagination.value.rowsNumber = response.meta.total;
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Não foi possível carregar os perfis.")
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
  void loadRoles(next.page, next.rowsPerPage);
};

function confirmDelete(role: Role): void {
  Dialog.create({
    title: "Excluir perfil",
    message: `Remover o perfil ${role.label}? Esta ação não pode ser desfeita.`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await deleteRole(role.id);
        Notify.create({ type: "positive", message: "Perfil removido." });
        await loadRoles();
      } catch (error) {
        Notify.create({
          type: "negative",
          message: getApiErrorMessage(
            error,
            "Não foi possível excluir o perfil."
          )
        });
      }
    })();
  });
}

onMounted(() => {
  void loadRoles();
});
</script>

<style scoped lang="scss">
.roles-table {
  :deep(.q-table__bottom) {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
