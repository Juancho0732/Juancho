import type { CategoryRow, PlaceRow, RankedPlace, SearchIntent } from './types.ts';

/**
 * Pesos del ranking (docs/00-fase0-analisis.md §8). Documentados y en un
 * solo lugar para poder ajustarlos con datos reales de uso más adelante —
 * no son magia, son un punto de partida:
 * - budget: qué tan mencionado está el presupuesto en los ejemplos de uso.
 * - locality: relevante pero secundario al presupuesto.
 * - rating: señal de calidad.
 * - intentMatch: relevancia semántica (categoría/ocasión/preferencia).
 * - reviewConfidence: evita que 1 reseña de 5★ opaque a 200 de 4.5★.
 */
export const RANKING_WEIGHTS = {
  budget: 0.25,
  locality: 0.2,
  rating: 0.2,
  intentMatch: 0.2,
  reviewConfidence: 0.15,
} as const;

/** Ocasión -> tags de `places` que la representan (ver supabase/seed/generate_seed.py TAGS_POOL). */
const OCCASION_TAGS: Record<string, string[]> = {
  pareja: ['romantic'],
  amigos: ['group_friendly'],
  familia: ['family_friendly'],
  solo: ['quiet'],
  trabajo: ['quiet'],
};

/** 1 = el presupuesto alcanza cómodo; decae mientras más se pasa del rango de precio. */
export function budgetFit(intent: SearchIntent, place: PlaceRow): number {
  if (intent.budgetTotal === null) return 0.5;
  if (place.price_min === null && place.price_max === null) return 0.5;

  const perPerson =
    intent.people && intent.people > 0 ? intent.budgetTotal / intent.people : intent.budgetTotal;
  const priceMin = place.price_min ?? place.price_max ?? 0;
  const priceMax = place.price_max ?? place.price_min ?? 0;

  if (priceMax <= perPerson) return 1;
  if (priceMin > perPerson) {
    const overBy = (priceMin - perPerson) / perPerson;
    return Math.max(0, 1 - overBy);
  }
  return 1; // el presupuesto cae dentro del rango de precio del lugar
}

/** No tenemos distancia real aquí (eso vive en la RPC `nearby_places` de Fase 5); se usa la localidad como proxy categórico. */
export function localityFit(intent: SearchIntent, place: PlaceRow): number {
  if (intent.location === null) return 0.5;
  if (place.locality === null) return 0.3;
  return place.locality === intent.location ? 1 : 0.3;
}

export function ratingScore(place: PlaceRow): number {
  return Math.max(0, Math.min(1, place.rating_avg / 5));
}

export function reviewConfidence(place: PlaceRow): number {
  return Math.max(0, Math.min(1, place.review_count / 10));
}

export function intentMatchScore(
  intent: SearchIntent,
  place: PlaceRow,
  categoryNameById: Map<string, string>,
): number {
  const scores: number[] = [];

  if (intent.categoryHint) {
    const categoryName = place.category_id ? categoryNameById.get(place.category_id) : undefined;
    const hint = intent.categoryHint.toLowerCase();
    const matches = categoryName
      ? categoryName.toLowerCase().includes(hint) || hint.includes(categoryName.toLowerCase())
      : false;
    scores.push(matches ? 1 : 0.2);
  }

  if (intent.occasion) {
    const relatedTags = OCCASION_TAGS[intent.occasion] ?? [];
    scores.push(relatedTags.some((tag) => place.tags.includes(tag)) ? 1 : 0.4);
  }

  if (intent.activityPreference) {
    const preference = intent.activityPreference.toLowerCase();
    const haystack = `${place.description ?? ''} ${place.tags.join(' ')}`.toLowerCase();
    scores.push(haystack.includes(preference) ? 1 : 0.5);
  }

  if (scores.length === 0) return 0.5;
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

export function scorePlace(
  intent: SearchIntent,
  place: PlaceRow,
  categoryNameById: Map<string, string>,
): number {
  const score =
    RANKING_WEIGHTS.budget * budgetFit(intent, place) +
    RANKING_WEIGHTS.locality * localityFit(intent, place) +
    RANKING_WEIGHTS.rating * ratingScore(place) +
    RANKING_WEIGHTS.intentMatch * intentMatchScore(intent, place, categoryNameById) +
    RANKING_WEIGHTS.reviewConfidence * reviewConfidence(place);
  return Math.round(score * 1000) / 1000;
}

/** La IA nunca decide el orden (Regla 10) — esta función, determinística, sí. */
export function rankPlaces(
  intent: SearchIntent,
  places: PlaceRow[],
  categories: CategoryRow[],
  limit = 6,
): RankedPlace[] {
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  return places
    .map((place) => ({ ...place, score: scorePlace(intent, place, categoryNameById) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
