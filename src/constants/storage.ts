export const STORAGE_BUCKET = 'audios-sondagem';

export function buildAudioPath(params: {
  ano: number;
  mes: number;
  escolaId: string;
  turmaId: string;
  alunoId: string;
  extension?: string;
}): string {
  const mes = String(params.mes).padStart(2, '0');
  const extension = params.extension ?? '.m4a';
  return `${params.ano}/${mes}/${params.escolaId}/${params.turmaId}/${params.alunoId}${extension}`;
}

export function audioContentTypeForExtension(extension: string): string {
  if (extension === '.webm') {
    return 'audio/webm';
  }

  if (extension === '.m4a') {
    return 'audio/mp4';
  }

  if (extension === '.wav') {
    return 'audio/wav';
  }

  return 'application/octet-stream';
}

export function extensionFromPath(path: string): string {
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex === -1) {
    return '.m4a';
  }

  return path.slice(dotIndex);
}
