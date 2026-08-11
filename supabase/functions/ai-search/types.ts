/**
 * Tipos de la Edge Function `ai-search`. Deno no puede resolver el alias
 * `@/` del proyecto principal, así que estos tipos son una copia deliberada
 * y mínima de lo que necesita esta función (no todo `Place`) — mantener en
 * sync con supabase/migrations/*_places.sql y src/types/database.ts si el
 * esquema cambia.
 */

export type PlaceRow = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  tags: string[];
  address: string | null;
  locality: string | null;
  lat: number;
  lng: number;
  price_min: number | null;
  price_max: number | null;
  schedule: Record<string, string> | null;
  rating_avg: number;
  review_count: number;
  status: string;
  is_mock: boolean;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

/** Intención estructurada extraída del texto libre del usuario (docs/00-fase0-analisis.md §7). */
export type SearchIntent = {
  people: number | null;
  budgetTotal: number | null;
  location: string | null;
  occasion: string | null;
  categoryHint: string | null;
  activityPreference: string | null;
};

export type RankedPlace = PlaceRow & { score: number };

export type AiSearchSuccess = {
  status: 'ok';
  intent: SearchIntent;
  explanation: string;
  results: RankedPlace[];
};

export type AiSearchClarification = {
  status: 'needs_clarification';
  message: string;
};

export type AiSearchError = {
  status: 'error';
  message: string;
};

export type AiSearchResponse = AiSearchSuccess | AiSearchClarification | AiSearchError;
