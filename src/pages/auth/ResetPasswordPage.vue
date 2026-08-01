<template>
  <AuthCard
    title="Redefinir senha"
    subtitle="Defina uma nova senha para a sua conta"
  >
    <q-banner v-if="!token" class="bg-negative text-white q-mb-md" rounded>
      Token de redefinição ausente. Use o link enviado por e-mail.
    </q-banner>

    <q-form class="q-gutter-md" novalidate @submit.prevent="onSubmit">
      <q-input
        v-model="email"
        type="email"
        label="E-mail"
        outlined
        dense
        :rules="[emailRule()]"
      />

      <q-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        label="Nova senha"
        outlined
        dense
        autocomplete="new-password"
        :rules="[val => (val && val.length >= 8) || 'Mínimo de 8 caracteres']"
      >
        <template #append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-input
        v-model="passwordConfirmation"
        :type="showPasswordConfirmation ? 'text' : 'password'"
        label="Confirmar senha"
        outlined
        dense
        autocomplete="new-password"
        :rules="[val => val === password || 'As senhas não coincidem']"
      >
        <template #append>
          <q-icon
            :name="showPasswordConfirmation ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPasswordConfirmation = !showPasswordConfirmation"
          />
        </template>
      </q-input>

      <div class="column q-gutter-y-md">
        <q-btn
          class="full-width auth-submit"
          type="submit"
          label="Salvar senha"
          icon="lock"
          no-caps
          unelevated
          :disable="!token"
          :loading="isSubmitting"
        />

        <div class="row justify-center">
          <AuthLink
            :to="{ name: 'login' }"
            label="Voltar ao login"
            icon="arrow_back"
          />
        </div>
      </div>
    </q-form>
  </AuthCard>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import AuthCard from "@/components/auth/AuthCard.vue";
import AuthLink from "@/components/auth/AuthLink.vue";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";
import { emailRule } from "@/utils/validation";

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
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);
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
