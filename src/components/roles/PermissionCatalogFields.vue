<template>
  <div class="q-gutter-sm">
    <q-expansion-item
      v-for="group in catalog"
      :key="group.key"
      dense
      bordered
      class="permission-group overflow-hidden"
      header-class="bg-grey-2 text-weight-medium"
      :label="group.label"
      :caption="groupCaption(group)"
      :default-opened="false"
    >
      <q-card flat>
        <q-card-section class="q-pt-none">
          <div class="row items-center q-mb-sm q-gutter-sm">
            <q-btn
              flat
              dense
              size="sm"
              color="primary"
              label="Marcar todas"
              @click="selectAll(group)"
            />
            <q-btn
              flat
              dense
              size="sm"
              color="grey-8"
              label="Limpar"
              @click="clearGroup(group)"
            />
          </div>

          <div class="column q-gutter-xs">
            <q-checkbox
              v-for="permission in group.permissions"
              :key="permission.name"
              dense
              :model-value="modelValue.includes(permission.name)"
              :label="permission.label"
              @update:model-value="
                checked => togglePermission(permission.name, checked === true)
              "
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import type { PermissionCatalogGroup } from "@/constants/permission-catalog";

const modelValue = defineModel<string[]>({ required: true });

defineProps<{
  catalog: PermissionCatalogGroup[];
}>();

function groupCaption(group: PermissionCatalogGroup): string {
  const selected = group.permissions.filter(permission =>
    modelValue.value.includes(permission.name)
  ).length;

  return `${selected}/${group.permissions.length} selecionadas`;
}

function togglePermission(name: string, checked: boolean): void {
  if (checked) {
    if (!modelValue.value.includes(name)) {
      modelValue.value = [...modelValue.value, name];
    }
    return;
  }

  modelValue.value = modelValue.value.filter(item => item !== name);
}

function selectAll(group: PermissionCatalogGroup): void {
  const names = group.permissions.map(permission => permission.name);
  modelValue.value = Array.from(new Set([...modelValue.value, ...names]));
}

function clearGroup(group: PermissionCatalogGroup): void {
  const names = new Set(group.permissions.map(permission => permission.name));
  modelValue.value = modelValue.value.filter(name => !names.has(name));
}
</script>

<style scoped lang="scss">
.permission-group {
  border-radius: 4px;
}
</style>
