export const RoleLabel = {
  admin: "Administrador",
  user: "Usuário"
} as const;

export function roleLabel(name: string): string {
  return RoleLabel[name as keyof typeof RoleLabel] ?? name;
}
