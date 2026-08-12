import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { Place } from '@/types/database';

const mockListPlaces = jest.fn();

jest.mock('@/services/supabase/queries', () => ({
  listPlaces: (...args: unknown[]) => mockListPlaces(...args),
}));

// eslint-disable-next-line import/first -- el mock de arriba debe declararse antes de importar el hook
import { PLACES_PAGE_SIZE, usePlacesInfinite } from '../usePlacesInfinite';

function makePlace(id: string): Place {
  return {
    id,
    name: `Lugar ${id}`,
    description: null,
    category_id: null,
    tags: [],
    address: null,
    locality: null,
    lat: 4.65,
    lng: -74.05,
    price_min: null,
    price_max: null,
    schedule: null,
    rating_avg: 4,
    review_count: 0,
    status: 'active',
    is_mock: true,
    created_at: '2026-01-01T00:00:00Z',
    source: null,
    last_verified_at: null,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('usePlacesInfinite', () => {
  beforeEach(() => {
    mockListPlaces.mockReset();
  });

  it('pide la primera página con offset 0', async () => {
    mockListPlaces.mockResolvedValue(Array.from({ length: PLACES_PAGE_SIZE }, (_, i) => makePlace(`${i}`)));
    const { result } = await renderHook(() => usePlacesInfinite({ locality: 'Chapinero' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListPlaces).toHaveBeenCalledWith({
      locality: 'Chapinero',
      limit: PLACES_PAGE_SIZE,
      offset: 0,
    });
  });

  it('hasNextPage es true cuando la página vino llena, false cuando vino incompleta', async () => {
    mockListPlaces.mockResolvedValue(Array.from({ length: PLACES_PAGE_SIZE }, (_, i) => makePlace(`${i}`)));
    const full = await renderHook(() => usePlacesInfinite({}), { wrapper });
    await waitFor(() => expect(full.result.current.isSuccess).toBe(true));
    expect(full.result.current.hasNextPage).toBe(true);

    mockListPlaces.mockResolvedValue([makePlace('x')]);
    const partial = await renderHook(() => usePlacesInfinite({}), { wrapper });
    await waitFor(() => expect(partial.result.current.isSuccess).toBe(true));
    expect(partial.result.current.hasNextPage).toBe(false);
  });

  it('fetchNextPage pide la siguiente página con el offset correcto (Prioridad 7)', async () => {
    mockListPlaces.mockResolvedValue(Array.from({ length: PLACES_PAGE_SIZE }, (_, i) => makePlace(`${i}`)));
    const { result } = await renderHook(() => usePlacesInfinite({}), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    mockListPlaces.mockClear();
    mockListPlaces.mockResolvedValue([makePlace('next')]);

    let fetchResult: Awaited<ReturnType<typeof result.current.fetchNextPage>> | undefined;
    await act(async () => {
      fetchResult = await result.current.fetchNextPage();
    });

    expect(fetchResult?.data?.pages.length).toBe(2);
    expect(mockListPlaces).toHaveBeenCalledWith({ limit: PLACES_PAGE_SIZE, offset: PLACES_PAGE_SIZE });
  });
});
