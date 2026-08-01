import { computed } from "vue";
import { LocalStorage, useQuasar } from "quasar";
import { DARK_MODE_STORAGE_KEY } from "@/boot/dark";

export function useDarkMode() {
  const $q = useQuasar();

  const isDark = computed(() => $q.dark.isActive);

  const icon = computed(() => ($q.dark.isActive ? "light_mode" : "dark_mode"));

  function toggle(): void {
    $q.dark.toggle();
    LocalStorage.set(DARK_MODE_STORAGE_KEY, $q.dark.isActive);
  }

  return {
    isDark,
    icon,
    toggle
  };
}
