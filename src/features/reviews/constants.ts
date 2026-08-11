/** Debe coincidir con OCCASIONS en supabase/seed/generate_seed.py. */
export const OCCASION_OPTIONS = [
  { label: 'Amigos', value: 'amigos' },
  { label: 'Pareja', value: 'pareja' },
  { label: 'Familia', value: 'familia' },
  { label: 'Solo/a', value: 'solo' },
  { label: 'Trabajo', value: 'trabajo' },
] as const;
