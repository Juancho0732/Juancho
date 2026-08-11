import { useQuery } from '@tanstack/react-query';

import { listNearbyPlaces } from '@/services/supabase/queries';

import type { Coordinates } from '../location';

export function useNearbyPlaces(coords: Coordinates | null) {
  return useQuery({
    queryKey: ['nearby-places', coords],
    queryFn: () => {
      if (!coords) throw new Error('useNearbyPlaces: coords is null');
      return listNearbyPlaces(coords);
    },
    enabled: coords !== null,
  });
}
