<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-md" style="width: 100%; max-width: 420px">
      <q-card-section>
        <div class="text-h5 text-weight-medium">Recuperar senha</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Enviaremos um link de redefinição para o seu e-mail
        </div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="email"
            type="email"
            label="E-mail"
            outlined
            dense
            :rules="[val => !!val || 'Informe o e-mail']"
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
              label="Enviar link"
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
import { Notify } from "quasar";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";

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
