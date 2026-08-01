<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Editar usuário</div>

    <q-inner-loading :showing="isLoading" />

    <q-card v-if="!isLoading" flat bordered class="full-width form-card">
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

          <q-toggle
            v-model="changePassword"
            label="Alterar senha"
            dense
            color="primary"
          />

          <div v-if="changePassword" class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="Nova senha"
                outlined
                dense
                autocomplete="new-password"
                :rules="[
                  val => (val && val.length >= 8) || 'Mínimo de 8 caracteres'
                ]"
              >
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.password_confirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                label="Confirmar nova senha"
                outlined
                dense
                autocomplete="new-password"
                :rules="[
                  val => val === form.password || 'As senhas não coincidem'
                ]"
              >
                <template #append>
                  <q-icon
                    :name="
                      showPasswordConfirmation ? 'visibility_off' : 'visibility'
                    "
                    class="cursor-pointer"
                    @click="
                      showPasswordConfirmation = !showPasswordConfirmation
                    "
                  />
                </template>
              </q-input>
            </div>
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
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import { fetchUser, updateUser } from "@/services/users";
import { fetchRoles } from "@/services/roles";
import { getApiErrorMessage } from "@/utils/api-error";

interface RoleOption {
  label: string;
  value: string;
}

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const isSubmitting = ref(false);
const isRolesLoading = ref(false);
const changePassword = ref(false);
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);
const roleOptions = ref<RoleOption[]>([]);

const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  roles: [] as string[]
});

const userId = Number(route.params.id);

watch(changePassword, enabled => {
  if (!enabled) {
    form.password = "";
    form.password_confirmation = "";
    showPassword.value = false;
    showPasswordConfirmation.value = false;
  }
});

onMounted(async () => {
  isRolesLoading.value = true;

  try {
    const [user, rolesResponse] = await Promise.all([
      fetchUser(userId),
      fetchRoles(1, 100)
    ]);

    form.name = user.name;
    form.email = user.email;
    form.roles = [...user.roles];
    roleOptions.value = rolesResponse.data.map(role => ({
      label: role.label,
      value: role.name
    }));
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Usuário não encontrado.")
    });
    await router.replace({ name: "admin-users" });
  } finally {
    isLoading.value = false;
    isRolesLoading.value = false;
  }
});

async function onSubmit(): Promise<void> {
  isSubmitting.value = true;

  try {
    const payload = {
      name: form.name,
      email: form.email,
      roles: form.roles,
      ...(changePassword.value && form.password
        ? {
            password: form.password,
            password_confirmation: form.password_confirmation
          }
        : {})
    };

    await updateUser(userId, payload);
    Notify.create({ type: "positive", message: "Usuário atualizado." });
    await router.push({ name: "admin-users" });
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Não foi possível atualizar o usuário.")
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
