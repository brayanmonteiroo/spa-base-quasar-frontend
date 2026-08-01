<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="auth-card full-width q-pa-sm">
      <q-card-section>
        <div class="text-h5 text-weight-medium">Recuperar senha</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Enviaremos um link de redefinição para o seu e-mail
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
            :rules="[emailRule()]"
          />

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
                label="Enviar link"
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
import { Notify, useQuasar } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";
import { emailRule } from "@/utils/validation";

const $q = useQuasar();
const auth = useAuthStore();
const email = ref("");
const isSubmitting = ref(false);

async function onSubmit(): Promise<void> {
  isSubmitting.value = true;

  try {
    const message = await auth.forgotPassword(email.value);
    Notify.create({ type: "positive", message });
  } catch (error) {
    Notify.create({
      type: "negative",
      message: getApiErrorMessage(error, "Não foi possível enviar o link.")
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
