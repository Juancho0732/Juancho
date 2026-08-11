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

jest.mock('@/services/supabase/client', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

// eslint-disable-next-line import/first -- el mock de arriba debe declararse antes de importar '../queries'
import {
  addFavorite,
  listFavoritePlaceIds,
  listFavoritePlaces,
  listPlaces,
  removeFavorite,
} from '../queries';

beforeEach(() => {
  mockFrom.mockReset();
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
