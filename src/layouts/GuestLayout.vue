<template>
  <q-layout view="hHh lpR fFf" class="guest-shell">
    <q-btn
      class="guest-shell__dark-toggle"
      flat
      round
      :icon="icon"
      :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
      @click="toggle"
    />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useDarkMode } from "@/composables/useDarkMode";

const { isDark, icon, toggle } = useDarkMode();
</script>

<style lang="scss">
.guest-shell {
  --guest-bg-top: #0b1f33;
  --guest-bg-mid: #1a3a5c;
  --guest-bg-bottom: #e8eef5;

  min-height: 100%;
  background: linear-gradient(
    165deg,
    var(--guest-bg-top) 0%,
    var(--guest-bg-mid) 28%,
    var(--guest-bg-bottom) 72%,
    var(--guest-bg-bottom) 100%
  );
}

.guest-shell .q-page-container,
.guest-shell .q-page {
  background: transparent !important;
}

body.body--dark .guest-shell {
  --guest-bg-top: #050d18;
  --guest-bg-mid: #1e4a78;
  --guest-bg-bottom: #0c121c;

  background:
    radial-gradient(
      ellipse 100% 70% at 12% -10%,
      rgba(33, 150, 243, 0.45) 0%,
      transparent 58%
    ),
    radial-gradient(
      ellipse 80% 55% at 95% 110%,
      rgba(0, 180, 255, 0.22) 0%,
      transparent 52%
    ),
    linear-gradient(
      165deg,
      var(--guest-bg-top) 0%,
      var(--guest-bg-mid) 36%,
      #162536 70%,
      var(--guest-bg-bottom) 100%
    ) !important;
}

.guest-shell__dark-toggle {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 1;
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 16px rgba(11, 31, 51, 0.25);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

body.body--dark .guest-shell__dark-toggle {
  color: #{$dark-text} !important;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);

  &:hover {
    background: rgba(255, 255, 255, 0.16);
  }
}

// CTA auth: navy no light, claro no dark (fora do scoped do AuthCard/slot)
.guest-shell .auth-submit {
  min-height: 44px;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  background: #0b1f33 !important;
  color: #ffffff !important;
}

.guest-shell .auth-submit:before {
  box-shadow: none;
}

body.body--dark .guest-shell .auth-submit {
  background: #ececec !important;
  color: #0f141c !important;
}

body.body--dark .guest-shell .auth-submit.disabled,
body.body--dark .guest-shell .auth-submit[disabled] {
  background: rgba(236, 236, 236, 0.35) !important;
  color: rgba(15, 20, 28, 0.55) !important;
}
</style>
