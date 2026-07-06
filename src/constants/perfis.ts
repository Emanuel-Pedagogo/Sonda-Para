export const PERFIS = {
  PROFESSOR: 'professor',
  COORDENADOR: 'coordenador',
} as const;

export type PerfilUsuario = (typeof PERFIS)[keyof typeof PERFIS];
