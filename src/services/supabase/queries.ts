import type {
  Category,
  Place,
  PlaceImage,
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
  limit?: number;
};

export async function listPlaces(filters: ListPlacesFilters = {}): Promise<Place[]> {
  let query = supabase.from('places').select('*').eq('status', 'active');

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
  if (filters.search) {
    // Los operadores .or()/.ilike() de PostgREST usan `,()` como sintaxis de
    // filtro; se limpian para que un término de búsqueda con esos caracteres
    // no rompa el filtro ni se interprete como condiciones adicionales.
    const safeTerm = filters.search.replace(/[,()%]/g, ' ').trim();
    if (safeTerm) {
      query = query.or(`name.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%`);
    }
  }

  query = query.order('rating_avg', { ascending: false }).limit(filters.limit ?? 30);

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

export async function listReviewsForPlace(placeId: string): Promise<ReviewWithAuthor[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(display_name)')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });
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
