/** Regras reutilizáveis para QInput / QForm (Quasar). */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requiredRule(message: string): (val: unknown) => true | string {
  return val => {
    if (typeof val === "string") {
      return val.trim().length > 0 || message;
    }

    return (val !== null && val !== undefined && val !== "") || message;
  };
}

export function emailRule(
  message = "Informe um e-mail válido"
): (val: string) => true | string {
  return val => {
    const value = val?.trim() ?? "";

    if (!value) {
      return "Informe o e-mail";
    }

    return EMAIL_PATTERN.test(value) || message;
  };
}
