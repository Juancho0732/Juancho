/**
 * Localidades curadas de Bogotá para el filtro de "Zona" (Fase 0: ubicación
 * por GPS o localidad de una lista curada, sin autocompletado de direcciones).
 * Debe coincidir con LOCALITIES en supabase/seed/generate_seed.py.
 */
export const BOGOTA_LOCALITIES = [
  'Chapinero',
  'Usaquén',
  'Candelaria',
  'Teusaquillo',
  'Zona Rosa',
  'Suba',
] as const;

/** Presets de presupuesto máximo por persona (COP), para no pedir un número libre. */
export const BUDGET_PRESETS = [
  { label: 'Hasta $30.000', value: 30000 },
  { label: 'Hasta $60.000', value: 60000 },
  { label: 'Hasta $100.000', value: 100000 },
  { label: 'Sin límite', value: undefined },
] as const;

export const MIN_RATING_PRESETS = [
  { label: 'Cualquiera', value: undefined },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
] as const;

/**
 * Filtro de "Tipo de plan" en Search (búsqueda manual). Reusa las mismas
 * ocasiones que ya existen en reviews (OCCASION_OPTIONS) y el mismo mapeo a
 * tags que ya usa el ranking de AI-search -- debe coincidir con OCCASION_TAGS
 * en supabase/functions/ai-search/ranking.ts. Antes este filtro solo existía
 * en el flujo de búsqueda por IA (texto libre); esto lo hace disponible
 * también sin escribir nada.
 */
export const OCCASION_FILTER_OPTIONS = [
  { label: 'Amigos', value: 'amigos', tag: 'group_friendly' },
  { label: 'Pareja', value: 'pareja', tag: 'romantic' },
  { label: 'Familia', value: 'familia', tag: 'family_friendly' },
  { label: 'Solo/a', value: 'solo', tag: 'quiet' },
  { label: 'Trabajo', value: 'trabajo', tag: 'quiet' },
] as const;

export type OccasionFilterValue = (typeof OCCASION_FILTER_OPTIONS)[number]['value'];

export function occasionToTag(occasion: string): string | undefined {
  return OCCASION_FILTER_OPTIONS.find((option) => option.value === occasion)?.tag;
}
