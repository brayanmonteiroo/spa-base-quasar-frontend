<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <img
        alt="Quasar logo"
        src="~@/assets/quasar-logo-vertical.svg"
        style="width: 200px; height: 200px"
      />

      <div class="q-mt-md text-body1">
        API:
        <span :class="apiStatus === 'ok' ? 'text-positive' : 'text-negative'">
          {{ apiLabel }}
        </span>
      </div>

      <q-btn
        class="q-mt-md"
        color="primary"
        to="/second"
        label="Go to Second Page"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";

const apiStatus = ref<"loading" | "ok" | "error">("loading");
const apiMessage = ref("");

const apiLabel = computed(() => {
  if (apiStatus.value === "loading") {
    return "checking…";
  }

  if (apiStatus.value === "ok") {
    return apiMessage.value || "ok";
  }

  return "unreachable";
});

onMounted(async () => {
  const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8097";

  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      credentials: "include"
    });

    if (!response.ok) {
      apiStatus.value = "error";
      return;
    }

    const data = (await response.json()) as { status?: string; app?: string };
    apiStatus.value = data.status === "ok" ? "ok" : "error";
    apiMessage.value = data.app ? `${data.status} (${data.app})` : (data.status ?? "ok");
  } catch {
    apiStatus.value = "error";
  }
});
</script>
