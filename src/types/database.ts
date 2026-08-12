/**
 * Tipos que reflejan el esquema SQL de supabase/migrations/. Si el esquema
 * cambia, actualizar aquí en el mismo PR que la migración.
 */

export type PlaceStatus = 'active' | 'inactive' | 'pending';

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
};

export type PlaceSchedule = Record<string, string>;

export type Place = {
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
  schedule: PlaceSchedule | null;
  rating_avg: number;
  review_count: number;
  status: PlaceStatus;
  is_mock: boolean;
  /** Trazabilidad de datos reales (is_mock = false); null en lugares MOCK. */
  source: string | null;
  last_verified_at: string | null;
  created_at: string;
};

export type PlaceImage = {
  id: string;
  place_id: string;
  url: string;
  position: number;
  created_at: string;
};

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  amount_paid: number | null;
  occasion: string | null;
  created_at: string;
  updated_at: string;
};

/** `listReviewsForPlace` incluye el nombre del autor vía join con `profiles`. */
export type ReviewWithAuthor = Review & {
  profiles: { display_name: string } | null;
};

export type Favorite = {
  user_id: string;
  place_id: string;
  created_at: string;
};

/** Resultado de la RPC `nearby_places` (Fase 5): un `Place` + distancia en metros. */
export type PlaceWithDistance = Place & { distance_m: number };

/**
 * Subconjunto de columnas de `places` que de verdad usa una tarjeta de lista
 * (`PlaceCard`) -- Search/Home no necesitan `description`/`tags`/`address`/
 * `lat`/`lng`/`schedule`/`source`/`last_verified_at`/`created_at`/`is_mock`,
 * que solo agrandarían el payload de cada página de resultados sin ningún
 * beneficio (Prioridad 13: pensado para escalar de 72 a cientos/miles de
 * lugares). El detalle completo de un lugar sigue trayendo todo
 * (`getPlaceById` → `Place`); esto es específicamente para `listPlaces`
 * (Search, "Lugares populares" de Home).
 */
export type PlaceListItem = Pick<
  Place,
  'id' | 'name' | 'category_id' | 'locality' | 'price_min' | 'price_max' | 'rating_avg' | 'review_count'
>;
