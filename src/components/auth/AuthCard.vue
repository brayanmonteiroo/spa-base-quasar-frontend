<template>
  <q-page class="flex flex-center q-pa-md guest-auth-page">
    <div class="auth-stack full-width">
      <div class="auth-brand">
        <img
          class="auth-brand__logo"
          src="/quasar-logo.svg"
          alt="Quasar"
          width="72"
          height="72"
        />
        <div class="auth-brand__name">SPA Base</div>
      </div>

      <q-card flat bordered class="auth-card full-width">
        <q-card-section class="auth-card__header">
          <div class="text-h5 text-weight-medium">{{ title }}</div>
          <div v-if="subtitle" class="auth-card__subtitle text-body2 q-mt-xs">
            {{ subtitle }}
          </div>
        </q-card-section>

        <q-card-section class="auth-card__body">
          <slot />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
export interface AuthCardProps {
  title: string;
  subtitle?: string;
}

withDefaults(defineProps<AuthCardProps>(), {
  subtitle: ""
});
</script>

<style lang="scss" scoped>
.guest-auth-page {
  min-height: 100%;
}

.auth-stack {
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.auth-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.auth-brand__logo {
  width: 72px;
  height: 72px;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(11, 31, 51, 0.35));
}

body.body--dark .auth-brand__logo {
  filter: drop-shadow(0 8px 24px rgba(0, 180, 255, 0.35));
}

.auth-brand__name {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: #ffffff;
  text-shadow: 0 2px 12px rgba(11, 31, 51, 0.45);
}

body.body--dark .auth-brand__name {
  color: $dark-text;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.55);
}

.auth-card {
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(11, 31, 51, 0.18);
}

body.body--dark .auth-card {
  background: #1e2a3d;
  border-color: rgba(107, 158, 255, 0.18);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}

.auth-card__header {
  padding-bottom: 0;
}

.auth-card__subtitle {
  color: rgba(11, 31, 51, 0.62);
}

body.body--dark .auth-card__subtitle {
  color: $dark-text-muted;
}

.auth-card__body {
  padding-top: 20px;
}
</style>
