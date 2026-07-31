import { defineBoot } from "#q-app";
import { Dark, LocalStorage } from "quasar";

export const DARK_MODE_STORAGE_KEY = "spa-base-dark-mode";

export default defineBoot(() => {
  const stored = LocalStorage.getItem<boolean>(DARK_MODE_STORAGE_KEY);

  if (typeof stored === "boolean") {
    Dark.set(stored);
    return;
  }

  Dark.set(false);
});
