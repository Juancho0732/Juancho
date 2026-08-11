import { useQuery } from '@tanstack/react-query';

import { listPlaces, type ListPlacesFilters } from '@/services/supabase/queries';

export function usePlaces(filters: ListPlacesFilters) {
  return useQuery({
    queryKey: ['places', filters],
    queryFn: () => listPlaces(filters),
  });
}
