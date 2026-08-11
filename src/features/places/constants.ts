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
