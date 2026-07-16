import { supabase } from '@/src/lib/supabase/client';
import type { TipoEventoUso } from '@/src/types/database';

interface RegistrarEventoParams {
  usuarioId: string | null | undefined;
  tipoEvento: TipoEventoUso;
  metadata?: Record<string, unknown>;
}

// Telemetria do piloto nunca pode travar o fluxo do professor em sala — falha é silenciosa.
export async function registrarEvento(params: RegistrarEventoParams): Promise<void> {
  if (!params.usuarioId) {
    return;
  }

  try {
    const { error } = await supabase.from('eventos_uso').insert({
      usuario_id: params.usuarioId,
      tipo_evento: params.tipoEvento,
      metadata: params.metadata ?? {},
    });

    if (error) {
      console.warn('[telemetria] falha ao registrar evento', params.tipoEvento, error.message);
    }
  } catch (err) {
    console.warn('[telemetria] falha ao registrar evento', params.tipoEvento, err);
  }
}
