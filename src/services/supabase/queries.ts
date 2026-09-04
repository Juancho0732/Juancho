import type {
  Category,
  Place,
  PlaceImage,
  PlaceListItem,
  PlaceWithDistance,
  Profile,
  Review,
  ReviewWithAuthor,
} from '@/types/database';

import { supabase } from './client';

/**
 * Capa de acceso a datos, tipada, sobre el esquema de supabase/migrations/.
 * Sin lógica de UI. Cada función lanza si Supabase devuelve un error, para que
 * el llamador decida cómo mostrarlo (no lo ocultamos silenciosamente).
 */

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

export type ListPlacesFilters = {
  locality?: string;
  categoryId?: string;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  /**
   * Filtra por un tag de `places.tags` (ej. "romantic", "group_friendly").
   * Genérico a propósito -- el mapeo de un concepto de UI como "ocasión" a un
   * tag concreto vive en la capa de feature (src/features/places/constants.ts),
   * no acá, para no acoplar esta capa de acceso a datos a esa taxonomía.
   */
  tag?: string;
  limit?: number;
  /** Prioridad 7 (paginación): página 0-based en unidades de `limit`, para Search. */
  offset?: number;
};

// Prioridad 13 (rendimiento): Search/Home solo muestran PlaceCard, que nunca
// lee description/tags/address/lat/lng/schedule/source/last_verified_at/
// created_at/is_mock -- pedirlas igual solo agranda cada página de
// resultados sin ningún beneficio. El detalle completo sigue trayendo todo
// (getPlaceById). Filtrar/buscar por una columna (ej. status, description en
// el .or() de abajo) no requiere incluirla en el select.
const PLACE_LIST_COLUMNS = 'id, name, category_id, locality, price_min, price_max, rating_avg, review_count';

export async function listPlaces(filters: ListPlacesFilters = {}): Promise<PlaceListItem[]> {
  let query = supabase.from('places').select(PLACE_LIST_COLUMNS);

  if (filters.search) {
    // Los operadores .or()/.ilike() de PostgREST usan `,()` como sintaxis de
    // filtro; se limpian para que un término de búsqueda con esos caracteres
    // no rompa el filtro ni se interprete como condiciones adicionales.
    const safeTerm = filters.search.replace(/[,()%_]/g, ' ').trim();
    if (safeTerm) {
      query = query.or(`and(name.ilike.%${safeTerm}%,status.eq.active),and(description.ilike.%${safeTerm}%,status.eq.active)`);
    } else {
      query = query.eq('status', 'active');
    }
  } else {
    query = query.eq('status', 'active');
  }

  if (filters.locality) {
    query = query.eq('locality', filters.locality);
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price_min', filters.maxPrice);
  }
  if (filters.minRating !== undefined) {
    query = query.gte('rating_avg', filters.minRating);
  }
  if (filters.tag) {
    query = query.contains('tags', [filters.tag]);
  }

  const limit = filters.limit ?? 30;
  const offset = filters.offset ?? 0;
  // Prioridad 7: `rating_avg` por sí solo no es único (muchos lugares empatan,
  // ej. varios en 3.33) -- sin una segunda columna de desempate, Postgres no
  // garantiza el mismo orden entre páginas paginadas con OFFSET/LIMIT, y
  // Search terminaba mostrando el mismo lugar dos veces (o saltándose otros)
  // al pedir la página siguiente. `id` como desempate hace el orden estable.
  query = query
    .order('rating_avg', { ascending: false })
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export type NearbyPlacesParams = {
  lat: number;
  lng: number;
  maxDistanceKm?: number;
  limit?: number;
};

/** Lugares activos ordenados por cercanía real (RPC `nearby_places`, Fase 5). */
export async function listNearbyPlaces(params: NearbyPlacesParams): Promise<PlaceWithDistance[]> {
  const { data, error } = await supabase.rpc('nearby_places', {
    user_lat: params.lat,
    user_lng: params.lng,
    max_distance_km: params.maxDistanceKm ?? 15,
    result_limit: params.limit ?? 10,
  });
  if (error) throw error;
  return data;
}

/** Lugares personalizados por las señales del propio usuario (RPC `personalized_places`, Fase 8). */
export async function listPersonalizedPlaces(limit = 6): Promise<Place[]> {
  const { data, error } = await supabase.rpc('personalized_places', { result_limit: limit });
  if (error) throw error;
  return data;
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const { data, error } = await supabase.from('places').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listPlaceImages(placeId: string): Promise<PlaceImage[]> {
  const { data, error } = await supabase
    .from('place_images')
    .select('*')
    .eq('place_id', placeId)
    .order('position');
  if (error) throw error;
  return data;
}

/**
 * Prioridad 7 (escalabilidad): sin límite, un lugar muy popular podría ir
 * acumulando cientos/miles de reseñas con los años y esta consulta las
 * traería todas de una. 200 es un límite defensivo generoso para el tamaño
 * de una beta (no hace falta paginación completa todavía, a diferencia de
 * Search) -- si en el futuro un lugar real se acerca a ese límite, ahí sí
 * amerita paginación real.
 */
const REVIEWS_LIMIT = 200;

export async function listReviewsForPlace(placeId: string): Promise<ReviewWithAuthor[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(display_name)')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false })
    .limit(REVIEWS_LIMIT);
  if (error) throw error;
  return data as unknown as ReviewWithAuthor[];
}

export async function listFavoritePlaceIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('place_id').eq('user_id', userId);
  if (error) throw error;
  return data.map((row) => row.place_id);
}

/** Lugares favoritos completos (para la pantalla de Favoritos), más recientes primero. */
export async function listFavoritePlaces(userId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('created_at, places(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data as unknown as { places: Place | null }[])
    .map((row) => row.places)
    .filter((place): place is Place => place !== null);
}

export async function addFavorite(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase.from('favorites').insert({ user_id: userId, place_id: placeId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);
  if (error) throw error;
}

export type UpsertReviewInput = {
  placeId: string;
  userId: string;
  rating: number;
  comment?: string;
  amountPaid?: number;
  occasion?: string;
};

export async function upsertReview(input: UpsertReviewInput): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      {
        place_id: input.placeId,
        user_id: input.userId,
        rating: input.rating,
        comment: input.comment ?? null,
        amount_paid: input.amountPaid ?? null,
        occasion: input.occasion ?? null,
      },
      { onConflict: 'place_id,user_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
}
