import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth';
import { listFavoritePlaceIds, listFavoritePlaces } from '@/services/supabase/queries';

export function useFavoriteIds() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['favorite-ids', userId],
    queryFn: () => listFavoritePlaceIds(userId as string),
    enabled: Boolean(userId),
  });
}

export function useFavoritePlaces() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['favorite-places', userId],
    queryFn: () => listFavoritePlaces(userId as string),
    enabled: Boolean(userId),
  });
}
