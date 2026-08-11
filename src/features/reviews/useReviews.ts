import { useQuery } from '@tanstack/react-query';

import { listReviewsForPlace } from '@/services/supabase/queries';

export function useReviewsForPlace(placeId: string) {
  return useQuery({
    queryKey: ['reviews', placeId],
    queryFn: () => listReviewsForPlace(placeId),
  });
}
