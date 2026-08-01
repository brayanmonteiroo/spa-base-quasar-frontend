<template>
  <q-expansion-item
    v-model="isExpanded"
    class="table-filters q-mb-md"
    dense
    header-class="table-filters__header"
    expand-icon="expand_more"
  >
    <template #header>
      <q-item-section avatar>
        <q-icon name="filter_list" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
        <q-item-label v-if="!isExpanded && activeCount > 0" caption>
          {{ activeCount }}
          {{ activeCount === 1 ? "filtro ativo" : "filtros ativos" }}
        </q-item-label>
      </q-item-section>
      <q-item-section v-if="activeCount > 0" side>
        <q-badge color="primary" :label="String(activeCount)" />
      </q-item-section>
    </template>

    <q-card flat class="table-filters__body">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <slot />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right" class="q-gutter-sm">
        <q-btn
          flat
          class="table-filters__clear"
          label="Limpar"
          @click="emit('clear')"
        />
        <q-btn
          unelevated
          color="primary"
          label="Aplicar"
          @click="emit('apply')"
        />
      </q-card-actions>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { ref } from "vue";

export interface TableFiltersProps {
  title?: string;
  activeCount?: number;
}

withDefaults(defineProps<TableFiltersProps>(), {
  title: "Filtros",
  activeCount: 0
});

const emit = defineEmits<{
  apply: [];
  clear: [];
}>();

const isExpanded = ref(false);
</script>

<style scoped lang="scss">
.table-filters {
  border-radius: 12px;
  overflow: hidden;
  // bordered no QExpansionItem não estiliza — borda explícita (light)
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;

  :deep(.q-expansion-item__container) {
    border-radius: 12px;
  }

  :deep(.q-item) {
    border-radius: 12px;
    min-height: 48px;
  }

  // Expandido: canto só em cima no header; corpo fecha embaixo
  &.q-expansion-item--expanded :deep(.q-item) {
    border-radius: 12px 12px 0 0;
  }
}

.table-filters__header {
  min-height: 48px;
}

.table-filters__body {
  border-radius: 0 0 12px 12px;
}

.table-filters__clear {
  color: rgba(0, 0, 0, 0.54);
}

body.body--dark .table-filters__clear {
  color: #a9b1bc;
}
</style>
