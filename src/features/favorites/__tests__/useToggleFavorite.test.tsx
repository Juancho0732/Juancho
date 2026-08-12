import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useToastStore } from '@/components/ui';

const mockAddFavorite = jest.fn();
const mockRemoveFavorite = jest.fn();

jest.mock('@/services/supabase/queries', () => ({
  addFavorite: (...args: unknown[]) => mockAddFavorite(...args),
  removeFavorite: (...args: unknown[]) => mockRemoveFavorite(...args),
}));

jest.mock('@/features/auth', () => ({
  useAuthStore: (selector: (state: { session: { user: { id: string } } }) => unknown) =>
    selector({ session: { user: { id: 'user-1' } } }),
}));

// eslint-disable-next-line import/first -- los mocks de arriba deben declararse antes de importar el hook
import { useToggleFavorite } from '../useToggleFavorite';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useToggleFavorite', () => {
  beforeEach(() => {
    mockAddFavorite.mockReset();
    mockRemoveFavorite.mockReset();
    useToastStore.setState({ message: null });
  });

  it('llama a addFavorite cuando isFavorite es false', async () => {
    mockAddFavorite.mockResolvedValue(undefined);
    const { result } = await renderHook(() => useToggleFavorite(), { wrapper });

    result.current.mutate({ placeId: 'place-1', isFavorite: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAddFavorite).toHaveBeenCalledWith('user-1', 'place-1');
  });

  it('llama a removeFavorite cuando isFavorite es true', async () => {
    mockRemoveFavorite.mockResolvedValue(undefined);
    const { result } = await renderHook(() => useToggleFavorite(), { wrapper });

    result.current.mutate({ placeId: 'place-1', isFavorite: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRemoveFavorite).toHaveBeenCalledWith('user-1', 'place-1');
  });

  it('Prioridad 6: cuando falla, muestra un toast genérico (nunca error.message) en vez de fallar en silencio', async () => {
    mockAddFavorite.mockRejectedValue(new Error('duplicate key value violates unique constraint'));
    const { result } = await renderHook(() => useToggleFavorite(), { wrapper });

    result.current.mutate({ placeId: 'place-1', isFavorite: false });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useToastStore.getState().message).toBe('No se pudo actualizar tu favorito. Intenta de nuevo.');
  });
});
