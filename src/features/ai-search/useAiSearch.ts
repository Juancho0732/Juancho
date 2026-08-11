import { useQuery } from '@tanstack/react-query';

import { runAiSearch } from './api';

export function useAiSearch(query: string | undefined) {
  return useQuery({
    queryKey: ['ai-search', query],
    queryFn: () => runAiSearch(query as string),
    enabled: Boolean(query && query.trim()),
    retry: false,
    // Repetir la misma búsqueda no debería volver a gastar en IA (Regla 13).
    staleTime: 5 * 60_000,
  });
}
