<template>
  <AuthCard title="Entrar" subtitle="Acesse o painel administrativo">
    <q-form class="q-gutter-md" novalidate @submit.prevent="onSubmit">
      <q-input
        v-model="email"
        type="email"
        label="E-mail"
        outlined
        dense
        autocomplete="username"
        :rules="[emailRule()]"
      />

      <q-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        label="Senha"
        outlined
        dense
        autocomplete="current-password"
        :rules="[requiredRule('Informe a senha')]"
      >
        <template #append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-checkbox v-model="remember" label="Lembrar-me" dense />

      <div class="column q-gutter-y-md">
        <q-btn
          class="full-width auth-submit"
          type="submit"
          label="Entrar"
          icon="login"
          no-caps
          unelevated
          :loading="isSubmitting"
        />

        <div class="row justify-center">
          <AuthLink
            :to="{ name: 'forgot-password' }"
            label="Esqueci minha senha"
            icon="lock_reset"
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
import { emailRule, requiredRule } from "@/utils/validation";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const remember = ref(false);
const showPassword = ref(false);
const isSubmitting = ref(false);

async function onSubmit(): Promise<void> {
  isSubmitting.value = true;

  try {
    await auth.login(email.value, password.value, remember.value);

    const redirect =
      typeof route.query.redirect === "string"
        ? route.query.redirect
        : "/admin/dashboard";

    await router.replace(redirect);
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Falha ao autenticar.")
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
