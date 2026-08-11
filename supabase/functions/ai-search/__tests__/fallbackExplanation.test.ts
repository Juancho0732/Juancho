import { buildFallbackExplanation } from '../fallbackExplanation.ts';
import { EMPTY_INTENT } from '../intentSchema.ts';
import type { PlaceRow } from '../types.ts';

function makePlace(name: string): PlaceRow {
  return {
    id: name,
    name,
    description: null,
    category_id: null,
    tags: [],
    address: null,
    locality: null,
    lat: 0,
    lng: 0,
    price_min: null,
    price_max: null,
    schedule: null,
    rating_avg: 4,
    review_count: 3,
    status: 'active',
    is_mock: true,
    created_at: '2026-01-01T00:00:00Z',
  };
}

describe('buildFallbackExplanation', () => {
  it('avisa cuando no hay resultados, sin inventar nada', () => {
    const message = buildFallbackExplanation(EMPTY_INTENT, []);
    expect(message).toMatch(/no encontramos/i);
  });

  it('menciona solo nombres reales de los lugares recibidos', () => {
    const places = [makePlace('Café Real'), makePlace('Bar Real')];
    const message = buildFallbackExplanation(EMPTY_INTENT, places);
    expect(message).toContain('Café Real');
    expect(message).toContain('Bar Real');
    expect(message).not.toContain('Lugar Inventado');
  });

  it('incorpora los criterios detectados (localidad, presupuesto, ocasión)', () => {
    const message = buildFallbackExplanation(
      { ...EMPTY_INTENT, location: 'Chapinero', budgetTotal: 50000, occasion: 'amigos' },
      [makePlace('Café Real')],
    );
    expect(message).toContain('Chapinero');
    expect(message).toContain('$50.000');
    expect(message).toContain('amigos');
  });
});
