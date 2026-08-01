<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Novo usuário</div>

    <q-card flat bordered class="full-width form-card">
      <q-card-section>
        <q-form class="q-gutter-y-md" @submit.prevent="onSubmit">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                label="Nome"
                outlined
                dense
                :rules="[val => !!val || 'Informe o nome']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.email"
                type="email"
                label="E-mail"
                outlined
                dense
                :rules="[val => !!val || 'Informe o e-mail']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.password"
                type="password"
                label="Senha"
                outlined
                dense
                :rules="[
                  val => (val && val.length >= 8) || 'Mínimo de 8 caracteres'
                ]"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.password_confirmation"
                type="password"
                label="Confirmar senha"
                outlined
                dense
                :rules="[
                  val => val === form.password || 'As senhas não coincidem'
                ]"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.roles"
                label="Perfis"
                outlined
                dense
                multiple
                emit-value
                map-options
                use-chips
                :options="roleOptions"
                :loading="isRolesLoading"
                :rules="[
                  val =>
                    (Array.isArray(val) && val.length > 0) ||
                    'Selecione ao menos um perfil'
                ]"
              />
            </div>
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
                :to="{ name: 'admin-users' }"
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
import { createUser } from "@/services/users";
import { fetchRoles } from "@/services/roles";
import { getApiErrorMessage } from "@/utils/api-error";

interface RoleOption {
  label: string;
  value: string;
}

const router = useRouter();
const isSubmitting = ref(false);
const isRolesLoading = ref(false);
const roleOptions = ref<RoleOption[]>([]);

const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  roles: ["user"] as string[]
});

onMounted(async () => {
  isRolesLoading.value = true;

  try {
    const response = await fetchRoles(1, 100);
    roleOptions.value = response.data.map(role => ({
      label: role.label,
      value: role.name
    }));
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(
        error,
        "Não foi possível carregar os perfis."
      )
    });
  } finally {
    isRolesLoading.value = false;
  }
});

async function onSubmit(): Promise<void> {
  isSubmitting.value = true;

  try {
    await createUser({ ...form });
    Notify.create({ type: "positive", message: "Usuário criado." });
    await router.push({ name: "admin-users" });
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Não foi possível criar o usuário.")
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
