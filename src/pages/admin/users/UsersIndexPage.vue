<template>
  <q-page padding>
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col">
        <div class="text-h5">Usuários</div>
      </div>
      <div class="col-auto">
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
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
              <q-btn
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
import { computed, onMounted, ref } from "vue";
import {
  Dialog,
  Notify,
  useQuasar,
  type QTableColumn,
  type QTableProps
} from "quasar";
import { useAuthStore, type AuthUser } from "@/stores/auth";
import { deleteUser, fetchUsers } from "@/services/users";
import { getApiErrorMessage } from "@/utils/api-error";

const $q = useQuasar();
const auth = useAuthStore();
const rows = ref<AuthUser[]>([]);
const isLoading = ref(false);

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
      name: "actions",
      label: "Ações",
      field: "actions",
      align: "right",
      style: "width: 100px"
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

async function loadUsers(
  page = pagination.value.page,
  rowsPerPage = pagination.value.rowsPerPage
): Promise<void> {
  isLoading.value = true;

  try {
    const response = await fetchUsers(page, rowsPerPage);
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
  void loadUsers(next.page, next.rowsPerPage);
};

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

onMounted(() => {
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
