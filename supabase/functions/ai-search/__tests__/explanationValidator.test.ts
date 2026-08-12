import { isExplanationSafe } from '../explanationValidator.ts';
import type { PlaceRow } from '../types.ts';

function makePlace(overrides: Partial<PlaceRow> = {}): PlaceRow {
  return {
    id: 'place-1',
    name: 'Café de Prueba',
    description: 'Un café tranquilo con buen espacio para trabajar',
    category_id: null,
    tags: ['quiet'],
    address: null,
    locality: 'Chapinero',
    lat: 4.65,
    lng: -74.05,
    price_min: 10000,
    price_max: 20000,
    schedule: null,
    rating_avg: 4.5,
    review_count: 12,
    status: 'active',
    is_mock: true,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('isExplanationSafe — explicaciones legítimas (no deben bloquearse)', () => {
  it('acepta una explicación normal que menciona el lugar real, su localidad y un precio real', () => {
    const results = [makePlace()];
    const explanation =
      'Encontramos Café de Prueba en Chapinero, un lugar tranquilo desde $10.000, con buena calificación.';
    expect(isExplanationSafe(explanation, results)).toBe(true);
  });

  it('acepta una explicación con varios lugares reales', () => {
    const results = [
      makePlace({ id: 'a', name: 'Rincón Cometa Social', price_min: 16550, price_max: 64805 }),
      makePlace({ id: 'b', name: 'Casa Solar Café', price_min: 8871, price_max: 24115 }),
    ];
    const explanation =
      'Encontramos 2 lugares en Chapinero, con un presupuesto cercano a $50.000. ' +
      'Entre los mejor calificados: Rincón Cometa Social y Casa Solar Café.';
    expect(isExplanationSafe(explanation, results)).toBe(true);
  });

  it('acepta una explicación que solo menciona la localidad, sin nombres propios adicionales', () => {
    const results = [makePlace()];
    expect(isExplanationSafe('En Chapinero tenemos buenas opciones para tu plan con amigos.', results)).toBe(
      true,
    );
  });

  it('acepta una explicación sin ninguna cifra de dinero', () => {
    const results = [makePlace()];
    expect(
      isExplanationSafe('Estos lugares tienen buena calificación y encajan con lo que buscás.', results),
    ).toBe(true);
  });

  it('rechaza una explicación vacía', () => {
    expect(isExplanationSafe('', [makePlace()])).toBe(false);
    expect(isExplanationSafe('   ', [makePlace()])).toBe(false);
  });
});

describe('isExplanationSafe — afirmaciones categóricas no respaldadas', () => {
  it.each([
    'Café de Prueba es el mejor lugar de la ciudad.',
    'Sin duda es la mejor opción que vas a encontrar.',
    'Este lugar es garantizado, nunca falla.',
    'Es 100% recomendado, indiscutiblemente.',
    'Es el lugar perfecto para vos.',
  ])('rechaza: %s', (explanation) => {
    expect(isExplanationSafe(explanation, [makePlace()])).toBe(false);
  });
});

describe('isExplanationSafe — cifras de precio no respaldadas', () => {
  it('rechaza un precio muy por fuera del rango real de los resultados', () => {
    const results = [makePlace({ price_min: 10000, price_max: 20000 })];
    expect(isExplanationSafe('Este lugar cuesta $5.000.000 por persona.', results)).toBe(false);
  });

  it('rechaza cualquier cifra de dinero si ningún resultado tiene precio real', () => {
    const results = [makePlace({ price_min: null, price_max: null })];
    expect(isExplanationSafe('Cuesta $20.000 por persona.', results)).toBe(false);
  });

  it('acepta un precio dentro del rango real (con tolerancia por redondeo)', () => {
    const results = [makePlace({ price_min: 10000, price_max: 20000 })];
    expect(isExplanationSafe('Este lugar cuesta desde $10.000.', results)).toBe(true);
  });

  it('acepta "80 mil" cuando cae dentro de la tolerancia del rango real', () => {
    const results = [makePlace({ price_min: 60000, price_max: 90000 })];
    expect(isExplanationSafe('Cuesta cerca de 80 mil por persona.', results)).toBe(true);
  });
});

describe('isExplanationSafe — referencias a lugares fuera de los resultados', () => {
  it('rechaza un nombre de lugar inventado que no está en results', () => {
    const results = [makePlace()];
    expect(isExplanationSafe('Te recomiendo Restaurante Fantasma en el centro.', results)).toBe(false);
  });

  it('no confunde un verbo de arranque de frase + el nombre real con un lugar inventado', () => {
    const results = [makePlace({ name: 'Casa Solar Café' })];
    expect(isExplanationSafe('Encontramos Casa Solar Café, un lugar tranquilo.', results)).toBe(true);
  });
});

describe('isExplanationSafe — contenido reputacional negativo no respaldado', () => {
  it.each([
    'Este lugar está cerrado y es una estafa.',
    'Es pésimo, mejor evítalo.',
    'Ese lugar es peligroso e ilegal.',
    'Hay denuncias de malas prácticas ahí.',
    'El establecimiento está cerrado actualmente.',
  ])('rechaza: %s', (explanation) => {
    expect(isExplanationSafe(explanation, [makePlace()])).toBe(false);
  });
});
