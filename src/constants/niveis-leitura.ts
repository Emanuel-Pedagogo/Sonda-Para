import {
  getNiveisLeituraPorAno,
  getRubricaPorAno,
  type CicloAlfabetiza,
} from '@/src/constants/rubrica-alfabetiza';

export type NivelLeitura = string;

export type { CicloAlfabetiza };

export function getNiveisLeituraList(anoEscolar = 3): NivelLeitura[] {
  return getNiveisLeituraPorAno(anoEscolar);
}

export function getDescricaoNivelLeitura(nivel: string, anoEscolar = 3): string | null {
  const rubrica = getRubricaPorAno(anoEscolar);
  return rubrica.find((item) => item.id === nivel)?.descricao ?? null;
}

/** Níveis legados usados antes da rubrica oficial. Mantidos para exibição de registros antigos. */
export const NIVEIS_LEITURA_LEGADOS = [
  'Não Leitor',
  'Leitor de Palavras',
  'Leitor de Frases',
  'Leitor de Texto',
] as const;

/** Lista padrão para telas sem contexto de ano escolar (3º ano). */
export const NIVEIS_LEITURA_LIST: NivelLeitura[] = getNiveisLeituraList(3);
