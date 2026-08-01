<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="auth-card full-width q-pa-sm">
      <q-card-section>
        <div class="text-h5 text-weight-medium">Entrar</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Acesse o painel administrativo
        </div>
      </q-card-section>

      <q-card-section>
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

          <div
            class="row items-center q-col-gutter-sm"
            :class="$q.screen.lt.sm ? 'column reverse' : 'justify-between'"
          >
            <div class="col-auto">
              <router-link
                class="text-primary text-caption"
                :to="{ name: 'forgot-password' }"
              >
                Esqueci minha senha
              </router-link>
            </div>

            <div class="col-12 col-sm-auto">
              <q-btn
                class="full-width"
                type="submit"
                color="primary"
                label="Entrar"
                :loading="isSubmitting"
                unelevated
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify, useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";
import { emailRule, requiredRule } from "@/utils/validation";

const $q = useQuasar();
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
