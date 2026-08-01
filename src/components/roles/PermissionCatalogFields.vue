<template>
  <div class="q-gutter-y-md">
    <div v-for="section in sections" :key="section.key">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">
        {{ section.label }}
      </div>

      <div class="q-gutter-y-sm">
        <q-expansion-item
          v-for="group in section.modules"
          :key="group.key"
          bordered
          class="permission-group"
          header-class="text-weight-medium permission-group__header"
          :label="group.label"
          :caption="groupCaption(group)"
          :default-opened="false"
        >
          <q-card flat class="permission-group__body">
            <q-card-section>
              <div class="row items-center justify-end q-gutter-sm q-mb-md">
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
                  color="grey-7"
                  label="Limpar"
                  @click="clearGroup(group)"
                />
              </div>

              <div class="row q-col-gutter-x-md q-col-gutter-y-sm">
                <div
                  v-for="permission in group.permissions"
                  :key="permission.name"
                  class="col-6 col-sm-4 col-md-3 col-lg-2"
                >
                  <q-checkbox
                    dense
                    :model-value="modelValue.includes(permission.name)"
                    :label="permission.label"
                    @update:model-value="
                      checked =>
                        togglePermission(permission.name, checked === true)
                    "
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  PermissionCatalogModule,
  PermissionCatalogSection
} from "@/constants/permission-catalog";

const modelValue = defineModel<string[]>({ required: true });

defineProps<{
  sections: PermissionCatalogSection[];
}>();

function groupCaption(group: PermissionCatalogModule): string {
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

  modelValue.value = modelValue.value.filter(item => name !== item);
}

function selectAll(group: PermissionCatalogModule): void {
  const names = group.permissions.map(permission => permission.name);
  modelValue.value = Array.from(new Set([...modelValue.value, ...names]));
}

function clearGroup(group: PermissionCatalogModule): void {
  const names = new Set(group.permissions.map(permission => permission.name));
  modelValue.value = modelValue.value.filter(name => !names.has(name));
}
</script>

<style scoped lang="scss">
.permission-group {
  border-radius: 4px;
  overflow: hidden;

  :deep(.permission-group__header) {
    min-height: 56px;
    padding-top: 10px;
    padding-bottom: 10px;
    background: #eeeeee;
  }

  :deep(.q-item__label--caption) {
    margin-top: 2px;
    line-height: 1.25;
    overflow: visible;
  }

  :deep(.permission-group__body) {
    background: #fafafa;
  }
}
</style>
