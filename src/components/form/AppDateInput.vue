<template>
  <q-input
    :model-value="display"
    :label="label"
    :dense="dense"
    :outlined="outlined"
    :clearable="clearable"
    :stack-label="stackLabel"
    :disable="disable"
    :readonly="readonly"
    mask="##/##/####"
    fill-mask
    hint="dd/mm/aaaa"
    @update:model-value="onDisplayUpdate"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          ref="popupRef"
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            :model-value="calendarValue"
            mask="DD/MM/YYYY"
            today-btn
            @update:model-value="onDatePick"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Fechar" color="primary" flat dense />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { date, type QPopupProxy } from "quasar";

export interface AppDateInputProps {
  modelValue?: string | null;
  label?: string;
  dense?: boolean;
  outlined?: boolean;
  clearable?: boolean;
  stackLabel?: boolean;
  disable?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<AppDateInputProps>(), {
  modelValue: "",
  label: "",
  dense: false,
  outlined: false,
  clearable: false,
  stackLabel: false,
  disable: false,
  readonly: false
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const DISPLAY_FORMAT = "DD/MM/YYYY";
const API_FORMAT = "YYYY-MM-DD";

const display = ref("");
const popupRef = ref<QPopupProxy | null>(null);

const calendarValue = computed(() => {
  const api = toApi(display.value);
  return api !== null ? display.value : null;
});

function toDisplay(apiValue: string | null | undefined): string {
  if (!apiValue) {
    return "";
  }

  const parsed = date.extractDate(apiValue, API_FORMAT);
  return Number.isNaN(parsed.getTime())
    ? ""
    : date.formatDate(parsed, DISPLAY_FORMAT);
}

function toApi(displayValue: string): string | null {
  if (!displayValue || displayValue.includes("_") || displayValue.length < 10) {
    return null;
  }

  const parsed = date.extractDate(displayValue, DISPLAY_FORMAT);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return date.formatDate(parsed, API_FORMAT);
}

watch(
  () => props.modelValue,
  value => {
    const currentApi = toApi(display.value);
    if ((value || "") === (currentApi || "")) {
      return;
    }

    display.value = toDisplay(value);
  },
  { immediate: true }
);

function onDisplayUpdate(value: string | number | null): void {
  const text = value == null ? "" : String(value);
  display.value = text;

  if (text === "" || text.replace(/_/g, "").replace(/\//g, "") === "") {
    display.value = "";
    emit("update:modelValue", "");
    return;
  }

  const api = toApi(text);
  if (api !== null) {
    emit("update:modelValue", api);
    return;
  }

  if (props.modelValue) {
    emit("update:modelValue", "");
  }
}

function onDatePick(value: string | null): void {
  if (!value) {
    onDisplayUpdate("");
    return;
  }

  display.value = value;
  const api = toApi(value);
  if (api !== null) {
    emit("update:modelValue", api);
  }

  popupRef.value?.hide();
}
</script>
