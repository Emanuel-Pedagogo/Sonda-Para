import { supabase } from '@/src/lib/supabase/client';
import type { Avaliacao } from '@/src/types/database';

interface AnalyzeAvaliacaoParams {
  avaliacaoId: string;
  audioPath: string;
  tempoTotalSegundos: number;
}

interface AnalyzeAvaliacaoResponse {
  avaliacao?: Avaliacao;
  error?: string;
}

export async function analisarAvaliacaoComIA(params: AnalyzeAvaliacaoParams): Promise<Avaliacao> {
  const { data, error } = await supabase.functions.invoke<AnalyzeAvaliacaoResponse>(
    'avaliacao-ia',
    {
      body: params,
    },
  );

  if (error) {
    if ('context' in error) {
      const context = error.context as { json?: () => Promise<AnalyzeAvaliacaoResponse> };
      const response = await context.json?.().catch(() => null);
      if (response?.error) {
        throw new Error(response.error);
      }
    }

    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.avaliacao) {
    throw new Error('A análise por IA não retornou a avaliação atualizada.');
  }

  return data.avaliacao;
}
