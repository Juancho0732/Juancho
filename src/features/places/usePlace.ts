import { useQuery } from '@tanstack/react-query';

import { getPlaceById, listPlaceImages } from '@/services/supabase/queries';

export function usePlace(placeId: string) {
  return useQuery({
    queryKey: ['place', placeId],
    queryFn: () => getPlaceById(placeId),
  });
}

export function usePlaceImages(placeId: string) {
  return useQuery({
    queryKey: ['place-images', placeId],
    queryFn: () => listPlaceImages(placeId),
  });
}
