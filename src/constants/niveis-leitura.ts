export const NIVEIS_LEITURA = {
  NAO_LEITOR: 'Não Leitor',
  LEITOR_PALAVRAS: 'Leitor de Palavras',
  LEITOR_FRASES: 'Leitor de Frases',
  LEITOR_TEXTO: 'Leitor de Texto',
} as const;

export type NivelLeitura = (typeof NIVEIS_LEITURA)[keyof typeof NIVEIS_LEITURA];

export const NIVEIS_LEITURA_LIST: NivelLeitura[] = [
  NIVEIS_LEITURA.NAO_LEITOR,
  NIVEIS_LEITURA.LEITOR_PALAVRAS,
  NIVEIS_LEITURA.LEITOR_FRASES,
  NIVEIS_LEITURA.LEITOR_TEXTO,
];
