<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="auth-card full-width q-pa-sm">
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

          <div
            class="row items-center q-col-gutter-sm"
            :class="$q.screen.lt.sm ? 'column reverse' : 'justify-between'"
          >
            <div class="col-auto">
              <router-link
                class="text-primary text-caption"
                :to="{ name: 'login' }"
              >
                Voltar ao login
              </router-link>
            </div>

            <div class="col-12 col-sm-auto">
              <q-btn
                class="full-width"
                type="submit"
                color="primary"
                label="Salvar senha"
                :disable="!token"
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

const $q = useQuasar();
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
