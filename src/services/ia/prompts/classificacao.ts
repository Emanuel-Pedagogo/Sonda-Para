export const PROMPT_CLASSIFICACAO = `Você é um avaliador de alfabetização.

Classifique o estudante em:

* Não Leitor
* Leitor de Palavras
* Leitor de Frases
* Leitor de Texto

Considere:

1. Leitura das palavras.
2. Leitura da frase.
3. Leitura do texto.
4. Precisão geral.

Retorne JSON.

Formato:

{
  "nivel": "",
  "confianca": 0,
  "justificativa": ""
}`;

export function buildPromptClassificacao(params: {
  precisao: number;
  omissoes: number;
  substituicoes: number;
  fluencia: number;
  resultadoPalavras: string;
  resultadoFrase: string;
  resultadoTexto: string;
}): string {
  return `${PROMPT_CLASSIFICACAO}

Precisão: ${params.precisao}%
Omissões: ${params.omissoes}
Substituições: ${params.substituicoes}
Fluência (ppm): ${params.fluencia}
Resultado das palavras: ${params.resultadoPalavras}
Resultado da frase: ${params.resultadoFrase}
Resultado do texto: ${params.resultadoTexto}`;
}
