const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function formatSondagemPeriodo(mes: number | null, ano: number | null): string {
  if (!mes && !ano) {
    return 'Período não informado';
  }

  const mesLabel = mes ? MESES[mes - 1] : null;

  if (mesLabel && ano) {
    return `${mesLabel} de ${ano}`;
  }

  if (ano) {
    return String(ano);
  }

  return mesLabel ?? 'Período não informado';
}

export function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
