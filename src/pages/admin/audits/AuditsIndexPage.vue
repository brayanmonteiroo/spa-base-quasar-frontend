<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Auditoria</div>

    <TableFilters
      :active-count="activeFilterCount"
      @apply="applyFilters"
      @clear="clearFilters"
    >
      <div class="col-12 col-sm-6 col-md-3">
        <q-select
          v-model="draft.event"
          :options="eventOptions"
          label="Evento"
          dense
          clearable
          outlined
          emit-value
          map-options
          options-dense
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-select
          v-model="draft.user_id"
          :options="userOptions"
          label="Usuário"
          dense
          clearable
          outlined
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          placeholder="Digite para buscar"
          :loading="isLoadingUsers"
          @filter="filterUsers"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                Digite para buscar usuários
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <AppDateInput
          v-model="draft.from"
          label="De"
          dense
          clearable
          outlined
          stack-label
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <AppDateInput
          v-model="draft.to"
          label="Até"
          dense
          clearable
          outlined
          stack-label
        />
      </div>
    </TableFilters>

    <q-table
      class="audits-table full-width"
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
                {{ props.row.event_label }} ·
                {{ props.row.auditable_label }} #{{ props.row.auditable_id }}
              </div>
              <div class="text-caption text-grey-7">
                {{ formatUser(props.row.user) }}
              </div>
              <div class="text-caption text-grey-7">
                {{ formatDate(props.row.created_at) }}
              </div>
              <div v-if="props.row.ip_address" class="text-caption">
                IP: {{ props.row.ip_address }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
              <q-btn
                flat
                dense
                round
                icon="info"
                color="primary"
                aria-label="Detalhes"
                :loading="detailLoadingId === props.row.id"
                @click="showDetails(props.row)"
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
            icon="info"
            color="primary"
            aria-label="Detalhes"
            :loading="detailLoadingId === props.row.id"
            @click="showDetails(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import {
  Dialog,
  Notify,
  useQuasar,
  type QTableColumn,
  type QTableProps
} from "quasar";
import TableFilters from "@/components/table/TableFilters.vue";
import AppDateInput from "@/components/form/AppDateInput.vue";
import { Permission } from "@/constants/permissions";
import {
  fetchAudit,
  fetchAudits,
  type AuditDetail,
  type AuditEntry
} from "@/services/audits";
import { fetchUsers } from "@/services/users";
import { useAuthStore } from "@/stores/auth";
import { sortDirectionFromDescending } from "@/types/table";
import { getApiErrorMessage } from "@/utils/api-error";

interface AuditFilters {
  event: string | null;
  user_id: number | null;
  from: string;
  to: string;
}

type UserOption = { label: string; value: number };

const eventOptions = [
  { label: "Criado", value: "created" },
  { label: "Atualizado", value: "updated" },
  { label: "Excluído", value: "deleted" },
  { label: "Restaurado", value: "restored" },
  { label: "Perfis atualizados", value: "roles_updated" },
  { label: "Vínculos atualizados", value: "sync" }
] as const;

const $q = useQuasar();
const route = useRoute();
const auth = useAuthStore();
const rows = ref<AuditEntry[]>([]);
const isLoading = ref(false);
const isLoadingUsers = ref(false);
const detailLoadingId = ref<number | null>(null);
const userOptions = ref<UserOption[]>([]);

const draft = reactive<AuditFilters>({
  event: null,
  user_id: null,
  from: "",
  to: ""
});

const applied = reactive<AuditFilters>({
  event: null,
  user_id: null,
  from: "",
  to: ""
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (applied.event) count += 1;
  if (applied.user_id) count += 1;
  if (applied.from) count += 1;
  if (applied.to) count += 1;
  return count;
});

function formatUser(user: AuditEntry["user"]): string {
  if (!user) {
    return "Sistema / desconhecido";
  }

  return `${user.name} (${user.email})`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("pt-BR");
}

function formatRecord(
  row: Pick<AuditEntry, "auditable_label" | "auditable_id">
): string {
  return `${row.auditable_label} #${row.auditable_id}`;
}

function formatJson(value: Record<string, unknown> | null): string {
  if (!value || Object.keys(value).length === 0) {
    return "—";
  }

  return JSON.stringify(value, null, 2);
}

function openDetailDialog(detail: AuditDetail): void {
  Dialog.create({
    title: `${detail.event_label} · ${formatRecord(detail)}`,
    message: [
      `<div class="q-mb-sm"><strong>Quando:</strong> ${formatDate(detail.created_at)}</div>`,
      `<div class="q-mb-sm"><strong>Quem:</strong> ${formatUser(detail.user)}</div>`,
      `<div class="q-mb-sm"><strong>IP:</strong> ${detail.ip_address ?? "—"}</div>`,
      `<div class="q-mb-sm"><strong>URL:</strong> ${detail.url ?? "—"}</div>`,
      `<div class="q-mb-xs"><strong>Antes:</strong></div>`,
      `<pre class="audit-json">${formatJson(detail.old_values)}</pre>`,
      `<div class="q-mb-xs q-mt-sm"><strong>Depois:</strong></div>`,
      `<pre class="audit-json">${formatJson(detail.new_values)}</pre>`
    ].join(""),
    html: true,
    ok: { label: "Fechar", flat: true, color: "primary" }
  });
}

async function showDetails(row: AuditEntry): Promise<void> {
  detailLoadingId.value = row.id;

  try {
    const detail = await fetchAudit(row.id);
    openDetailDialog(detail);
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(
        error,
        "Não foi possível carregar os detalhes da auditoria."
      )
    });
  } finally {
    detailLoadingId.value = null;
  }
}

const columns = computed((): QTableColumn[] => {
  const cols: QTableColumn[] = [
    {
      name: "created_at",
      label: "Data",
      field: (row: AuditEntry) => formatDate(row.created_at),
      align: "left",
      sortable: true,
      style: "min-width: 160px"
    },
    {
      name: "user",
      label: "Usuário",
      field: (row: AuditEntry) => formatUser(row.user),
      align: "left"
    },
    {
      name: "event",
      label: "Evento",
      field: "event_label",
      align: "left",
      sortable: true,
      style: "width: 120px"
    },
    {
      name: "record",
      label: "Registro",
      field: (row: AuditEntry) => formatRecord(row),
      align: "left"
    },
    {
      name: "ip_address",
      label: "IP",
      field: (row: AuditEntry) => row.ip_address ?? "—",
      align: "left",
      style: "width: 130px"
    },
    {
      name: "actions",
      label: "Ações",
      field: "actions",
      align: "right",
      style: "width: 72px"
    }
  ];

  if ($q.screen.lt.md) {
    return cols.filter(column => column.name !== "ip_address");
  }

  return cols;
});

const pagination = ref({
  sortBy: "created_at",
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

async function loadAudits(): Promise<void> {
  isLoading.value = true;

  try {
    const response = await fetchAudits({
      page: pagination.value.page,
      per_page: pagination.value.rowsPerPage,
      ...(pagination.value.sortBy ? { sort: pagination.value.sortBy } : {}),
      direction: sortDirectionFromDescending(pagination.value.descending),
      ...(applied.event ? { event: applied.event } : {}),
      ...(applied.user_id ? { user_id: applied.user_id } : {}),
      ...(applied.from ? { from: applied.from } : {}),
      ...(applied.to ? { to: applied.to } : {})
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
        "Não foi possível carregar a auditoria."
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
  void loadAudits();
};

function applyFilters(): void {
  applied.event = draft.event;
  applied.user_id = draft.user_id;
  applied.from = draft.from;
  applied.to = draft.to;
  pagination.value.page = 1;
  void loadAudits();
}

function clearFilters(): void {
  draft.event = null;
  draft.user_id = null;
  draft.from = "";
  draft.to = "";
  applied.event = null;
  applied.user_id = null;
  applied.from = "";
  applied.to = "";
  userOptions.value = [];
  pagination.value.page = 1;
  void loadAudits();
}

function filterUsers(
  value: string,
  update: (callbackFn: () => void) => void
): void {
  if (!auth.can(Permission.UsersView)) {
    update(() => {
      userOptions.value = [];
    });
    return;
  }

  const query = value.trim();

  if (query.length === 0) {
    update(() => {
      userOptions.value = [];
    });
    return;
  }

  isLoadingUsers.value = true;

  void fetchUsers({ page: 1, per_page: 20, q: query })
    .then(response => {
      update(() => {
        userOptions.value = response.data.map(user => ({
          label: `${user.name} (${user.email})`,
          value: user.id
        }));
      });
    })
    .catch(() => {
      update(() => {
        userOptions.value = [];
      });
    })
    .finally(() => {
      isLoadingUsers.value = false;
    });
}

onMounted(() => {
  const fromQuery = route.query.from;
  const toQuery = route.query.to;

  if (typeof fromQuery === "string" && fromQuery !== "") {
    draft.from = fromQuery;
    applied.from = fromQuery;
  }

  if (typeof toQuery === "string" && toQuery !== "") {
    draft.to = toQuery;
    applied.to = toQuery;
  }

  void loadAudits();
});
</script>

<style scoped lang="scss">
.audits-table {
  :deep(.q-table__bottom) {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>

<style lang="scss">
.audit-json {
  margin: 0;
  padding: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 220px;
  overflow: auto;
}

.body--dark .audit-json {
  background: rgba(255, 255, 255, 0.08);
}
</style>
