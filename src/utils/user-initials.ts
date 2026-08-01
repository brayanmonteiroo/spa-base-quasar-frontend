/** Iniciais a partir do nome completo (primeiro + último). */

export function userInitials(name: string | null | undefined): string {
  if (name == null || name.trim() === "") {
    return "?";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(part => part.length > 0);
  const firstPart = parts[0];

  if (firstPart == null) {
    return "?";
  }

  if (parts.length === 1) {
    return firstLetter(firstPart);
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart == null) {
    return firstLetter(firstPart);
  }

  return `${firstLetter(firstPart)}${firstLetter(lastPart)}`;
}

function firstLetter(word: string): string {
  if (word.length === 0) {
    return "?";
  }

  return word.charAt(0).toLocaleUpperCase("pt-BR");
}
