export const PROMPT_FLUENCIA = `Calcule a quantidade de palavras lidas por minuto.

Retorne JSON.

Formato:

{
  "ppm": 0
}`;

export function buildPromptFluencia(transcricao: string, tempoTotalSegundos: number): string {
  return `${PROMPT_FLUENCIA}

Transcrição:
${transcricao}

Tempo total da leitura (segundos):
${tempoTotalSegundos}`;
}
