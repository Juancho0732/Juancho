/**
 * Cálculo de contraste WCAG 2.1 (relative luminance + contrast ratio),
 * fórmula estándar del W3C. Auditoría de beta-readiness, Prioridad 14:
 * "revisa contraste si puedes verificarlo técnicamente" -- esto lo
 * convierte en un chequeo automático (tokens.test.ts) en vez de una
 * revisión manual única, para que un cambio de color futuro no rompa el
 * contraste sin que nadie lo note.
 */
function srgbChannelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match || !match[1] || !match[2] || !match[3]) {
    throw new Error(`Color hex inválido: ${hex}`);
  }
  const rLin = srgbChannelToLinear(parseInt(match[1], 16));
  const gLin = srgbChannelToLinear(parseInt(match[2], 16));
  const bLin = srgbChannelToLinear(parseInt(match[3], 16));
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/** Relación de contraste entre dos colores (1:1 a 21:1), orden no importa. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA para texto normal (por debajo de ~18pt/14pt negrita). */
export const WCAG_AA_NORMAL_TEXT = 4.5;
/** WCAG AA para texto grande y componentes gráficos/de UI (ej. el ícono de una estrella). */
export const WCAG_AA_LARGE_TEXT_OR_UI = 3;
