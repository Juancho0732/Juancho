import { z } from 'zod';

import type { SearchIntent } from './types.ts';

/** Debe coincidir con BOGOTA_LOCALITIES en src/features/places/constants.ts. */
export const BOGOTA_LOCALITIES = [
  'Chapinero',
  'Usaquén',
  'Candelaria',
  'Teusaquillo',
  'Zona Rosa',
  'Suba',
] as const;

/** Debe coincidir con OCCASION_OPTIONS en src/features/reviews/constants.ts. */
export const OCCASION_VALUES = ['amigos', 'pareja', 'familia', 'solo', 'trabajo'] as const;

export const EMPTY_INTENT: SearchIntent = {
  people: null,
  budgetTotal: null,
  location: null,
  occasion: null,
  categoryHint: null,
  activityPreference: null,
};

/** Forma que le pedimos a la IA (tool-calling), antes de normalizar. */
export const rawIntentSchema = z.object({
  people: z.number().int().min(1).max(30).nullable(),
  budget_total: z.number().min(0).max(5_000_000).nullable(),
  location: z.string().nullable(),
  occasion: z.string().nullable(),
  category_hint: z.string().nullable(),
  activity_preference: z.string().nullable(),
});

export type RawIntent = z.infer<typeof rawIntentSchema>;

function normalizeLocation(value: string | null): string | null {
  if (!value) return null;
  const match = BOGOTA_LOCALITIES.find(
    (locality) => locality.localeCompare(value, 'es', { sensitivity: 'base' }) === 0,
  );
  return match ?? null;
}

function normalizeOccasion(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return (OCCASION_VALUES as readonly string[]).includes(normalized) ? normalized : null;
}

/**
 * No confiamos ciegamente en lo que devuelve la IA (Regla 10): se valida la
 * forma con zod y además se normaliza contra nuestras listas curadas — si
 * inventa una localidad u ocasión que no reconocemos, ese campo se
 * descarta en vez de propagarse a la consulta.
 */
export function sanitizeIntent(raw: unknown): SearchIntent {
  const parsed = rawIntentSchema.safeParse(raw);
  if (!parsed.success) {
    return EMPTY_INTENT;
  }
  return {
    people: parsed.data.people,
    budgetTotal: parsed.data.budget_total,
    location: normalizeLocation(parsed.data.location),
    occasion: normalizeOccasion(parsed.data.occasion),
    categoryHint: parsed.data.category_hint?.trim() || null,
    activityPreference: parsed.data.activity_preference?.trim() || null,
  };
}

export function isIntentEmpty(intent: SearchIntent): boolean {
  return (
    intent.people === null &&
    intent.budgetTotal === null &&
    intent.location === null &&
    intent.occasion === null &&
    intent.categoryHint === null &&
    intent.activityPreference === null
  );
}
