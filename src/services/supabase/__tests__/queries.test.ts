type Call = { method: string; args: unknown[] };

/**
 * Mock mínimo, encadenable, del query builder de supabase-js. Registra cada
 * llamada (.eq, .lte, .or, .order, .limit, ...) para poder verificar que
 * listPlaces/favorites arman el filtro correcto, y es "thenable" para que
 * `await query` funcione igual que con el cliente real.
 */
function createQueryBuilder(result: { data: unknown; error: unknown }) {
  const calls: Call[] = [];
  const chain = (method: string) =>
    jest.fn((...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    });

  const builder: Record<string, unknown> = {
    select: chain('select'),
    eq: chain('eq'),
    lte: chain('lte'),
    gte: chain('gte'),
    or: chain('or'),
    order: chain('order'),
    limit: chain('limit'),
    insert: chain('insert'),
    delete: chain('delete'),
    upsert: chain('upsert'),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    single: jest.fn(() => Promise.resolve(result)),
    then: (onResolve: (value: typeof result) => unknown) => Promise.resolve(result).then(onResolve),
  };

  return { builder, calls };
}

const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/services/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

// eslint-disable-next-line import/first -- el mock de arriba debe declararse antes de importar '../queries'
import {
  addFavorite,
  deleteReview,
  listFavoritePlaceIds,
  listFavoritePlaces,
  listNearbyPlaces,
  listPersonalizedPlaces,
  listPlaces,
  listReviewsForPlace,
  removeFavorite,
  upsertReview,
} from '../queries';

beforeEach(() => {
  mockFrom.mockReset();
  mockRpc.mockReset();
});

describe('listPlaces', () => {
  it('siempre filtra por status activo y ordena por rating', async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null });
    mockFrom.mockReturnValue(builder);

    await listPlaces();

    expect(mockFrom).toHaveBeenCalledWith('places');
    expect(calls).toContainEqual({ method: 'eq', args: ['status', 'active'] });
    expect(calls).toContainEqual({ method: 'order', args: ['rating_avg', { ascending: false }] });
    expect(calls).toContainEqual({ method: 'limit', args: [30] });
  });

  it('aplica locality, categoryId, maxPrice y minRating cuando se pasan', async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null });
    mockFrom.mockReturnValue(builder);

    await listPlaces({
      locality: 'Chapinero',
      categoryId: 'cat-1',
      maxPrice: 60000,
      minRating: 4,
      limit: 5,
    });

    expect(calls).toContainEqual({ method: 'eq', args: ['locality', 'Chapinero'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['category_id', 'cat-1'] });
    expect(calls).toContainEqual({ method: 'lte', args: ['price_min', 60000] });
    expect(calls).toContainEqual({ method: 'gte', args: ['rating_avg', 4] });
    expect(calls).toContainEqual({ method: 'limit', args: [5] });
  });

  it('busca por nombre y descripción con el término saneado', async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null });
    mockFrom.mockReturnValue(builder);

    await listPlaces({ search: 'café, (rico) 50%' });

    const orCall = calls.find((call) => call.method === 'or');
    expect(orCall?.args[0]).toBe(
      'name.ilike.%café   rico  50%,description.ilike.%café   rico  50%',
    );
  });

  it('no agrega el filtro .or() si el término queda vacío tras sanear', async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null });
    mockFrom.mockReturnValue(builder);

    await listPlaces({ search: ',(),' });

    expect(calls.find((call) => call.method === 'or')).toBeUndefined();
  });

  it('lanza el error de Supabase en vez de devolver datos parciales', async () => {
    const { builder } = createQueryBuilder({ data: null, error: new Error('boom') });
    mockFrom.mockReturnValue(builder);

    await expect(listPlaces()).rejects.toThrow('boom');
  });
});

describe('favorites', () => {
  it('addFavorite inserta user_id y place_id', async () => {
    const { builder, calls } = createQueryBuilder({ data: null, error: null });
    mockFrom.mockReturnValue(builder);

    await addFavorite('user-1', 'place-1');

    expect(mockFrom).toHaveBeenCalledWith('favorites');
    expect(calls).toContainEqual({
      method: 'insert',
      args: [{ user_id: 'user-1', place_id: 'place-1' }],
    });
  });

  it('removeFavorite borra por user_id y place_id', async () => {
    const { builder, calls } = createQueryBuilder({ data: null, error: null });
    mockFrom.mockReturnValue(builder);

    await removeFavorite('user-1', 'place-1');

    expect(calls).toContainEqual({ method: 'delete', args: [] });
    expect(calls).toContainEqual({ method: 'eq', args: ['user_id', 'user-1'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['place_id', 'place-1'] });
  });

  it('listFavoritePlaceIds devuelve solo los place_id', async () => {
    const { builder } = createQueryBuilder({
      data: [{ place_id: 'a' }, { place_id: 'b' }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    await expect(listFavoritePlaceIds('user-1')).resolves.toEqual(['a', 'b']);
  });

  it('listFavoritePlaces aplana la relación y descarta lugares eliminados', async () => {
    const { builder } = createQueryBuilder({
      data: [
        { created_at: '2024-01-01', places: { id: 'a', name: 'A' } },
        { created_at: '2024-01-02', places: null },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const result = await listFavoritePlaces('user-1');

    expect(result).toEqual([{ id: 'a', name: 'A' }]);
  });
});

describe('listNearbyPlaces', () => {
  it('llama a la RPC nearby_places con los parámetros correctos', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await listNearbyPlaces({ lat: 4.65, lng: -74.05, maxDistanceKm: 5, limit: 8 });

    expect(mockRpc).toHaveBeenCalledWith('nearby_places', {
      user_lat: 4.65,
      user_lng: -74.05,
      max_distance_km: 5,
      result_limit: 8,
    });
  });

  it('usa 15 km y 10 resultados por defecto', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await listNearbyPlaces({ lat: 4.65, lng: -74.05 });

    expect(mockRpc).toHaveBeenCalledWith('nearby_places', {
      user_lat: 4.65,
      user_lng: -74.05,
      max_distance_km: 15,
      result_limit: 10,
    });
  });

  it('lanza el error de Supabase en vez de devolver datos parciales', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('boom') });

    await expect(listNearbyPlaces({ lat: 0, lng: 0 })).rejects.toThrow('boom');
  });
});

describe('listPersonalizedPlaces', () => {
  it('llama a la RPC personalized_places con el límite pedido', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await listPersonalizedPlaces(4);

    expect(mockRpc).toHaveBeenCalledWith('personalized_places', { result_limit: 4 });
  });

  it('usa 6 resultados por defecto', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await listPersonalizedPlaces();

    expect(mockRpc).toHaveBeenCalledWith('personalized_places', { result_limit: 6 });
  });

  it('lanza el error de Supabase en vez de devolver datos parciales', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('boom') });

    await expect(listPersonalizedPlaces()).rejects.toThrow('boom');
  });
});

describe('reviews', () => {
  it('listReviewsForPlace incluye el nombre del autor vía join con profiles', async () => {
    const { builder, calls } = createQueryBuilder({
      data: [{ id: 'r1', place_id: 'place-1', profiles: { display_name: 'Ana' } }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const result = await listReviewsForPlace('place-1');

    expect(mockFrom).toHaveBeenCalledWith('reviews');
    expect(calls).toContainEqual({ method: 'select', args: ['*, profiles(display_name)'] });
    expect(calls).toContainEqual({ method: 'eq', args: ['place_id', 'place-1'] });
    expect(calls).toContainEqual({ method: 'order', args: ['created_at', { ascending: false }] });
    expect(result[0]?.profiles?.display_name).toBe('Ana');
  });

  it('upsertReview usa onConflict place_id,user_id para poder editar', async () => {
    const { builder, calls } = createQueryBuilder({
      data: { id: 'r1', place_id: 'place-1', user_id: 'user-1', rating: 5 },
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    await upsertReview({
      placeId: 'place-1',
      userId: 'user-1',
      rating: 5,
      comment: 'Excelente',
      amountPaid: 50000,
      occasion: 'pareja',
    });

    expect(mockFrom).toHaveBeenCalledWith('reviews');
    expect(calls).toContainEqual({
      method: 'upsert',
      args: [
        {
          place_id: 'place-1',
          user_id: 'user-1',
          rating: 5,
          comment: 'Excelente',
          amount_paid: 50000,
          occasion: 'pareja',
        },
        { onConflict: 'place_id,user_id' },
      ],
    });
  });

  it('upsertReview convierte campos opcionales ausentes a null', async () => {
    const { builder, calls } = createQueryBuilder({ data: {}, error: null });
    mockFrom.mockReturnValue(builder);

    await upsertReview({ placeId: 'place-1', userId: 'user-1', rating: 3 });

    expect(calls).toContainEqual({
      method: 'upsert',
      args: [
        {
          place_id: 'place-1',
          user_id: 'user-1',
          rating: 3,
          comment: null,
          amount_paid: null,
          occasion: null,
        },
        { onConflict: 'place_id,user_id' },
      ],
    });
  });

  it('deleteReview borra por id', async () => {
    const { builder, calls } = createQueryBuilder({ data: null, error: null });
    mockFrom.mockReturnValue(builder);

    await deleteReview('review-1');

    expect(mockFrom).toHaveBeenCalledWith('reviews');
    expect(calls).toContainEqual({ method: 'delete', args: [] });
    expect(calls).toContainEqual({ method: 'eq', args: ['id', 'review-1'] });
  });

  it('propaga el error de Supabase al crear/editar una reseña (ej. rating fuera de rango)', async () => {
    const { builder } = createQueryBuilder({
      data: null,
      error: new Error('new row for relation "reviews" violates check constraint'),
    });
    mockFrom.mockReturnValue(builder);

    await expect(upsertReview({ placeId: 'place-1', userId: 'user-1', rating: 9 })).rejects.toThrow(
      'check constraint',
    );
  });
});
