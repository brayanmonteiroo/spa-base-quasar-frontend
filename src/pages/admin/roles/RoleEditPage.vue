<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Editar perfil</div>

    <q-inner-loading :showing="isLoading" />

    <q-card v-if="!isLoading" flat bordered class="full-width form-card">
      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="form.name"
            label="Nome"
            outlined
            dense
            :rules="[val => !!val || 'Informe o nome']"
          />

          <div>
            <div class="text-subtitle2 q-mb-sm">Permissões</div>
            <PermissionCatalogFields
              v-model="form.permissions"
              :catalog="catalog"
            />
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-auto">
              <q-btn
                class="full-width"
                type="submit"
                color="primary"
                label="Salvar"
                :loading="isSubmitting"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn
                class="full-width"
                flat
                label="Cancelar"
                :to="{ name: 'admin-roles' }"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import PermissionCatalogFields from "@/components/roles/PermissionCatalogFields.vue";
import type { PermissionCatalogGroup } from "@/constants/permission-catalog";
import {
  fetchPermissionCatalog,
  fetchRole,
  updateRole
} from "@/services/roles";
import { getApiErrorMessage } from "@/utils/api-error";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const isSubmitting = ref(false);
const catalog = ref<PermissionCatalogGroup[]>([]);

const form = reactive({
  name: "",
  permissions: [] as string[]
});

const roleId = Number(route.params.id);

onMounted(async () => {
  try {
    const [role, permissionGroups] = await Promise.all([
      fetchRole(roleId),
      fetchPermissionCatalog()
    ]);

    form.name = role.name;
    form.permissions = [...role.permissions];
    catalog.value = permissionGroups;
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

async function onSubmit(): Promise<void> {
  isSubmitting.value = true;

  try {
    await updateRole(roleId, {
      name: form.name,
      permissions: form.permissions
    });
    Notify.create({ type: "positive", message: "Perfil atualizado." });
    await router.push({ name: "admin-roles" });
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Não foi possível atualizar o perfil.")
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
