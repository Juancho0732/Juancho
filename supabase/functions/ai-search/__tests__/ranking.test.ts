import { EMPTY_INTENT } from '../intentSchema.ts';
import { budgetFit, intentMatchScore, localityFit, rankPlaces, ratingScore } from '../ranking.ts';
import type { CategoryRow, PlaceRow, SearchIntent } from '../types.ts';

function makePlace(overrides: Partial<PlaceRow> = {}): PlaceRow {
  return {
    id: 'place-1',
    name: 'Lugar de prueba',
    description: null,
    category_id: null,
    tags: [],
    address: null,
    locality: null,
    lat: 4.65,
    lng: -74.05,
    price_min: 30000,
    price_max: 50000,
    schedule: null,
    rating_avg: 4,
    review_count: 5,
    status: 'active',
    is_mock: true,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function intent(overrides: Partial<SearchIntent> = {}): SearchIntent {
  return { ...EMPTY_INTENT, ...overrides };
}

describe('budgetFit', () => {
  it('es neutral (0.5) cuando no hay presupuesto en la intención', () => {
    expect(budgetFit(intent(), makePlace())).toBe(0.5);
  });

  it('es 1 cuando el precio del lugar cae dentro del presupuesto', () => {
    const place = makePlace({ price_min: 20000, price_max: 40000 });
    expect(budgetFit(intent({ budgetTotal: 50000 }), place)).toBe(1);
  });

  it('decae mientras más se pasa del presupuesto', () => {
    const place = makePlace({ price_min: 100000, price_max: 150000 });
    const score = budgetFit(intent({ budgetTotal: 50000 }), place);
    expect(score).toBeLessThan(1);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('divide el presupuesto total entre el número de personas', () => {
    const place = makePlace({ price_min: 20000, price_max: 25000 });
    // $100.000 / 4 personas = $25.000 por persona -> alcanza
    expect(budgetFit(intent({ budgetTotal: 100000, people: 4 }), place)).toBe(1);
  });
});

describe('localityFit', () => {
  it('es neutral cuando no hay localidad en la intención', () => {
    expect(localityFit(intent(), makePlace())).toBe(0.5);
  });

  it('es 1 cuando coincide exactamente', () => {
    expect(localityFit(intent({ location: 'Chapinero' }), makePlace({ locality: 'Chapinero' }))).toBe(1);
  });

  it('penaliza (no anula) cuando no coincide', () => {
    const score = localityFit(intent({ location: 'Chapinero' }), makePlace({ locality: 'Suba' }));
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

describe('ratingScore', () => {
  it('normaliza el rating de 0-5 a 0-1', () => {
    expect(ratingScore(makePlace({ rating_avg: 5 }))).toBe(1);
    expect(ratingScore(makePlace({ rating_avg: 0 }))).toBe(0);
    expect(ratingScore(makePlace({ rating_avg: 2.5 }))).toBe(0.5);
  });
});

describe('intentMatchScore', () => {
  const categories = new Map<string, string>([['cat-1', 'Bares y Rooftops']]);

  it('es neutral cuando la intención no aporta ninguna señal', () => {
    expect(intentMatchScore(intent(), makePlace(), categories)).toBe(0.5);
  });

  it('premia cuando la categoría coincide con la pista de la IA', () => {
    const place = makePlace({ category_id: 'cat-1' });
    const score = intentMatchScore(intent({ categoryHint: 'bar' }), place, categories);
    expect(score).toBe(1);
  });

  it('premia cuando los tags coinciden con la ocasión', () => {
    const place = makePlace({ tags: ['romantic', 'outdoor'] });
    const score = intentMatchScore(intent({ occasion: 'pareja' }), place, categories);
    expect(score).toBe(1);
  });
});

describe('rankPlaces', () => {
  const categories: CategoryRow[] = [{ id: 'cat-1', name: 'Bares y Rooftops', slug: 'bares-rooftops' }];

  it('ordena de mayor a menor score y no deja que la IA decida el orden (es puro/determinístico)', () => {
    const places = [
      makePlace({ id: 'barato-buen-rating', price_min: 20000, price_max: 25000, rating_avg: 4.8, review_count: 20 }),
      makePlace({ id: 'caro-mal-rating', price_min: 200000, price_max: 250000, rating_avg: 2, review_count: 1 }),
    ];

    const ranked = rankPlaces(intent({ budgetTotal: 50000 }), places, categories);

    expect(ranked[0]?.id).toBe('barato-buen-rating');
    expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? 0);
  });

  it('respeta el límite de resultados', () => {
    const places = Array.from({ length: 10 }, (_, i) => makePlace({ id: `place-${i}` }));
    expect(rankPlaces(intent(), places, categories, 3)).toHaveLength(3);
  });

  it('produce el mismo resultado dos veces para la misma entrada (determinístico)', () => {
    const places = [makePlace({ id: 'a' }), makePlace({ id: 'b', rating_avg: 3 })];
    const first = rankPlaces(intent({ location: 'Chapinero' }), places, categories);
    const second = rankPlaces(intent({ location: 'Chapinero' }), places, categories);
    expect(first).toEqual(second);
  });
});
