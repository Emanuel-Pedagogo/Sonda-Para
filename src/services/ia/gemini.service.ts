/**
 * Integração com Gemini — implementação prevista para Fases 6–8.
 * Chamadas devem ocorrer via Edge Function no Supabase (chave não exposta no cliente).
 */
export class GeminiService {
  static async transcreverAudio(_audioUri: string): Promise<string> {
    throw new Error('GeminiService.transcreverAudio: implementar na Fase 6');
  }

  static async analisarLeitura(_params: {
    textoEsperado: string;
    transcricao: string;
    tempoTotalSegundos: number;
  }) {
    throw new Error('GeminiService.analisarLeitura: implementar na Fase 7');
  }
}
