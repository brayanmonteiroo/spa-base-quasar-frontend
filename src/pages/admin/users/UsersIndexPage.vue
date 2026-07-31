<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Usuários</div>
      <q-btn
        color="primary"
        icon="add"
        label="Novo usuário"
        unelevated
        :to="{ name: 'admin-users-create' }"
      />
    </div>

    <q-table
      flat
      bordered
      row-key="id"
      :rows="rows"
      :columns="columns"
      :loading="isLoading"
      v-model:pagination="pagination"
      :rows-per-page-options="[5, 10, 15, 25, 50]"
      @request="onRequest"
    >
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            round
            icon="edit"
            color="primary"
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
            :disable="props.row.id === auth.user?.id"
            @click="confirmDelete(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Dialog, Notify, type QTableColumn, type QTableProps } from "quasar";
import { useAuthStore, type AuthUser } from "@/stores/auth";
import { deleteUser, fetchUsers } from "@/services/users";
import { getApiErrorMessage } from "@/utils/api-error";

const auth = useAuthStore();
const rows = ref<AuthUser[]>([]);
const isLoading = ref(false);

const columns: QTableColumn[] = [
  { name: "id", label: "ID", field: "id", align: "left", sortable: true },
  { name: "name", label: "Nome", field: "name", align: "left", sortable: true },
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
    align: "right"
  }
];

const pagination = ref({
  sortBy: "name",
  descending: false,
  page: 1,
  rowsPerPage: 15,
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
