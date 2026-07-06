export const PROMPT_COMPARACAO = `Compare o texto esperado com a leitura realizada.

Identifique:

* palavras corretas
* palavras omitidas
* palavras substituídas
* palavras acrescentadas

Retorne JSON.

Formato:

{
  "corretas": 0,
  "omissoes": 0,
  "substituicoes": 0,
  "acrescimos": 0
}`;

export function buildPromptComparacao(textoEsperado: string, transcricao: string): string {
  return `${PROMPT_COMPARACAO}

Texto esperado:
${textoEsperado}

Transcrição do aluno:
${transcricao}`;
}
