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

    <q-card v-if="!isLoading && role" flat bordered class="full-width form-card">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium">{{ role.name }}</div>
        <div class="text-caption text-grey-7 q-mb-md">
          {{ role.users_count }} usuário(s) vinculado(s)
        </div>

        <div class="text-subtitle2 q-mb-sm">Permissões</div>
        <div class="q-gutter-sm">
          <q-expansion-item
            v-for="group in catalogWithSelection"
            :key="group.key"
            dense
            bordered
            class="overflow-hidden"
            header-class="bg-grey-2 text-weight-medium"
            :label="group.label"
            :caption="`${group.selected.length}/${group.permissions.length}`"
            :default-opened="false"
          >
            <q-card flat>
              <q-card-section class="q-pt-none">
                <q-list dense v-if="group.selected.length > 0">
                  <q-item v-for="item in group.selected" :key="item.name">
                    <q-item-section>{{ item.label }}</q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-caption text-grey-7">
                  Nenhuma permissão neste módulo.
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat label="Voltar" :to="{ name: 'admin-roles' }" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify, useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { Permission } from "@/constants/permissions";
import {
  permissionCatalog,
  type PermissionCatalogGroup
} from "@/constants/permission-catalog";
import { fetchRole, type Role } from "@/services/roles";
import { getApiErrorMessage } from "@/utils/api-error";

const $q = useQuasar();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const role = ref<Role | null>(null);

const roleId = Number(route.params.id);

const catalogWithSelection = computed(() =>
  permissionCatalog.map((group: PermissionCatalogGroup) => ({
    ...group,
    selected: group.permissions.filter(
      permission => role.value?.permissions.includes(permission.name) ?? false
    )
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
