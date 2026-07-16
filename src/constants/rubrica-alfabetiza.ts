export type CicloAlfabetiza = 'alfabetizacao' | 'intermediario' | 'consolidado';

export interface NivelRubrica {
  id: string;
  descricao: string;
}

export const RUBRICA_ALFABETIZACAO: NivelRubrica[] = [
  {
    id: 'Pré-leitor 1',
    descricao:
      'O estudante não realiza leitura ou diz letras, sílabas ou palavras aleatórias sem sentido, não conseguindo relacionar a sonoridade da letra, sílaba ou palavra aos grafemas.',
  },
  {
    id: 'Pré-leitor 2',
    descricao: 'O estudante nomeia letras isoladas ao tentar ler as palavras constantes, ou seja, identifica letras.',
  },
  {
    id: 'Pré-leitor 3',
    descricao: 'O estudante silaba ao realizar a leitura de palavras.',
  },
  {
    id: 'Pré-leitor 4',
    descricao: 'O estudante lê corretamente até 10 palavras com precisão.',
  },
  {
    id: 'Leitor Iniciante',
    descricao: 'O estudante não apresenta leitura automatizada e não consegue ler fluentemente.',
  },
  {
    id: 'Leitor Fluente',
    descricao:
      'O estudante apresenta leitura automatizada e é capaz de, a partir do texto, construir sentidos para o que lê. Além de ter domínio do sistema de escrita alfabética e dos signos da língua, orais e escritos.',
  },
];

export const RUBRICA_INTERMEDIARIO: NivelRubrica[] = [
  {
    id: 'Pré-leitor',
    descricao:
      'Identifica e nomeia algumas letras do seu nome e de palavras do cotidiano; realiza leitura de imagem.',
  },
  {
    id: 'Leitor de Palavras Sem Fluência',
    descricao:
      'Reconhece o valor sonoro das sílabas e lê pausadamente, apresentando dificuldade para compreender o que foi lido.',
  },
  {
    id: 'Leitor de Palavras Com Fluência',
    descricao: 'Lê palavras com fluidez (rápido) e apresenta compreensão da leitura.',
  },
  {
    id: 'Leitor de Texto Sem Fluência',
    descricao:
      'Apresenta dificuldades no reconhecimento rápido de palavras, frases e textos. Faz leitura com pausas e algumas vezes usa o apoio da silabação para leitura.',
  },
  {
    id: 'Leitor de Texto Com Fluência',
    descricao:
      'Reconhecimento rápido e correto de palavras e conjunto de palavras, ritmo e entonação adequados, o que depende da compreensão.',
  },
  {
    id: 'Leitor com Fluência, Respeita Ritmo, Intensidade e Entonação',
    descricao:
      'Capacidade de expressar o texto com entonação e ritmo adequadamente, além da compreensão do conteúdo lido.',
  },
];

export const RUBRICA_CONSOLIDADO: NivelRubrica[] = [
  {
    id: 'Pré-leitor',
    descricao:
      'Identifica e nomeia algumas letras do seu nome e de palavras do cotidiano. Realiza leitura de imagem.',
  },
  {
    id: 'Leitor de Palavras Sem Fluência',
    descricao:
      'Reconhece o valor sonoro das sílabas e lê pausadamente, apresentando dificuldade para compreender o que foi lido.',
  },
  {
    id: 'Leitor de Palavras Com Fluência',
    descricao: 'Lê palavras com fluidez (rápido) e apresenta compreensão da leitura.',
  },
  {
    id: 'Leitor de Frases Sem Fluência',
    descricao:
      'Apresenta dificuldades no reconhecimento rápido de palavras e frases. Faz leitura com pausas e algumas vezes usa o apoio da silabação.',
  },
  {
    id: 'Leitor de Frases Com Fluência',
    descricao:
      'Reconhecimento rápido e correto de palavras e conjunto de palavras, ritmo e entonação adequados, o que depende da compreensão.',
  },
  {
    id: 'Leitor de Texto Sem Fluência',
    descricao:
      'Demonstra dificuldades em ler textos de forma eficaz, sem respeitar a pontuação e entonação do texto. Faz leitura pausada, com interrupções.',
  },
  {
    id: 'Leitor de Texto Com Fluência',
    descricao:
      'Capacidade de ler textos com velocidade, precisão e expressividade, com entonação e ritmo adequados, sem grandes pausas.',
  },
  {
    id: 'Leitor com Fluência, Respeita Ritmo, Intensidade e Entonação',
    descricao:
      'Capacidade de expressar o texto com entonação e ritmo adequadamente, além da compreensão do conteúdo lido.',
  },
];

export function getCicloPorAno(anoEscolar: number): CicloAlfabetiza {
  if (anoEscolar <= 2) {
    return 'alfabetizacao';
  }

  if (anoEscolar <= 5) {
    return 'intermediario';
  }

  return 'consolidado';
}

export function getRubricaPorAno(anoEscolar: number): NivelRubrica[] {
  const ciclo = getCicloPorAno(anoEscolar);

  if (ciclo === 'alfabetizacao') {
    return RUBRICA_ALFABETIZACAO;
  }

  if (ciclo === 'intermediario') {
    return RUBRICA_INTERMEDIARIO;
  }

  return RUBRICA_CONSOLIDADO;
}

export function getNiveisLeituraPorAno(anoEscolar: number): string[] {
  return getRubricaPorAno(anoEscolar).map((nivel) => nivel.id);
}

export function buildRubricaTextoPorAno(anoEscolar: number): string {
  const rubrica = getRubricaPorAno(anoEscolar);
  const ciclo = getCicloPorAno(anoEscolar);
  const tituloCiclo =
    ciclo === 'alfabetizacao'
      ? '1º e 2º ano (Ciclo de Alfabetização)'
      : ciclo === 'intermediario'
        ? '3º ao 5º ano (Anos Iniciais)'
        : '6º ao 9º ano e EJA (Anos Finais)';

  return [
    `Programa Alfabetiza Pará — Instrumento de Acompanhamento de Leitura (${tituloCiclo}).`,
    'Use apenas os níveis abaixo como referência oficial:',
    ...rubrica.map((nivel) => `- ${nivel.id}: ${nivel.descricao}`),
  ].join('\n');
}
