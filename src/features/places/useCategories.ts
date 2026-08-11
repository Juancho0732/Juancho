import { useQuery } from '@tanstack/react-query';

import { listCategories } from '@/services/supabase/queries';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    // Las categorías casi no cambian; evita refetch constante (Regla 13).
    staleTime: 5 * 60_000,
  });
}
