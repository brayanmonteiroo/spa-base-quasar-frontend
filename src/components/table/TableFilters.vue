<template>
  <q-expansion-item
    v-model="isExpanded"
    class="table-filters q-mb-md"
    bordered
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

    <q-card flat>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <slot />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right" class="q-gutter-sm">
        <q-btn flat color="grey-7" label="Limpar" @click="emit('clear')" />
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
  border-radius: 4px;
}

.table-filters__header {
  min-height: 48px;
}
</style>
