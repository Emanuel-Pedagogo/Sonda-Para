import {
  getSignedAudioUrl,
  readAudioFileAsArrayBuffer,
  uploadAudio,
} from '@/src/lib/supabase/storage';
import { updateAvaliacao } from '@/src/services/avaliacoes/avaliacoes.service';
import { registrarEvento } from '@/src/services/telemetria/telemetria.service';
import { audioContentTypeForExtension } from '@/src/constants/storage';

export interface PendingAudioRecording {
  localUri: string;
  extension: string;
  durationMillis: number;
}

export async function salvarAudioAvaliacao(params: {
  avaliacaoId: string;
  recording: PendingAudioRecording;
  ano: number;
  mes: number;
  escolaId: string;
  turmaId: string;
  alunoId: string;
  usuarioId?: string | null;
}): Promise<string> {
  try {
    const audioFile = await readAudioFileAsArrayBuffer(params.recording.localUri);
    const path = await uploadAudio({
      ano: params.ano,
      mes: params.mes,
      escolaId: params.escolaId,
      turmaId: params.turmaId,
      alunoId: params.alunoId,
      file: audioFile,
      extension: params.recording.extension,
      contentType: audioContentTypeForExtension(params.recording.extension),
    });

    await updateAvaliacao(params.avaliacaoId, { audio_url: path });
    return path;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'erro desconhecido';
    void registrarEvento({
      usuarioId: params.usuarioId,
      tipoEvento: 'upload_audio_falhou',
      metadata: { avaliacaoId: params.avaliacaoId, mensagem: message },
    });
    throw err;
  }
}

export async function obterUrlAudioAvaliacao(audioPath: string): Promise<string> {
  return getSignedAudioUrl(audioPath);
}
