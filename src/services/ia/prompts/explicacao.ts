export const PROMPT_EXPLICACAO = `Explique em linguagem pedagógica simples por que o estudante recebeu a classificação sugerida.

Retorne no máximo três parágrafos.`;

export function buildPromptExplicacao(resultadoAvaliacao: string): string {
  return `${PROMPT_EXPLICACAO}

Resultado da avaliação:
${resultadoAvaliacao}`;
}
