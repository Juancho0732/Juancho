import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteReview, upsertReview, type UpsertReviewInput } from '@/services/supabase/queries';

/**
 * El rating cacheado en `places` (rating_avg/review_count) lo recalcula un
 * trigger en la base de datos (Fase 2) en cada INSERT/UPDATE/DELETE de
 * reviews — por eso, además de la lista de reseñas, hay que invalidar el
 * detalle del lugar y los listados (Home/Search/Cerca de ti) para que
 * reflejen el nuevo promedio.
 */
function invalidatePlaceQueries(queryClient: ReturnType<typeof useQueryClient>, placeId: string) {
  queryClient.invalidateQueries({ queryKey: ['reviews', placeId] });
  queryClient.invalidateQueries({ queryKey: ['place', placeId] });
  queryClient.invalidateQueries({ queryKey: ['places'] });
  queryClient.invalidateQueries({ queryKey: ['nearby-places'] });
  queryClient.invalidateQueries({ queryKey: ['favorite-places'] });
}

export function useUpsertReview(placeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertReviewInput) => upsertReview(input),
    onSuccess: () => invalidatePlaceQueries(queryClient, placeId),
  });
}

export function useDeleteReview(placeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => invalidatePlaceQueries(queryClient, placeId),
  });
}
