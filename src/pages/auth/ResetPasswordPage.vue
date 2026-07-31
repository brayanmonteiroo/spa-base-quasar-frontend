<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-md" style="width: 100%; max-width: 420px">
      <q-card-section>
        <div class="text-h5 text-weight-medium">Redefinir senha</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Defina uma nova senha para a sua conta
        </div>
      </q-card-section>

      <q-card-section>
        <q-banner v-if="!token" class="bg-negative text-white q-mb-md" rounded>
          Token de redefinição ausente. Use o link enviado por e-mail.
        </q-banner>

        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="email"
            type="email"
            label="E-mail"
            outlined
            dense
            :rules="[val => !!val || 'Informe o e-mail']"
          />

          <q-input
            v-model="password"
            type="password"
            label="Nova senha"
            outlined
            dense
            :rules="[val => (val && val.length >= 8) || 'Mínimo de 8 caracteres']"
          />

          <q-input
            v-model="passwordConfirmation"
            type="password"
            label="Confirmar senha"
            outlined
            dense
            :rules="[
              val => val === password || 'As senhas não coincidem'
            ]"
          />

          <div class="row items-center justify-between">
            <router-link
              class="text-primary text-caption"
              :to="{ name: 'login' }"
            >
              Voltar ao login
            </router-link>

            <q-btn
              type="submit"
              color="primary"
              label="Salvar senha"
              :disable="!token"
              :loading="isSubmitting"
              unelevated
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const email = ref(
  typeof route.query.email === "string" ? route.query.email : ""
);
const token = ref(
  typeof route.query.token === "string" ? route.query.token : ""
);
const password = ref("");
const passwordConfirmation = ref("");
const isSubmitting = ref(false);

async function onSubmit(): Promise<void> {
  if (!token.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const message = await auth.resetPassword({
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      token: token.value
    });

    Notify.create({ type: "positive", message });
    await router.replace({ name: "login" });
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Não foi possível redefinir a senha.")
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
