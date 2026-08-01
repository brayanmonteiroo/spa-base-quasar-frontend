<template>
  <q-page padding>
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col">
        <div class="text-h5">Perfil</div>
      </div>
      <div v-if="auth.can(Permission.RolesUpdate) && role" class="col-auto">
        <q-btn
          color="primary"
          icon="edit"
          :label="$q.screen.gt.xs ? 'Editar' : undefined"
          :round="$q.screen.lt.sm"
          :dense="$q.screen.lt.sm"
          unelevated
          :to="{
            name: 'admin-roles-edit',
            params: { id: String(role.id) }
          }"
        />
      </div>
    </div>

    <q-inner-loading :showing="isLoading" />

    <q-card
      v-if="!isLoading && role"
      flat
      bordered
      class="full-width form-card"
    >
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium">{{ role.label }}</div>
        <div class="text-caption text-grey-7 q-mb-md">
          {{ role.users_count }} usuário(s) vinculado(s)
        </div>

        <div class="text-subtitle2 q-mb-sm">Permissões</div>
        <div class="q-gutter-y-md">
          <div v-for="section in catalogWithSelection" :key="section.key">
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
                :caption="`${group.selected.length}/${group.permissions.length} selecionadas`"
                :default-opened="false"
              >
                <q-card flat class="permission-group__body">
                  <q-card-section>
                    <div
                      v-if="group.selected.length > 0"
                      class="row q-col-gutter-x-md q-col-gutter-y-sm"
                    >
                      <div
                        v-for="item in group.selected"
                        :key="item.name"
                        class="col-6 col-sm-4 col-md-3 col-lg-2"
                      >
                        <div class="text-body2">{{ item.label }}</div>
                      </div>
                    </div>
                    <div v-else class="text-caption text-grey-7">
                      Nenhuma permissão neste módulo.
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="!isLoading && role" class="q-mt-md">
      <q-btn flat label="Voltar" :to="{ name: 'admin-roles' }" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { Permission } from "@/constants/permissions";
import { permissionCatalogSections } from "@/constants/permission-catalog";
import { fetchRole, type Role } from "@/services/roles";
import { getApiErrorMessage } from "@/utils/api-error";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const role = ref<Role | null>(null);

const roleId = Number(route.params.id);

const catalogWithSelection = computed(() =>
  permissionCatalogSections.map(section => ({
    ...section,
    modules: section.modules.map(group => ({
      ...group,
      selected: group.permissions.filter(
        permission => role.value?.permissions.includes(permission.name) ?? false
      )
    }))
  }))
);

onMounted(async () => {
  try {
    role.value = await fetchRole(roleId);
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Perfil não encontrado.")
    });
    await router.replace({ name: "admin-roles" });
  } finally {
    isLoading.value = false;
  }
});
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
