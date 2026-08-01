<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Novo perfil</div>

    <q-card flat bordered class="full-width form-card">
      <q-card-section>
        <q-form class="q-gutter-y-md" @submit.prevent="onSubmit">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                label="Nome"
                hint="Nome do perfil exibido na aplicação (ex.: Editor)"
                outlined
                dense
                :rules="[val => !!val || 'Informe o nome do perfil']"
              />
            </div>
          </div>

          <div>
            <div class="text-subtitle2 q-mb-sm">Permissões</div>
            <q-inner-loading :showing="isCatalogLoading" />
            <PermissionCatalogFields
              v-if="!isCatalogLoading"
              v-model="form.permissions"
              :sections="sections"
            />
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-auto">
              <q-btn
                class="full-width"
                type="submit"
                color="primary"
                label="Criar"
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
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import PermissionCatalogFields from "@/components/roles/PermissionCatalogFields.vue";
import type { PermissionCatalogSection } from "@/constants/permission-catalog";
import { createRole, fetchPermissionCatalog } from "@/services/roles";
import { getApiErrorMessage } from "@/utils/api-error";

const router = useRouter();
const isSubmitting = ref(false);
const isCatalogLoading = ref(true);
const sections = ref<PermissionCatalogSection[]>([]);

const form = reactive({
  name: "",
  permissions: [] as string[]
});

onMounted(async () => {
  try {
    sections.value = await fetchPermissionCatalog();
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(
        error,
        "Não foi possível carregar o catálogo de permissões."
      )
    });
    await router.replace({ name: "admin-roles" });
  } finally {
    isCatalogLoading.value = false;
  }
});

async function onSubmit(): Promise<void> {
  isSubmitting.value = true;

  try {
    await createRole({
      name: form.name,
      permissions: form.permissions
    });
    Notify.create({ type: "positive", message: "Perfil criado." });
    await router.push({ name: "admin-roles" });
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Não foi possível criar o perfil.")
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
