export const STORAGE_BUCKET = 'audios-sondagem';

export function buildAudioPath(params: {
  ano: number;
  mes: number;
  escolaId: string;
  turmaId: string;
  alunoId: string;
}): string {
  const mes = String(params.mes).padStart(2, '0');
  return `${params.ano}/${mes}/${params.escolaId}/${params.turmaId}/${params.alunoId}.wav`;
}
