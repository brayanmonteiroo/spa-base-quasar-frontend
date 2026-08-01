<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Auditoria</div>

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
            @click="showDetails(props.row)"
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
import { fetchAudits, type AuditEntry } from "@/services/audits";
import { getApiErrorMessage } from "@/utils/api-error";

const $q = useQuasar();
const rows = ref<AuditEntry[]>([]);
const isLoading = ref(false);

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

function formatRecord(row: AuditEntry): string {
  return `${row.auditable_label} #${row.auditable_id}`;
}

function formatJson(value: Record<string, unknown> | null): string {
  if (!value || Object.keys(value).length === 0) {
    return "—";
  }

  return JSON.stringify(value, null, 2);
}

function showDetails(row: AuditEntry): void {
  Dialog.create({
    title: `${row.event_label} · ${formatRecord(row)}`,
    message: [
      `<div class="q-mb-sm"><strong>Quando:</strong> ${formatDate(row.created_at)}</div>`,
      `<div class="q-mb-sm"><strong>Quem:</strong> ${formatUser(row.user)}</div>`,
      `<div class="q-mb-sm"><strong>IP:</strong> ${row.ip_address ?? "—"}</div>`,
      `<div class="q-mb-sm"><strong>URL:</strong> ${row.url ?? "—"}</div>`,
      `<div class="q-mb-xs"><strong>Antes:</strong></div>`,
      `<pre class="audit-json">${formatJson(row.old_values)}</pre>`,
      `<div class="q-mb-xs q-mt-sm"><strong>Depois:</strong></div>`,
      `<pre class="audit-json">${formatJson(row.new_values)}</pre>`
    ].join(""),
    html: true,
    ok: { label: "Fechar", flat: true, color: "primary" }
  });
}

const columns = computed((): QTableColumn[] => {
  const cols: QTableColumn[] = [
    {
      name: "created_at",
      label: "Data",
      field: (row: AuditEntry) => formatDate(row.created_at),
      align: "left",
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

async function loadAudits(
  page = pagination.value.page,
  rowsPerPage = pagination.value.rowsPerPage
): Promise<void> {
  isLoading.value = true;

  try {
    const response = await fetchAudits(page, rowsPerPage);
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
  void loadAudits(next.page, next.rowsPerPage);
};

onMounted(() => {
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
