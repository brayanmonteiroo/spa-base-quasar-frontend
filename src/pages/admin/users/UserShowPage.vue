<template>
  <q-page padding>
    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col">
        <div class="text-h5">Usuário</div>
      </div>
      <div v-if="auth.can(Permission.UsersUpdate) && user" class="col-auto">
        <q-btn
          color="primary"
          icon="edit"
          :label="$q.screen.gt.xs ? 'Editar' : undefined"
          :round="$q.screen.lt.sm"
          :dense="$q.screen.lt.sm"
          unelevated
          :to="{
            name: 'admin-users-edit',
            params: { id: String(user.id) }
          }"
        />
      </div>
    </div>

    <q-inner-loading :showing="isLoading" />

    <q-card v-if="!isLoading && user" flat bordered class="full-width form-card">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-7">Nome</div>
            <div class="text-body1">{{ user.name }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-7">E-mail</div>
            <div class="text-body1">{{ user.email }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-7">Perfis</div>
            <div class="text-body1">
              {{
                user.roles.length > 0
                  ? user.roles.map(roleLabel).join(", ")
                  : "Nenhum"
              }}
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-7">E-mail verificado</div>
            <div class="text-body1">
              {{ user.email_verified_at ? "Sim" : "Não" }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="!isLoading && user" class="q-mt-md">
      <q-btn flat label="Voltar" :to="{ name: 'admin-users' }" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify, useQuasar } from "quasar";
import { useAuthStore, type AuthUser } from "@/stores/auth";
import { Permission } from "@/constants/permissions";
import { roleLabel } from "@/constants/role-labels";
import { fetchUser } from "@/services/users";
import { getApiErrorMessage } from "@/utils/api-error";

const $q = useQuasar();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const user = ref<AuthUser | null>(null);

const userId = Number(route.params.id);

onMounted(async () => {
  try {
    user.value = await fetchUser(userId);
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
</script>
