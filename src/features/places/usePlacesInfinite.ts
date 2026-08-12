import { useInfiniteQuery } from '@tanstack/react-query';

import { listPlaces, type ListPlacesFilters } from '@/services/supabase/queries';

export const PLACES_PAGE_SIZE = 20;

type InfiniteFilters = Omit<ListPlacesFilters, 'limit' | 'offset'>;

/**
 * Prioridad 7 (paginación): Search puede recibir cientos/miles de lugares
 * según los filtros -- en vez de un límite fijo sin forma de ver más, cada
 * página trae `PLACES_PAGE_SIZE` y se van pidiendo más al llegar al final de
 * la lista. `getNextPageParam` decide que no hay más páginas cuando la
 * última trajo menos de una página completa (evita una consulta de conteo
 * aparte solo para saber si "hay más").
 */
export function usePlacesInfinite(filters: InfiniteFilters) {
  return useInfiniteQuery({
    queryKey: ['places', 'infinite', filters],
    queryFn: ({ pageParam }) => listPlaces({ ...filters, limit: PLACES_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PLACES_PAGE_SIZE ? undefined : allPages.length * PLACES_PAGE_SIZE,
  });
}
