<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Editar usuário</div>

    <q-inner-loading :showing="isLoading" />

    <q-card v-if="!isLoading" flat bordered style="max-width: 560px">
      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="form.name"
            label="Nome"
            outlined
            dense
            :rules="[val => !!val || 'Informe o nome']"
          />
          <q-input
            v-model="form.email"
            type="email"
            label="E-mail"
            outlined
            dense
            :rules="[val => !!val || 'Informe o e-mail']"
          />
          <q-input
            v-model="form.password"
            type="password"
            label="Nova senha (opcional)"
            outlined
            dense
          />
          <q-input
            v-model="form.password_confirmation"
            type="password"
            label="Confirmar nova senha"
            outlined
            dense
            :rules="[
              val =>
                !form.password ||
                val === form.password ||
                'As senhas não coincidem'
            ]"
          />

          <div class="row q-gutter-sm">
            <q-btn
              type="submit"
              color="primary"
              label="Salvar"
              :loading="isSubmitting"
              unelevated
            />
            <q-btn flat label="Cancelar" :to="{ name: 'admin-users' }" />
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
import { fetchUser, updateUser } from "@/services/users";
import { getApiErrorMessage } from "@/utils/api-error";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const isSubmitting = ref(false);

const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: ""
});

const userId = Number(route.params.id);

onMounted(async () => {
  try {
    const user = await fetchUser(userId);
    form.name = user.name;
    form.email = user.email;
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Usuário não encontrado.")
    });
    await router.replace({ name: "admin-users" });
  } finally {
    isLoading.value = false;
  }
});

async function onSubmit(): Promise<void> {
  isSubmitting.value = true;

  try {
    const payload = {
      name: form.name,
      email: form.email,
      ...(form.password
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
