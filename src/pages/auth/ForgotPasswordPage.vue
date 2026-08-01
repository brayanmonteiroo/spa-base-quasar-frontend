<template>
  <AuthCard
    title="Recuperar senha"
    subtitle="Enviaremos um link de redefinição para o seu e-mail"
  >
    <q-form class="q-gutter-md" novalidate @submit.prevent="onSubmit">
      <q-input
        v-model="email"
        type="email"
        label="E-mail"
        outlined
        dense
        :rules="[emailRule()]"
      />

      <div class="column q-gutter-y-md">
        <q-btn
          class="full-width auth-submit"
          type="submit"
          label="Enviar link"
          icon="send"
          no-caps
          unelevated
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
import { Notify } from "quasar";
import AuthCard from "@/components/auth/AuthCard.vue";
import AuthLink from "@/components/auth/AuthLink.vue";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";
import { emailRule } from "@/utils/validation";

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
