import type { NivelLeitura } from '@/src/constants/niveis-leitura';

export interface ResultadoComparacaoIA {
  corretas: number;
  omissoes: number;
  substituicoes: number;
  acrescimos: number;
}

export interface ResultadoFluenciaIA {
  ppm: number;
}

export interface ResultadoClassificacaoIA {
  nivel: NivelLeitura;
  confianca: number;
  justificativa: string;
}

export interface ResultadoAnaliseIA {
  precisao: number;
  omissoes: number;
  substituicoes: number;
  fluencia: number;
  nivel_sugerido: NivelLeitura;
  confianca: number;
}
