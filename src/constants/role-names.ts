export const RoleName = {
  Administrador: "Administrador",
  Usuario: "Usuário"
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];
