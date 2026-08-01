<template>
  <nav v-if="items.length > 0" class="app-breadcrumbs" aria-label="Breadcrumb">
    <q-breadcrumbs
      class="app-breadcrumbs__trail"
      active-color="primary"
      gutter="xs"
    >
      <template #separator>
        <q-icon
          class="app-breadcrumbs__separator"
          name="chevron_right"
          size="1.1em"
        />
      </template>

      <q-breadcrumbs-el
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        :label="item.label"
        :to="item.to"
        :class="{
          'app-breadcrumbs__el--current': index === items.length - 1
        }"
      />
    </q-breadcrumbs>
  </nav>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";

const { items } = useBreadcrumbs();
</script>

<style scoped lang="scss">
.app-breadcrumbs {
  min-width: 0;
}

.app-breadcrumbs__trail {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.54);
  flex-wrap: wrap;
  row-gap: 2px;

  :deep(.q-breadcrumbs__el) {
    max-width: min(40vw, 220px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.app-breadcrumbs__separator {
  opacity: 0.55;
}

.app-breadcrumbs__el--current {
  font-weight: 500;
}

@media (max-width: 599px) {
  .app-breadcrumbs__trail {
    font-size: 0.8125rem;

    :deep(.q-breadcrumbs__el) {
      max-width: min(48vw, 160px);
    }
  }
}
</style>

<style lang="scss">
body.body--dark .app-breadcrumbs__trail {
  color: #a9b1bc;

  .q-breadcrumbs__el--active,
  .app-breadcrumbs__el--current {
    color: var(--admin-action, #6b9eff);
  }
}
</style>
