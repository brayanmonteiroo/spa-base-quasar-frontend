import axios from "axios";

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

const DEFAULT_API_ERROR_MESSAGE =
  "Ocorreu um erro inesperado. Tente novamente.";

export function getApiErrorMessage(
  error: unknown,
  fallback = DEFAULT_API_ERROR_MESSAGE
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as ApiErrorBody | undefined;

  if (data?.errors) {
    for (const messages of Object.values(data.errors)) {
      const first = messages[0];
      if (first) {
        return first;
      }
    }
  }

  if (typeof data?.message === "string" && data.message.length > 0) {
    return data.message;
  }

  return fallback;
}
