<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Novo usuário</div>

    <q-card flat bordered style="max-width: 560px">
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
            label="Senha"
            outlined
            dense
            :rules="[val => (val && val.length >= 8) || 'Mínimo de 8 caracteres']"
          />
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

          <div class="row q-gutter-sm">
            <q-btn
              type="submit"
              color="primary"
              label="Criar"
              :loading="isSubmitting"
              unelevated
            />
            <q-btn
              flat
              label="Cancelar"
              :to="{ name: 'admin-users' }"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import { createUser } from "@/services/users";
import { getApiErrorMessage } from "@/utils/api-error";

const router = useRouter();
const isSubmitting = ref(false);

const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: ""
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
